from services.gemini_client import ask_gemini
from services.memory_store import format_history_for_prompt
import json

COORDINATOR_PROMPT = """You are a routing assistant for a rural assistance platform.
Given the recent conversation history and the user's latest message, decide which of these agents are relevant:
- weather: forecasts, rain, temperature, climate, sunny/cloudy conditions
- agriculture: crop care, irrigation, watering crops, farming techniques, soil, fertilizers, pests, diseases, sowing seasons, crop varieties (NOT government schemes, subsidies, or financial aid like PM-Kisan, even if farming-related)
- schemes: government schemes, eligibility, subsidies, welfare benefits, financial assistance
- healthcare: symptoms, health guidance, clinics, hospitals, medical advice
- action: user actions, tools, mathematical calculations/arithmetic (e.g. "calculate 50*12", "how much is 15 bags at 266?"), setting tasks or reminders (e.g. "remind me to check my crop tomorrow", "set task to buy seeds"), saving notes/remembering user facts (e.g. "remember that I'm growing rice", "note down soil pH"), creating checklists

Recent conversation history:
{history}

Current user message: {message}

Return ONLY a JSON list of relevant agent names, nothing else. Example: ["agriculture"]
If none are relevant, return []."""

def coordinator_node(state):
    history = state.get("conversation_history") or []
    history_text = format_history_for_prompt(history)

    message = state["message"]
    if state.get("image_bytes"):
        message = f"[User attached a crop/plant photo] {message}"

    prompt = COORDINATOR_PROMPT.format(history=history_text, message=message)
    raw = ask_gemini(prompt)

    try:
        cleaned = raw.strip().strip("```json").strip("```").strip()
        route = json.loads(cleaned)
    except Exception:
        route = []

    state["route"] = route
    return state