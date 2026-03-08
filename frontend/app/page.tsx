import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DisclaimerModal from "./components/DisclaimerModal";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <DisclaimerModal />

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Academic Research Project · 2024
            </div>

            <h1 className="hero-title">
              Medical Chatbot
              <br />
              for <span>Academic</span>
              <br />
              Research
            </h1>

            <p className="hero-subtitle">
              Get AI-powered guidance on symptoms, drug information, and
              potential interactions — all for educational research. Not a
              replacement for professional care.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="/chat">
                💬 Start Chat
              </a>
              <a className="btn btn-secondary btn-lg" href="/upload">
                📄 Upload Prescription
              </a>
            </div>

            <div className="hero-trust">
              <span className="trust-badge">🎓 Academic Project</span>
              <span className="trust-sep">·</span>
              <span className="trust-badge red">🚨 Not for Emergencies</span>
              <span className="trust-sep">·</span>
              <span className="trust-badge amber">⚠️ No Diagnosis</span>
            </div>
          </div>

          {/* Right chat preview */}
          <div className="hero-visual">
            <div className="chat-preview">
              <div className="chat-preview-header">
                <div className="chat-preview-avatar">🩺</div>
                <div className="chat-preview-info">
                  <div className="chat-preview-name">MedAssist AI</div>
                  <div className="chat-preview-status">
                    <span className="status-dot"></span> Online · Academic Mode
                  </div>
                </div>
              </div>

              <div className="chat-preview-body">
                <div className="msg user">
                  <div className="msg-bubble">
                    I have a mild headache and fatigue for 2 days. What could it
                    be?
                  </div>
                </div>

                <div className="msg ai">
                  <div className="msg-avatar">🤖</div>
                  <div>
                    <div className="msg-bubble">
                      Common causes of headache + fatigue include dehydration,
                      tension, poor sleep, or mild viral illness. For persistent
                      symptoms, please consult a doctor.
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="source-chip" style={{ fontSize: 11 }}>
                        MedlinePlus
                      </span>
                      <span className="source-chip" style={{ fontSize: 11 }}>
                        WebMD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="msg ai">
                  <div className="msg-avatar">🤖</div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>

              <div className="chat-preview-input">
                <input
                  className="chat-preview-input-field"
                  placeholder="Ask about symptoms, drugs…"
                  readOnly
                />
                <button className="chat-send-btn">➤</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Row */}
      <div className="trust-row">
        <div className="trust-row-inner">
          <div className="trust-item">
            <span className="trust-item-icon">🎓</span> Academic Research Project
          </div>
          <div className="trust-div"></div>
          <div className="trust-item">
            <span className="trust-item-icon">🚫</span> Not for Medical
            Emergencies
          </div>
          <div className="trust-div"></div>
          <div className="trust-item">
            <span className="trust-item-icon">🩺</span> No Clinical Diagnosis
          </div>
          <div className="trust-div"></div>
          <div className="trust-item">
            <span className="trust-item-icon">🔒</span> Privacy-Aware Design
          </div>
          <div className="trust-div"></div>
          <div className="trust-item">
            <span className="trust-item-icon">📚</span> RAG-Powered Responses
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-label">✨ Features</div>
            <h2 className="section-title">
              Everything you need to explore
              <br />
              medical information
            </h2>
            <p className="section-subtitle">
              Built with RAG, FAISS vector search, and OCR for a comprehensive
              academic research tool.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">🩺</div>
              <div className="feature-title">Symptom Guidance</div>
              <div className="feature-desc">
                Describe your symptoms and receive AI-curated educational
                information about potential causes. Always sourced from
                reputable medical literature.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon teal">💊</div>
              <div className="feature-title">Drug Information</div>
              <div className="feature-desc">
                Look up detailed information about medications including uses,
                mechanisms, common side effects, and general precautions from
                verified sources.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon amber">⚠️</div>
              <div className="feature-title">Drug Interaction Checker</div>
              <div className="feature-desc">
                Check potential interactions between multiple medications.
                Understand risk levels and why certain combinations require
                medical supervision.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">📋</div>
              <div className="feature-title">Prescription Upload (OCR)</div>
              <div className="feature-desc">
                Upload a prescription image or PDF. Our OCR engine extracts
                medication names and dosages, then answers your questions about
                them.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">⚡</div>
              <div className="feature-title">Fast RAG Responses</div>
              <div className="feature-desc">
                Powered by FAISS vector search and Retrieval-Augmented
                Generation for accurate, context-aware answers within seconds.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">🔒</div>
              <div className="feature-title">Privacy-First Design</div>
              <div className="feature-desc">
                No personal health data is stored. All conversations are
                session-only. Designed with HIPAA awareness principles in mind,
                even for academic use.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section hiw-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-label">🔍 How It Works</div>
            <h2 className="section-title">
              From your question to
              <br />
              informed guidance
            </h2>
          </div>

          <div className="hiw-steps">
            <div className="hiw-step">
              <div className="hiw-step-num">💬</div>
              <div className="hiw-step-title">Ask Your Question</div>
              <div className="hiw-step-desc">
                Type symptoms, drug names, or upload a prescription. Plain
                language works perfectly.
              </div>
            </div>

            <div className="hiw-step">
              <div className="hiw-step-num">🔍</div>
              <div className="hiw-step-title">AI Retrieves Info</div>
              <div className="hiw-step-desc">
                RAG + FAISS searches a curated medical knowledge base for the
                most relevant excerpts.
              </div>
            </div>

            <div className="hiw-step">
              <div className="hiw-step-num">🛡️</div>
              <div className="hiw-step-title">Safety Guidance</div>
              <div className="hiw-step-desc">
                Responses include safety notes, source attribution, and clear
                academic context disclaimers.
              </div>
            </div>

            <div className="hiw-step">
              <div className="hiw-step-num">👨‍⚕️</div>
              <div className="hiw-step-title">Consult a Doctor</div>
              <div className="hiw-step-desc">
                We always recommend professional consultation for any real
                medical concern or decision.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-label">💬 Testimonials</div>
            <h2 className="section-title">What students & researchers say</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <div className="testimonial-text">
                "Incredibly useful for our pharmacology class. The drug
                interaction checker helped me understand why certain
                combinations are dangerous — with actual citations!"
              </div>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                  }}
                >
                  S
                </div>
                <div>
                  <div className="author-name">Sarah K.</div>
                  <div className="author-role">Medical Student, Year 3</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <div className="testimonial-text">
                "The OCR prescription upload is a game changer. I photographed
                an old prescription and it instantly identified all the
                medicines for my research project."
              </div>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{
                    background: "linear-gradient(135deg, #f093fb, #f5576c)",
                  }}
                >
                  R
                </div>
                <div>
                  <div className="author-name">Rahul M.</div>
                  <div className="author-role">Pharmacy Researcher</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★☆</div>
              <div className="testimonial-text">
                "I appreciate how clearly it distinguishes between informational
                content and medical advice. The disclaimers are prominent but
                not annoying."
              </div>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{
                    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                  }}
                >
                  A
                </div>
                <div>
                  <div className="author-name">Dr. Anjali R.</div>
                  <div className="author-role">
                    Academic Supervisor (Placeholder)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (accordion) */}
      <FAQSection />

      <Footer />
    </>
  );
}

function FAQSection() {
  // small client-like behavior without "use client" by using details tags
  // But to keep EXACT open/close behavior, we should do client state.
  // We'll do that with a nested client component:
  return <FAQClient />;
}

import FAQClient from "./parts/FAQClient";