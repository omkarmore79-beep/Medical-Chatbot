import Navbar from "../components/Navbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <div className="about-page">
        <div className="container">
          <Link className="btn btn-ghost btn-sm" style={{ marginBottom: 48 }} href="/">
            ← Back to Home
          </Link>

          <div className="about-hero">
            <div className="section-label">🎓 Academic Project</div>
            <h1 className="about-title">About MedAssist AI</h1>
            <p className="about-desc">
              A final-year research project exploring how Retrieval-Augmented
              Generation can make medical information more accessible — responsibly.
            </p>

            <div className="tech-badges">
              <span className="tech-badge nextjs">▲ Next.js</span>
              <span className="tech-badge fastapi">⚡ FastAPI</span>
              <span className="tech-badge rag">🔍 RAG</span>
              <span className="tech-badge faiss">📊 FAISS</span>
              <span className="tech-badge ocr">👁️ OCR</span>
              <span className="tech-badge python">🐍 Python</span>
            </div>
          </div>

          <div className="section-header">
            <div className="section-label">🔄 Architecture</div>
            <h2 className="section-title">System Flow</h2>
          </div>

          <div className="flow-diagram">
            <div className="flow-steps">
              {[
                ["💬", "User Query"],
                ["🔤", "Query Embedding"],
                ["🔍", "FAISS Search"],
                ["📚", "Retrieve Docs"],
                ["🤖", "LLM Generation"],
                ["✅", "Cited Response"],
              ].map(([icon, label], i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className="flow-step-box">
                    <div className="flow-step-icon">{icon}</div>
                    <div className="flow-step-name">{label}</div>
                  </div>
                  {i !== 5 && <div className="flow-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="section-header" style={{ marginTop: 64 }}>
            <div className="section-label">⚖️ Ethics & Limitations</div>
            <h2 className="section-title">Responsible AI in Healthcare</h2>
          </div>

          <div className="ethics-grid">
            <div className="ethics-card limitation">
              <div className="ethics-card-title">⚠️ Known Limitations</div>
              <ul className="ethics-list">
                <li>Cannot diagnose medical conditions under any circumstances</li>
                <li>Knowledge base may not include very recent medical research</li>
                <li>OCR accuracy depends on prescription image quality</li>
                <li>May not account for individual patient-specific factors</li>
                <li>Drug interaction database is not exhaustive</li>
                <li>Not trained on clinical trial data or proprietary drug databases</li>
              </ul>
            </div>

            <div className="ethics-card ethics">
              <div className="ethics-card-title">🛡️ Ethical Commitments</div>
              <ul className="ethics-list">
                <li>All responses include prominent academic disclaimers</li>
                <li>Sources are always cited for verifiability</li>
                <li>Zero persistent storage of health-related user data</li>
                <li>Emergency escalation prompts built into every session</li>
                <li>Designed with HIPAA awareness principles</li>
                <li>Bias review conducted on training knowledge base</li>
              </ul>
            </div>
          </div>

          <div className="section-header" style={{ marginTop: 64 }}>
            <div className="section-label">👥 Project Team</div>
            <h2 className="section-title">Built by students, for learning</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {[
              ["👨‍💻", "Tanmay Borundiya", "Backend · RAG Pipeline"],
              ["👑", "Omkar More", "Frontend · UX Design"],
              ["👨‍🔬", "Parth Biradar", "ML · FAISS Indexing"],
              ["👩‍⚕️", "Dr. Purva D Thakare", "Mentor"],
            ].map(([icon, name, role]) => (
              <div
                key={name}
                style={{
                  textAlign: "center",
                  padding: 28,
                  background: "var(--white)",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 700, color: "var(--gray-800)" }}>{name}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>
                  {role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
