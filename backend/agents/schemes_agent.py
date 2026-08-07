import json
import os
from services.gemini_client import ask_gemini

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "schemes.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    SCHEMES = json.load(f)

def schemes_node(state):
    message = state["message"].lower()

    # simple keyword match against scheme names
    matched = [s for s in SCHEMES if any(word in message for word in s["name"].lower().split())]

    if not matched:
        state["schemes_result"] = "No specific scheme matched your question directly. Common schemes include PM-Kisan, Ayushman Bharat, and PM Awas Yojana — ask about a specific one for details."
        return state

    context = "\n".join(
        f"{s['name']}: Eligibility - {s['eligibility']}. Benefits - {s['benefits']}. How to apply - {s['how_to_apply']}"
        for s in matched
    )

    prompt = f"""Based ONLY on this scheme data, answer the user's question in plain, simple language. Do not add information not in the data.

Scheme data:
{context}

User question: {state['message']}"""

    state["schemes_result"] = ask_gemini(prompt)
    return state