import json
import os
from services.gemini_client import ask_gemini
from services.memory_store import format_history_for_prompt

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "agriculture.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    AGRI_DATA = json.load(f)

def agriculture_node(state):
    message = state["message"].lower()
    history = state.get("conversation_history") or []
    history_text = format_history_for_prompt(history)
    combined_search_text = f"{history_text.lower()} {message}"

    # Match if any keyword appears in the message or conversation history
    matched = [
        item for item in AGRI_DATA
        if any(kw in combined_search_text for kw in item.get("keywords", []))
        or any(word in message for word in item["topic"].lower().split())
    ]

    # Multimodal image path
    image_bytes = state.get("image_bytes")
    image_mime_type = state.get("image_mime_type")

    if image_bytes and image_mime_type:
        # Include pest/disease items plus any matched items for context
        disease_items = [
            item for item in AGRI_DATA
            if "pest" in item.get("keywords", []) or "disease" in item.get("keywords", [])
        ]
        all_items = matched if matched else disease_items
        for it in disease_items:
            if it not in all_items:
                all_items.append(it)

        context = "\n".join(
            f"{item['topic']}: Guidance - {item['guidance']}. Advisory - {item['advisory']}"
            for item in all_items
        )

        prompt = f"""You are an agricultural advisor examining a photo of a plant/crop.
Analyze the visible condition of the plant in light of the provided agricultural knowledge base.

SAFETY GUARDRAILS (Strict Requirement):
1. Be cautious and appropriately hedged: NEVER claim definitive certainty from a photograph alone. Use phrasing such as "This appears to show signs of...", "Possible causes could include...".
2. Recommend practical, low-risk steps grounded in the knowledge base (such as neem oil / NSKE spray, inspecting for pests, or avoiding waterlogging).
3. Explicitly recommend that the user consult a local agricultural extension officer or visit their nearest Krishi Vigyan Kendra (KVK) for an in-person physical inspection before taking drastic action or applying chemical treatments.

Agricultural knowledge base:
{context}

User question: {state['message']}"""

        state["agriculture_result"] = ask_gemini(
            prompt,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
        )
        return state

    if not matched:
        state["agriculture_result"] = (
            "No specific agricultural guidance matched your question directly. "
            "Topics covered include wheat irrigation, soil types, NPK fertilizer application, "
            "pest and disease control, crop sowing seasons, and organic farming."
        )
        return state

    context = "\n".join(
        f"{item['topic']}: Guidance - {item['guidance']}. Advisory - {item['advisory']}"
        for item in matched
    )

    prompt = f"""Based ONLY on this agricultural data and the conversation context, answer the user's question with practical farming guidance.
Do not add facts, dosages, or recommendations not present in the data. If the data does not contain enough detail to fully answer, state that clearly rather than guessing.

Agricultural data:
{context}

Recent conversation:
{history_text}

Current user question: {state['message']}"""

    state["agriculture_result"] = ask_gemini(prompt)
    return state
