from services.gemini_client import ask_gemini

COMBINE_PROMPT = """You are combining outputs from specialist agents into ONE clear,
natural-sounding answer for a user in rural India. Do not list agent names or say
"the weather agent says" — just write a single coherent response using the information
below. Keep it concise and easy to understand.

{results}

Original user question: {message}"""

def combiner_node(state):
    results = []

    if state.get("weather_result"):
        results.append(f"Weather info: {state['weather_result']}")
    if state.get("agriculture_result"):
        results.append(f"Agriculture info: {state['agriculture_result']}")
    if state.get("schemes_result"):
        results.append(f"Schemes info: {state['schemes_result']}")
    if state.get("healthcare_result"):
        results.append(f"Healthcare info: {state['healthcare_result']}")

    if not results:
        state["final_response"] = "I couldn't find specific information for your question. Could you rephrase it or ask about weather, crop prices, government schemes, or health guidance?"
        return state

    prompt = COMBINE_PROMPT.format(
        results="\n\n".join(results),
        message=state["message"]
    )
    state["final_response"] = ask_gemini(prompt)
    return state