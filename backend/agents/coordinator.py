from services.gemini_client import ask_gemini
import json

COORDINATOR_PROMPT = """You are a routing assistant. Given a user's message, decide which of these agents are relevant:
- weather: forecasts, rain, temperature, climate
- agriculture: crop prices, mandi rates, farming techniques, soil, irrigation (NOT government schemes or subsidies, even if farming-related)
- schemes: government schemes, eligibility, subsidies, benefits
- healthcare: symptoms, health guidance, clinics, hospitals

Return ONLY a JSON list of relevant agent names, nothing else. Example: ["weather", "schemes"]
If none are relevant, return [].

User message: {message}"""

def coordinator_node(state):
    prompt = COORDINATOR_PROMPT.format(message=state["message"])
    raw = ask_gemini(prompt)
    print(f"[DEBUG] Raw Gemini output: {raw!r}")   # ADD THIS LINE TEMPORARILY

    try:
        cleaned = raw.strip().strip("```json").strip("```").strip()
        route = json.loads(cleaned)
    except Exception:
        route = []

    state["route"] = route
    return state