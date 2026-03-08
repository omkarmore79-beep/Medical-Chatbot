from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def extract_text_from_prescription(image_bytes: bytes, mime_type: str) -> str:
    """
    Extract text from medical image using Gemini Vision.
    """

    prompt = """
You are a medical OCR system.
Extract all readable medical text.
Keep table rows intact and preserve line breaks.
Do not summarize, correct, or infer values.
Return only plain extracted text.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type
                )
            ],
        )

        if response.text:
            return response.text.strip()

        return ""

    except Exception as e:
        print("Vision error:", e)
        return ""