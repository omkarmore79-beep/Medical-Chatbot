"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is MedAssist AI a real medical tool?",
    a: "No. MedAssist AI is strictly an academic research project built to demonstrate the capabilities of AI in the medical information domain. It should never be used as a substitute for real medical advice, diagnosis, or treatment from a qualified healthcare provider.",
  },
  {
    q: "What data sources does the AI use?",
    a: "The system uses Retrieval-Augmented Generation (RAG) with a curated knowledge base built from publicly available medical literature including MedlinePlus, WHO guidelines, and FDA drug databases. The knowledge base is indexed using FAISS for fast semantic search.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. No personal health information is stored on our servers. All conversations are session-only and are cleared when you close the browser. Uploaded prescription images are processed in-memory and not retained. This is an academic prototype designed with privacy principles in mind.",
  },
  {
    q: "What should I do in a medical emergency?",
    a: "Immediately call your local emergency services (112 in India, 911 in the US). Do NOT use MedAssist AI in emergencies. Time is critical — always prioritize emergency services over any AI tool.",
  },
  {
    q: "What file formats does prescription upload support?",
    a: "We support JPG, PNG, and PDF formats. Clear, well-lit images produce the best OCR results. The system uses Tesseract OCR enhanced with medical terminology post-processing to extract medication names and dosages accurately.",
  },
  {
    q: "Can the AI diagnose my condition?",
    a: "Absolutely not. MedAssist AI provides educational information about symptoms and conditions but cannot and will never provide medical diagnoses. Any diagnostic conclusion must come from a licensed healthcare professional after proper clinical evaluation.",
  },
];

export default function FAQClient() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section section-sm" id="faq" style={{ background: "var(--bg)" as any }}>
      <div className="container-sm">
        <div className="section-header">
          <div className="section-label">❓ FAQ</div>
          <h2 className="section-title">Frequently asked questions</h2>
        </div>

        <div className="faq-list">
          {faqs.map((f, idx) => {
            const isOpen = idx === open;
            return (
              <div key={f.q} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpen(isOpen ? -1 : idx)}
                >
                  {f.q}
                  <span className="faq-chevron">▼</span>
                </button>
                <div className="faq-answer">{f.a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}