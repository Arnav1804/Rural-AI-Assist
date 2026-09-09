from services.weather_api import get_weather
from services.gemini_client import ask_gemini
from services.memory_store import format_history_for_prompt

DEFAULT_CITY = "Pune"

def extract_location(message: str, history_text: str = "") -> tuple[str, bool]:
    """
    Extracts the city/district mentioned in the message or recent conversation history.
    Returns (city_name, is_fallback).
    """
    prompt = f"""Extract ONLY the city or district name mentioned in this current message or recent conversation.
If a city or district is mentioned or was established in the conversation, return just that name (e.g. "Visakhapatnam", "Nagpur", "Jaipur").
If NO city or district is mentioned, return "NONE".

Recent conversation:
{history_text or "None"}

Current message: {message}"""
    extracted = ask_gemini(prompt).strip().strip('"').strip("'")

    if not extracted or "NONE" in extracted.upper() or "unavailable" in extracted.lower() or len(extracted) > 40:
        return DEFAULT_CITY, True

    # If the model returned Pune but the user didn't mention Pune in message or history, it assumed Pune as fallback
    all_context = f"{history_text} {message}".lower()
    if extracted.lower() == DEFAULT_CITY.lower() and "pune" not in all_context:
        return DEFAULT_CITY, True

    return extracted, False

def weather_node(state):
    history = state.get("conversation_history") or []
    history_text = format_history_for_prompt(history)
    city, is_fallback = extract_location(state["message"], history_text)

    result = get_weather(city)
    if result["success"]:
        weather_info = (
            f"{result['city']}: {result['temp']}°C, {result['condition']}, "
            f"humidity {result['humidity']}%"
        )
        if is_fallback:
            state["weather_result"] = (
                f"{weather_info} (assuming you mean {DEFAULT_CITY} — let me know your location for accurate results)"
            )
        else:
            state["weather_result"] = weather_info
    else:
        err = str(result.get("error", ""))
        if "404" in err or "not found" in err.lower():
            state["weather_result"] = f"Could not find weather data for '{city}'. Please check the spelling of your location."
        else:
            state["weather_result"] = f"Weather data unavailable for '{city}' ({result.get('error', 'unknown error')})"

    return state