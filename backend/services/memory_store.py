from typing import Dict, List, Optional

# In-memory dictionary mapping session_id -> list of turn dicts:
# [{"role": "user" | "assistant", "content": str}]
SESSION_HISTORY: Dict[str, List[dict]] = {}

def get_history(session_id: Optional[str], max_turns: int = 6) -> List[dict]:
    """
    Returns the most recent max_turns for the given session_id.
    """
    if not session_id or session_id not in SESSION_HISTORY:
        return []
    return SESSION_HISTORY[session_id][-max_turns:]

def add_turn(session_id: Optional[str], role: str, content: str) -> None:
    """
    Appends a turn to the in-memory history for session_id.
    """
    if not session_id or not content:
        return
    if session_id not in SESSION_HISTORY:
        SESSION_HISTORY[session_id] = []
    SESSION_HISTORY[session_id].append({"role": role, "content": content.strip()})

def format_history_for_prompt(history: List[dict]) -> str:
    """
    Formats history list into a clean readable string for LLM prompts.
    """
    if not history:
        return "None"
    lines = []
    for turn in history:
        role = turn.get("role", "user").capitalize()
        content = turn.get("content", "").strip()
        lines.append(f"{role}: {content}")
    return "\n".join(lines)

def clear_session(session_id: str) -> None:
    """
    Clears memory for a specific session.
    """
    SESSION_HISTORY.pop(session_id, None)
