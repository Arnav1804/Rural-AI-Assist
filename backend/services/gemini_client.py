import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found — check your .env file")

client = genai.Client(api_key=api_key)

def ask_gemini(prompt: str, retries: int = 2) -> str:
    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )
            return response.text
        except Exception as e:
            if attempt < retries:
                time.sleep(2)
                continue
            return "(AI service temporarily unavailable, please try again)"