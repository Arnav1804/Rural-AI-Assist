"""
Quick smoke-test for gemini_client.ask_gemini().
Run from the backend/ folder:
    python test_gemini.py
"""

from services.gemini_client import ask_gemini

if __name__ == "__main__":
    print("Sending prompt to Gemini…")
    reply = ask_gemini("Say hello in one sentence.")
    print(f"\nGemini says: {reply}")
