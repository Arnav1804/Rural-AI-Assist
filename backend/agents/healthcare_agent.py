import json
import os
from services.gemini_client import ask_gemini

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "healthcare.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    HEALTH_DATA = json.load(f)

def healthcare_node(state):
    message = state["message"].lower()

    matched = [h for h in HEALTH_DATA if h["condition"].split()[0] in message]

    if not matched:
        state["healthcare_result"] = "No specific match found. Please describe your symptoms to a healthcare worker at your nearest PHC for proper guidance."
        return state

    context = "\n".join(
        f"{h['condition']}: General guidance - {h['general_guidance']}. See a doctor if - {h['when_to_see_doctor']}"
        for h in matched
    )

    prompt = f"""Based ONLY on this health data, answer the user's question with general guidance.
NEVER diagnose the user or claim to know what condition they have — only provide the
general guidance and clearly state when they should see a real healthcare worker.

Health data:
{context}

User question: {state['message']}"""

    state["healthcare_result"] = ask_gemini(prompt)
    return state