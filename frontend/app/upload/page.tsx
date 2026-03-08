"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import { useRef, useState } from "react";
import ToastProvider from "../components/toast/ToastProvider";
import { useToast } from "../components/toast/useToast";

type Medicine = {
  name: string;
  dosage?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function UploadInner() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showExtracted, setShowExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [analysisMessage, setAnalysisMessage] = useState("");

  function triggerUpload() {
    inputRef.current?.click();
  }

  async function processFile(file: File) {
    setProcessing(true);
    setShowExtracted(false);
    setExtractedText("");
    setMedicines([]);
    setDocumentType("");
    setAnalysisMessage("");

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/analyze-prescription`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      setDocumentType(data.document_type || "");
      setExtractedText(data.extracted_text || "");
      setMedicines(data.medicines || []);
      setAnalysisMessage(data.analysis || data.answer || "");

      if (data.extracted_text || data.medicines || data.analysis || data.answer) {
        setShowExtracted(true);
        localStorage.setItem("prescription_analysis", JSON.stringify(data));
        showToast("File processed successfully!", "success");
      } else {
        showToast("No readable content found.", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to process prescription/report", "error");
    } finally {
      setProcessing(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleAskInChat() {
    const stored = localStorage.getItem("prescription_analysis");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      const autoPrompt =
        parsed.document_type === "lab_report"
          ? "Please explain this blood report in simple language and tell me the important findings."
          : "Please explain these medicines, their uses, side effects, and precautions.";

      localStorage.setItem("auto_chat_prompt", autoPrompt);
      showToast("Context loaded in chat!", "success");
    } catch (error) {
      console.error("Failed to prepare auto chat prompt:", error);
    }
  }

  return (
    <>
      <Navbar />

      <div className="upload-page">
        <div className="upload-page-inner">
          <Link
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 24 }}
            href="/"
          >
            ← Back to Home
          </Link>

          <div className="section-label">📋 Prescription Upload</div>
          <h1 className="upload-page-title">Upload Your Prescription</h1>
          <p className="upload-page-sub">
            Upload an image or PDF of your prescription to extract medication
            information for educational research.
          </p>

          <div className="upload-grid">
            <div>
              <div
                className={`upload-card ${dragOver ? "drag-over" : ""}`}
                id="uploadCard"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={triggerUpload}
              >
                <div className="upload-icon">📋</div>
                <div className="upload-title">
                  Drag & Drop your prescription
                </div>
                <div className="upload-desc">
                  Drop a prescription image or PDF here, or click to browse your
                  files
                </div>

                <div className="upload-formats">
                  <span className="format-badge">JPG</span>
                  <span className="format-badge">PNG</span>
                  <span className="format-badge">PDF</span>
                </div>

                <div className="upload-or">— or —</div>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerUpload();
                  }}
                >
                  Browse Files
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: "var(--amber-pale)",
                  border: "1px solid #fde68a",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  color: "#92400e",
                }}
              >
                ⚠️ <strong>Privacy Notice:</strong> Uploaded prescriptions are
                processed in-memory only and never stored. This is for
                educational use only.
              </div>
            </div>

            <div>
              <div className="preview-card" style={{ position: "relative" }}>
                {processing && (
                  <div className="processing-overlay" id="processingOverlay">
                    <div className="processing-spinner"></div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--gray-600)",
                      }}
                    >
                      Extracting text with OCR…
                    </div>
                  </div>
                )}

                <div className="preview-card-title">📸 Preview</div>

                <div className="preview-image-area" id="previewArea">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Prescription"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
                      <div>Preview will appear here</div>
                    </div>
                  )}
                </div>

                {showExtracted ? (
                  <div id="extractedSection">
                    {documentType && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: 12,
                          borderRadius: 10,
                          background: "var(--blue-pale)",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Detected Document Type: {documentType}
                      </div>
                    )}

                    {analysisMessage && (
                      <div
                        className="extracted-section"
                        style={{ marginTop: 16 }}
                      >
                        <div className="extracted-label">Analysis</div>
                        <textarea
                          className="extracted-text-area"
                          value={analysisMessage}
                          readOnly
                        />
                      </div>
                    )}

                    <div
                      className="extracted-section"
                      style={{ marginTop: 16 }}
                    >
                      <div className="extracted-label">
                        Extracted Text (Editable)
                      </div>
                      <textarea
                        className="extracted-text-area"
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                      />
                    </div>

                    <div
                      className="extracted-section"
                      style={{ marginTop: 16 }}
                    >
                      <div className="extracted-label">Detected Medicines</div>
                      <div className="medicines-list" id="medicinesList">
                        {medicines.length > 0 ? (
                          medicines.map((med, index) => (
                            <div className="medicine-item" key={index}>
                              <div>
                                <div className="medicine-name">{med.name}</div>
                                <div className="medicine-dosage">
                                  {med.dosage || "No dosage info"}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: 12,
                              color: "var(--gray-600)",
                              fontSize: 14,
                            }}
                          >
                            {documentType === "lab_report"
                              ? "This looks like a lab report, not a prescription medicine list."
                              : "No medicines detected"}
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: 20 }}
                      href="/chat"
                      onClick={handleAskInChat}
                    >
                      💬{" "}
                      {documentType === "lab_report"
                        ? "Ask about this blood report →"
                        : "Ask about these medicines →"}
                    </Link>
                  </div>
                ) : (
                  <div
                    id="demoExtractBtn"
                    style={{ marginTop: 16, textAlign: "center" }}
                  >
                    <button
                      className="btn btn-teal btn-sm"
                      type="button"
                      onClick={triggerUpload}
                    >
                      Upload & Extract
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UploadPage() {
  return (
    <ToastProvider>
      <UploadInner />
    </ToastProvider>
  );
}