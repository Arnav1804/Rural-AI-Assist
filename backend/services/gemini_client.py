import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found — check your .env file")

client = genai.Client(api_key=api_key)

MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
]

from typing import Optional
from google.genai import types

def ask_gemini(
    prompt: str,
    retries: int = 2,
    image_bytes: Optional[bytes] = None,
    image_mime_type: Optional[str] = None,
) -> str:
    contents = [prompt]
    if image_bytes and image_mime_type:
        contents.append(
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type,
            )
        )

    for model_name in MODELS:
        for attempt in range(retries + 1):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                )
                return response.text
            except Exception as e:
                err_str = str(e)
                # If model quota exhausted or model not found, try next model in pool
                if "RESOURCE_EXHAUSTED" in err_str or "404" in err_str:
                    break
                if attempt < retries:
                    time.sleep(1.5 * (attempt + 1))
                    continue
                break
    return "(AI service temporarily unavailable, please try again)"