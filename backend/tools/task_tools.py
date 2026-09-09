import json
import os
from datetime import datetime

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_actions.json")

def _load_data() -> dict:
    if not os.path.exists(DATA_PATH):
        return {"tasks": [], "notes": [], "checklists": []}
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"tasks": [], "notes": [], "checklists": []}

def _save_data(data: dict) -> None:
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def create_task(task: str, time: str = "tomorrow") -> dict:
    """
    Creates and persists a scheduled reminder/task to user_actions.json.
    """
    data = _load_data()
    task_id = len(data.get("tasks", [])) + 1
    record = {
        "id": task_id,
        "task": task.strip(),
        "time": time.strip() if time else "tomorrow",
        "created_at": datetime.now().isoformat(timespec="seconds")
    }
    data.setdefault("tasks", []).append(record)
    _save_data(data)
    return {
        "success": True,
        "action": "create_task",
        "record": record,
        "summary": f"Added reminder: '{record['task']}' for {record['time']}."
    }

def save_note(note: str) -> dict:
    """
    Saves and persists a note or piece of context to user_actions.json.
    """
    data = _load_data()
    note_id = len(data.get("notes", [])) + 1
    record = {
        "id": note_id,
        "note": note.strip(),
        "created_at": datetime.now().isoformat(timespec="seconds")
    }
    data.setdefault("notes", []).append(record)
    _save_data(data)
    return {
        "success": True,
        "action": "save_note",
        "record": record,
        "summary": f"Saved note: '{record['note']}'."
    }

def create_checklist(items: list) -> dict:
    """
    Creates and persists a checklist with actionable items to user_actions.json.
    """
    data = _load_data()
    checklist_id = len(data.get("checklists", [])) + 1
    formatted_items = [{"item": str(it).strip(), "done": False} for it in items if str(it).strip()]
    record = {
        "id": checklist_id,
        "items": formatted_items,
        "created_at": datetime.now().isoformat(timespec="seconds")
    }
    data.setdefault("checklists", []).append(record)
    _save_data(data)
    item_names = ", ".join(f"'{x['item']}'" for x in formatted_items)
    return {
        "success": True,
        "action": "create_checklist",
        "record": record,
        "summary": f"Created checklist with {len(formatted_items)} items: {item_names}."
    }
