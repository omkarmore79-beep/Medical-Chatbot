import os
import re
from typing import Dict
from dotenv import load_dotenv
from brand_mapping import brand_to_generic as MASTER_BRAND_TO_GENERIC

from google import genai
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


# ==============================
# 1️⃣ Load Environment & Gemini
# ==============================

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ==============================
# 2️⃣ Vectorstore Folder Names
# ==============================

VS_SYMPTOMS = "vectorstore_symptoms"
VS_DRUGS = "vectorstore_drugs"
VS_MEDQA = "vectorstore_medqa"
VS_INDIAN_MEDICINE = "vectorstore_indian_medicine"


# ==============================
# 3️⃣ Embeddings
# ==============================

emb = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# ==============================
# 4️⃣ Load Vectorstores (cached)
# ==============================

_db_sym = None
_db_drug = None
_db_qa = None
_db_indian = None


def load_dbs():
    global _db_sym, _db_drug, _db_qa, _db_indian

    if _db_sym is None:
        _db_sym = FAISS.load_local(
            VS_SYMPTOMS,
            emb,
            allow_dangerous_deserialization=True
        )

    if _db_drug is None:
        _db_drug = FAISS.load_local(
            VS_DRUGS,
            emb,
            allow_dangerous_deserialization=True
        )

    if _db_qa is None:
        _db_qa = FAISS.load_local(
            VS_MEDQA,
            emb,
            allow_dangerous_deserialization=True
        )

    if _db_indian is None:
        _db_indian = FAISS.load_local(
            VS_INDIAN_MEDICINE,
            emb,
            allow_dangerous_deserialization=True
        )


# ==============================
# 5️⃣ Brand → Generic Dictionary
# ==============================

brand_to_generic = {
    "dolo 650": "paracetamol",
    "dolo 500": "paracetamol",
    "crocin": "paracetamol",
    "calpol": "paracetamol",
    "combiflam": "ibuprofen paracetamol",
    "glycomet": "metformin",
    "janumet": "sitagliptin metformin",
    "amlong": "amlodipine",
    "telma": "telmisartan",
    "losar": "losartan",
    "atorva": "atorvastatin",
    "thyronorm": "levothyroxine",
    "pantocid": "pantoprazole",
    "omez": "omeprazole",
    "augmentin": "amoxicillin clavulanic acid",
    "azithral": "azithromycin",
    "montek lc": "montelukast levocetirizine",
    "asthalin": "salbutamol",
    "lasix": "furosemide",
    "lantus": "insulin glargine",
    "alprax": "alprazolam",
    "shelcal": "calcium vitamin d3",
    "neurobion forte": "vitamin b1 b6 b12",
}

# Merge full brand map so normalization/classification covers many more Indian brands.
brand_to_generic.update(MASTER_BRAND_TO_GENERIC)


def _build_drug_terms():
    terms = set()

    for brand, generic in brand_to_generic.items():
        b = brand.strip().lower()
        g = generic.strip().lower()

        if len(b) >= 4:
            terms.add(b)

        if len(g) >= 4:
            terms.add(g)

        # Also index meaningful generic tokens for combination medicines.
        for tok in re.findall(r"[a-z]+", g):
            if len(tok) >= 5:
                terms.add(tok)

    return sorted(terms, key=len, reverse=True)


DRUG_TERMS = _build_drug_terms()


def normalize_brand_names(query: str) -> str:
    """
    Replace brand names with generics using word-boundary safe regex.
    Prevents partial word collisions.
    """
    q = query.lower()

    for brand, generic in brand_to_generic.items():
        pattern = r"\b" + re.escape(brand) + r"\b"
        if re.search(pattern, q):
            q = re.sub(pattern, generic, q)

    return q


# ==============================
# 🚨 6️⃣ Emergency Detection
# ==============================

EMERGENCY_KEYWORDS = [
    "chest pain", "tightness in chest",
    "shortness of breath", "difficulty breathing",
    "can't breathe", "unconscious",
    "severe bleeding", "heart attack",
    "stroke", "seizure", "fainting",
    "overdose", "poisoning", "suicidal"
]


