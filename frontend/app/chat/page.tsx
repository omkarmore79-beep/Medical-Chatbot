"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Msg = {
  role: "user" | "ai";
  text: string;
  sources?: string[];
  time: string;
};

type StoredMedicine = {
  name: string;
  dosage?: string;
};

type StoredAnalysis = {
  document_type?: string;
  extracted_text?: string;
  analysis?: string;
  medicines?: StoredMedicine[];
  medicines_detected?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getCurrentTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const initialAiMessage: Msg = {
  role: "ai",
  text: `
    <p>Hello! I'm <strong>MedAssist AI</strong>, your academic medical information assistant. 👋</p>
    <p>I can help you with:</p>
    <ul>
      <li>Understanding symptoms (educational info only)</li>
      <li>Drug information and usage guidelines</li>
      <li>Potential drug interactions</li>
      <li>Explaining prescription medications</li>
    </ul>
    <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">⚠️ This is for academic research only. Always consult a doctor for real medical advice.</p>
  `,
  time: "09:00 AM",
};

export default function ChatPage() {
  const [showEmergency, setShowEmergency] = useState(true);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([initialAiMessage]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const autoPromptSentRef = useRef(false);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    const stored = localStorage.getItem("prescription_analysis");
    if (!stored) return;

    try {
      const parsed: StoredAnalysis = JSON.parse(stored);

      if (parsed.document_type === "prescription") {
        const meds =
          parsed.medicines?.length
            ? parsed.medicines
                .map(
                  (m) => `${m.name}${m.dosage ? ` - ${m.dosage}` : ""}`
                )
                .join("<br />")
            : parsed.medicines_detected?.join("<br />") || "No medicines detected";

        setMessages((prev) => {
          const alreadyAdded = prev.some((msg) =>
            msg.text.includes("Prescription context loaded.")
          );
          if (alreadyAdded) return prev;

          return [
            ...prev,
            {
              role: "ai",
              text: `
                <p><strong>Prescription context loaded.</strong></p>
                <p>You can now ask about these medicines:</p>
                <p>${meds}</p>
              `,
              time: getCurrentTime(),
            },
          ];
        });
      } else if (parsed.document_type === "lab_report") {
        setMessages((prev) => {
          const alreadyAdded = prev.some((msg) =>
            msg.text.includes("Lab report context loaded.")
          );
          if (alreadyAdded) return prev;

          return [
            ...prev,
            {
              role: "ai",
              text: `
                <p><strong>Lab report context loaded.</strong></p>
                <p>You can now ask about your uploaded blood report, values, or interpretation.</p>
              `,
              time: getCurrentTime(),
            },
          ];
        });
      }
    } catch (error) {
      console.error("Failed to parse prescription_analysis:", error);
    }
  }, []);

  useEffect(() => {
    const autoPrompt = localStorage.getItem("auto_chat_prompt");
    if (!autoPrompt || autoPromptSentRef.current) return;

    autoPromptSentRef.current = true;
    localStorage.removeItem("auto_chat_prompt");

    const timer = setTimeout(() => {
      send(autoPrompt);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: trimmed,
        time: getCurrentTime(),
      },
    ]);

    setInput("");
    setTyping(true);

    let finalQuery = trimmed;

    try {
      const stored = localStorage.getItem("prescription_analysis");

      if (stored) {
        const parsed: StoredAnalysis = JSON.parse(stored);

        if (parsed.document_type === "prescription") {
          const medLines =
            parsed.medicines_detected?.join(", ") ||
            parsed.medicines
              ?.map((m) => `${m.name}${m.dosage ? ` - ${m.dosage}` : ""}`)
              .join(", ") ||
            parsed.extracted_text ||
            "";

          if (medLines) {
            finalQuery = `
Uploaded prescription context:
${medLines}

User question:
${trimmed}
            `.trim();
          }
        } else if (parsed.document_type === "lab_report") {
          const labText =
            parsed.extracted_text ||
            parsed.analysis ||
            JSON.stringify(parsed);

          if (labText) {
            finalQuery = `
Uploaded lab report context:
${labText}

User question:
${trimmed}
            `.trim();
          }
        }
      }

      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: finalQuery,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const formattedAnswer = (data.answer || "No response generated.").replace(
        /\n/g,
        "<br />"
      );

      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `<p>${formattedAnswer}</p>`,
          sources: data.sources || [],
          time: getCurrentTime(),
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `
            <p>⚠️ Unable to connect to backend.</p>
            <p>Please make sure:</p>
            <ul>
              <li>FastAPI server is running</li>
              <li>Backend URL is correct</li>
              <li>CORS is enabled in backend</li>
            </ul>
          `,
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function startNewChat() {
    setMessages([initialAiMessage]);
    setInput("");
    localStorage.removeItem("auto_chat_prompt");
  }

  return (
    <>
      <Navbar />

      {showEmergency && (
        <div className="emergency-banner" id="emergencyBanner">
          <div>
            🚨 <strong>EMERGENCY?</strong> If experiencing chest pain,
            difficulty breathing, or other emergencies — call{" "}
            <strong>112 / 911 immediately.</strong> Do not use this chatbot.
          </div>
          <button
            className="emergency-close"
            onClick={() => setShowEmergency(false)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="sidebar-top">
            <button className="sidebar-new-chat" onClick={startNewChat}>
              ＋ New Chat
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Recent</div>
            <div className="chat-history-item active">
              <span
                className="chat-history-dot"
                style={{ background: "var(--blue)" }}
              ></span>
              <span className="chat-history-text">Current conversation</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Quick Actions</div>
            <div className="quick-actions">
              <button
                className="quick-action"
                onClick={() => send("What could headache and fatigue mean?")}
              >
                <span className="quick-action-icon">🩺</span>
                <span className="quick-action-label">Symptoms</span>
              </button>

              <button
                className="quick-action"
                onClick={() =>
                  send("Tell me about ibuprofen uses and side effects")
                }
              >
                <span className="quick-action-icon">💊</span>
                <span className="quick-action-label">Medicines</span>
              </button>

              <button
                className="quick-action"
                onClick={() => send("Check drug interaction of ibuprofen")}
              >
                <span className="quick-action-icon">⚠️</span>
                <span className="quick-action-label">Interactions</span>
              </button>

              <Link className="quick-action" href="/upload">
                <span className="quick-action-icon">📄</span>
                <span className="quick-action-label">Upload Rx</span>
              </Link>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-settings-btn">
              ⚙️ Settings & Preferences
            </button>
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-topbar">
            <div>
              <div className="chat-topbar-title">
                Symptom & Drug Information
              </div>
              <span className="chat-topbar-subtitle">
                Academic Mode · RAG-powered · Sources cited
              </span>
            </div>

            <button
              className="btn-icon"
              title="Clear chat"
              onClick={startNewChat}
            >
              🗑️
            </button>

            <button
              className="btn-icon"
              title="Export chat"
              onClick={() => alert("Export feature not connected yet")}
            >
              📤
            </button>

            <Link className="btn btn-ghost btn-sm" href="/">
              ← Back
            </Link>
          </div>

          <div className="chat-messages" id="chatMessages" ref={listRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-message ${m.role}`}>
                <div className={`chat-avatar ${m.role}`}>
                  {m.role === "ai" ? "🤖" : "👤"}
                </div>

                <div className="chat-bubble-wrap">
                  <div
                    className="chat-bubble"
                    dangerouslySetInnerHTML={{ __html: m.text }}
                  />

                  {m.role === "ai" && m.sources?.length ? (
                    <div className="chat-sources">
                      {m.sources.map((s) => (
                        <span key={s} className="source-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="chat-timestamp">{m.time}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="chat-message ai" id="typingMsg">
                <div className="chat-avatar ai">🤖</div>
                <div className="chat-bubble-wrap">
                  <div className="typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <div className="chat-disclaimer">
              🔒 Academic use only · No data stored · Not medical advice
            </div>

            <div className="chat-input-box">
              <textarea
                className="chat-input-field"
                placeholder="Ask about symptoms, drugs, interactions…"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />

              <div className="chat-input-actions">
                <Link
                  className="chat-attach-btn"
                  title="Attach prescription"
                  href="/upload"
                >
                  📎
                </Link>

                <button className="chat-mic-btn" title="Voice input">
                  🎤
                </button>

                <button
                  className="chat-send-button"
                  onClick={() => send(input)}
                  disabled={typing}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}