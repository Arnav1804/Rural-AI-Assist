from services.weather_api import get_weather

def weather_node(state):
    # naive extraction for now — just look for a known city name pattern later;
    # for this MVP we'll default to a fixed test city, refine in Task 7 if time allows
    city = state.get("city", "Pune")

    result = get_weather(city)
    if result["success"]:
        state["weather_result"] = (
            f"{result['city']}: {result['temp']}°C, {result['condition']}, "
            f"humidity {result['humidity']}%"
        )
    else:
        state["weather_result"] = f"Weather data unavailable ({result['error']})"

    return state