def detect_emergency(query: str) -> bool:
    q = query.lower().strip()

    academic_phrases = [
        "what is",
        "tell me about",
        "define",
        "explain",
        "information about",
        "symptoms of",
        "causes of",
        "treatment of",
        "uses of",
        "side effects of",
        "drug interaction"
    ]

    if any(phrase in q for phrase in academic_phrases):
        return False

    return any(word in q for word in EMERGENCY_KEYWORDS)


def emergency_response() -> str:
    return (
        "🚨 MEDICAL EMERGENCY DETECTED\n\n"
        "Your symptoms may indicate a serious or life-threatening condition.\n\n"
        "📞 Please seek immediate medical attention:\n"
        "• Call 108 (Ambulance – India)\n"
        "• Call 112 (National Emergency Helpline – India)\n\n"
        "This AI system cannot provide emergency medical assistance."
    )


# ==============================
# 7️⃣ Query Classification
# ==============================

def classify_query(query: str) -> str:
    q = query.lower()

    if detect_emergency(q):
        return "emergency"

    if any(term in q for term in DRUG_TERMS):
        return "drugs"

    symptom_keywords = [
        "fever", "pain", "vomiting",
        "cough", "headache", "fatigue",
        "sore throat"
    ]

    if any(word in q for word in symptom_keywords):
        return "symptoms"

    return "medqa"


# ==============================
# 8️⃣ Retrieve + Global Rerank
# ==============================

def retrieve_context(query: str, k: int = 4):

    domain = classify_query(query)

    if domain == "emergency":
        return emergency_response(), 0.99, "emergency"

    if domain == "drugs":
        dbs = [_db_drug, _db_indian]
    elif domain == "symptoms":
        dbs = [_db_sym]
    else:
        dbs = [_db_qa]

    all_results = []

    for db in dbs:
        results = db.similarity_search_with_score(query, k=k)

        for doc, score in results:
            all_results.append({
                "text": doc.page_content,
                "score": float(score)
            })

    all_results = sorted(all_results, key=lambda x: x["score"])
    top_results = all_results[:6]

    for r in top_results:
        text_lower = r["text"].lower()
        if (
            ("severity_level: high" in text_lower or "severity_level: critical" in text_lower)
            and detect_emergency(query)
        ):
            return emergency_response(), 0.95, "emergency"

    context = "\n\n".join([r["text"] for r in top_results])

    if top_results:
        avg_score = sum(r["score"] for r in top_results) / len(top_results)
        confidence = round(max(0.0, min(1.0, 1 / (1 + avg_score))), 3)
    else:
        confidence = 0.0

    return context, confidence, domain


# ==============================
# 9️⃣ Gemini Generator
# ==============================

def generate_answer(query: str, context: str) -> str:

    prompt = f"""
You are a professional medical assistant AI.

Use ONLY the provided medical context to answer.
Do not invent information.
Do NOT provide emergency diagnosis.

User Question:
{query}

Medical Context:
{context}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

        if response.candidates:
            return response.candidates[0].content.parts[0].text.strip()

        return "⚠️ Unable to generate response."

    except Exception:
        return "⚠️ AI system temporarily unavailable."


# ==============================
# 🔟 Main Entry
# ==============================

def get_answer(query: str) -> Dict:

    load_dbs()

    # 🔥 NEW: Normalize brand names BEFORE classification
    normalized_query = normalize_brand_names(query)

    context, confidence, domain = retrieve_context(normalized_query)

    if domain == "emergency":
        return {
            "intents": ["emergency"],
            "answer": context,
            "confidence": confidence,
            "detected_domain": domain
        }

    if not context.strip():
        return {
            "intents": ["unknown"],
            "answer": "No relevant medical information found.",
            "confidence": confidence,
            "detected_domain": domain
        }

    final_answer = generate_answer(normalized_query, context)

    if len(final_answer.split()) > 400:
        return {
            "intents": ["unsafe_output"],
            "answer": "⚠️ Generated response appears unreliable. Please consult a healthcare professional.",
            "confidence": confidence,
            "detected_domain": domain
        }

    if confidence < 0.40:
        return {
            "intents": ["low_confidence"],
            "answer": (
                "⚠️ I am not fully confident about this answer.\n"
                "Please consult a qualified healthcare professional."
            ),
            "confidence": confidence,
            "detected_domain": domain
        }

    return {
        "intents": ["dynamic_llm"],
        "answer": final_answer,
        "confidence": confidence,
        "detected_domain": domain
    }