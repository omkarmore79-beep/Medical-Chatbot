from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import get_answer
from image_processor import extract_text_from_prescription
import logging
import time

from medicine_parser import (
    extract_medicine_lines,
    normalize_medicine_name,
    resolve_medicine_line
)

from lab_report_parser import (
    is_lab_report,
    extract_lab_values,
    interpret_lab_results
)

from lab_analyzer import generate_final_lab_output


# -----------------------------
# 1️⃣ Create API server
# -----------------------------
app = FastAPI(
    title="Medical Chatbot (Tanmay, Parth, Omkar)",
    description="Medical AI Assistant with RAG + Prescription OCR + Smart Lab Report Analysis",
    version="5.1"
)


# -----------------------------
# 2️⃣ CORS for frontend connection
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# 3️⃣ Configure Logging
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


# -----------------------------
# 4️⃣ Emergency Rules (TEXT)
# -----------------------------
EMERGENCY_KEYWORDS = [
    "chest pain",
    "shortness of breath",
    "unconscious",
    "severe bleeding",
    "stroke",
    "heart attack",
    "seizure"
]


def check_emergency(query: str) -> bool:
    return any(word in query.lower() for word in EMERGENCY_KEYWORDS)


# -----------------------------
# 5️⃣ Prescription Risk Keywords
# -----------------------------
PRESCRIPTION_ALERT_KEYWORDS = [
    "nitroglycerin",
    "adrenaline",
    "epinephrine",
    "morphine",
    "dopamine",
    "dobutamine"
]


def check_prescription_alert(extracted_text: str) -> bool:
    return any(word in extracted_text.lower() for word in PRESCRIPTION_ALERT_KEYWORDS)


# -----------------------------
# 6️⃣ Request Body Model
# -----------------------------
class QueryIn(BaseModel):
    query: str


# -----------------------------
# 7️⃣ Health Check Route
# -----------------------------
@app.get("/")
def home():
    return {
        "status": "ok",
        "message": "Medical Chatbot API running (Text + Prescription + Lab Analyzer)"
    }


# -----------------------------
# 8️⃣ TEXT CHAT ROUTE
# -----------------------------
@app.post("/ask")
def ask(payload: QueryIn):
    start_time = time.time()
    user_query = payload.query.strip()

    logging.info(f"User Query: {user_query}")

    if not user_query:
        return {
            "answer": "Please enter a valid question.",
            "confidence": 0.0,
            "detected_domain": "unknown",
            "response_time_seconds": round(time.time() - start_time, 3),
            "sources": []
        }

    if check_emergency(user_query):
        logging.warning("Emergency case detected (text)")
        return {
            "answer": (
                "⚠️ Your symptoms may indicate a medical emergency.\n"
                "Please seek immediate medical care immediately.\n\n"
                "This AI system cannot provide emergency assistance."
            ),
            "confidence": 1.0,
            "detected_domain": "emergency",
            "response_time_seconds": round(time.time() - start_time, 3),
            "sources": []
        }

    try:
        response = get_answer(user_query)
    except Exception as e:
        logging.error(f"RAG error: {str(e)}")
        return {
            "answer": "⚠️ The AI system is temporarily unavailable. Please try again shortly.",
            "confidence": 0.0,
            "detected_domain": "error",
            "response_time_seconds": round(time.time() - start_time, 3),
            "sources": []
        }

    return {
        "answer": response.get("answer", "No response generated."),
        "confidence": response.get("confidence", 0.0),
        "detected_domain": response.get("detected_domain", "unknown"),
        "response_time_seconds": round(time.time() - start_time, 3),
        "sources": response.get("sources", [])
    }


