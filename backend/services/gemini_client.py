import os
from dotenv import load_dotenv
from google import genai

load_dotenv()  # reads .env and loads GEMINI_API_KEY into environment

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found — check your .env file")

client = genai.Client(api_key=api_key)

def ask_gemini(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )
    return response.text