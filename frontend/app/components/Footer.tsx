"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              <div className="nav-logo-icon" style={{ width: 32, height: 32 }}>
                🩺
              </div>
              MedAssist AI
            </div>
            <p className="footer-desc">
              An academic research project exploring AI-powered medical
              information retrieval. Built with Next.js, FastAPI, RAG, and
              FAISS. Not for clinical use.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/#features">Features</Link>
              </li>
              <li>
                <Link href="/#how-it-works">How It Works</Link>
              </li>
              <li>
                <Link href="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">App</div>
            <ul className="footer-links">
              <li>
                <Link href="/chat">Chat Interface</Link>
              </li>
              <li>
                <Link href="/upload">Upload Prescription</Link>
              </li>
              <li>
                <Link href="/about">About Project</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Academic</div>
            <ul className="footer-links">
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Research Paper
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  GitHub Repo
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Contact Team
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            ⚠️ <strong>Medical Disclaimer:</strong> MedAssist AI is for academic
            and educational purposes only. It does not constitute medical
            advice, diagnosis, or treatment. Always seek the advice of your
            physician or other qualified health provider with any questions you
            may have regarding a medical condition.
          </div>
          <div className="footer-copy">© 2024 MedAssist AI · Academic Project</div>
        </div>
      </div>
    </footer>
  );
}