# -----------------------------
# 9️⃣ PRESCRIPTION + LAB IMAGE ROUTE
# -----------------------------
@app.post("/analyze-prescription")
async def analyze_prescription(file: UploadFile = File(...)):
    start_time = time.time()
    logging.info(f"Image received: {file.filename}")

    try:
        image_bytes = await file.read()
        mime_type = file.content_type

        extracted_text = extract_text_from_prescription(
            image_bytes=image_bytes,
            mime_type=mime_type
        )

        if not extracted_text:
            return {
                "answer": "⚠️ Unable to extract readable text from the image.",
                "response_time_seconds": round(time.time() - start_time, 3)
            }

        # =====================================================
        # 🧪 STEP 1 — LAB REPORT DETECTION
        # =====================================================
        if is_lab_report(extracted_text):
            print("\n========== RAW OCR TEXT ==========\n")
            print(extracted_text)
            print("\n==================================\n")

            lab_values = extract_lab_values(extracted_text)

            print("\n========== PARSED LAB VALUES ==========\n")
            print(lab_values)
            print("\n=======================================\n")

            if not lab_values:
                return {
                    "document_type": "lab_report",
                    "extracted_text": extracted_text,
                    "analysis": "No recognizable lab values found.",
                    "disclaimer": "⚠ Please consult your doctor for proper medical interpretation.",
                    "response_time_seconds": round(time.time() - start_time, 3)
                }

            interpreted_results = interpret_lab_results(lab_values)
            final_output = generate_final_lab_output(interpreted_results)

            final_output["document_type"] = "lab_report"
            final_output["extracted_text"] = extracted_text
            final_output["response_time_seconds"] = round(time.time() - start_time, 3)

            return final_output

        # =====================================================
        # 💊 STEP 2 — PRESCRIPTION PROCESSING
        # =====================================================
        medicine_lines = extract_medicine_lines(extracted_text)

        if not medicine_lines:
            return {
                "document_type": "prescription",
                "extracted_text": extracted_text,
                "medicines_detected": [],
                "medicines": [],
                "analysis": "No medicines detected in prescription.",
                "response_time_seconds": round(time.time() - start_time, 3)
            }

        structured_analysis = []

        for line in medicine_lines:
            resolved = resolve_medicine_line(line)
            normalized_name = resolved.get("generic_name", "")
            brand_name = resolved.get("brand_name", "")

            medicine_query = (
                f"Brand name: {brand_name}. Generic name: {normalized_name}. "
                "Provide uses, common side effects, and key precautions."
            ).strip()

            try:
                rag_response = get_answer(medicine_query)
                analysis_text = rag_response.get("answer", "No data found.")
                lower_analysis = analysis_text.lower()

                if (
                    "does not contain information" in lower_analysis
                    or "cannot answer" in lower_analysis
                    or "no relevant medical information found" in lower_analysis
                ):
                    analysis_text = (
                        f"Identified medicine mapping: {brand_name} -> {normalized_name}. "
                        "Detailed clinical description is not available in the current knowledge base. "
                        "Please verify with a doctor/pharmacist before use."
                    )

                item = {
                    "original_line": line,
                    "brand_name": brand_name,
                    "generic_name": normalized_name,
                    "match_type": resolved.get("match_type", "unmapped"),
                    "mapping_confidence": resolved.get("confidence", 0.0),
                    "normalized_query": normalized_name,
                    "analysis": analysis_text,
                    "confidence": rag_response.get("confidence", 0.0)
                }

                if item["match_type"] == "unmapped" or item["mapping_confidence"] < 0.9:
                    item["mapping_note"] = (
                        "Medicine mapping confidence is low. Please verify brand and generic name manually."
                    )

                structured_analysis.append(item)

            except Exception:
                item = {
                    "original_line": line,
                    "brand_name": resolved.get("brand_name", ""),
                    "generic_name": resolved.get("generic_name", ""),
                    "match_type": resolved.get("match_type", "unmapped"),
                    "mapping_confidence": resolved.get("confidence", 0.0),
                    "normalized_query": normalized_name,
                    "analysis": "Error retrieving data.",
                    "confidence": 0.0
                }

                if item["match_type"] == "unmapped" or item["mapping_confidence"] < 0.9:
                    item["mapping_note"] = (
                        "Medicine mapping confidence is low. Please verify brand and generic name manually."
                    )

                structured_analysis.append(item)

        # simple frontend-friendly medicine list
        medicines_simple = []
        for item in structured_analysis:
            name = item.get("brand_name") or item.get("generic_name") or item.get("original_line")
            dosage = item.get("original_line", "")
            medicines_simple.append({
                "name": name,
                "dosage": dosage
            })

        return {
            "document_type": "prescription",
            "extracted_text": extracted_text,
            "medicines_detected": medicine_lines,
            "medicines": medicines_simple,
            "detailed_analysis": structured_analysis,
            "response_time_seconds": round(time.time() - start_time, 3)
        }

    except Exception as e:
        logging.error(f"Image processing error: {str(e)}")
        return {
            "answer": "⚠️ Image processing failed. Please try again.",
            "response_time_seconds": round(time.time() - start_time, 3)
        }