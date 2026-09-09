import json
from services.gemini_client import ask_gemini
from tools.calculator import evaluate_expression
from tools.task_tools import create_task, save_note, create_checklist

ACTION_PARSER_PROMPT = """You are an action dispatcher for an AI assistant.
Analyze the user's message and determine what action to execute. Choose ONLY ONE of these actions:
1. "calculate": mathematical calculations or arithmetic (e.g., "calculate 50 * 12", "what is 5000 / 4?", "how much is 15 bags at 266 each?")
   Provide field "expression" containing ONLY a clean Python math expression (e.g. "50 * 12", "15 * 266").
2. "create_task": reminders, scheduled tasks, alarms (e.g., "remind me to check my crop tomorrow", "set task to buy seeds at 5pm")
   Provide field "task" (what to do) and field "time" (when to do it, default "tomorrow").
3. "save_note": remember personal facts, notes, crop records (e.g., "remember that I'm growing rice", "note that soil pH is 6.5")
   Provide field "note" (the text to remember).
4. "create_checklist": checklists, to-do lists with multiple items (e.g., "create checklist for sowing: ploughing, buying seeds, fertilizing")
   Provide field "items" as a JSON list of item strings.

Return ONLY a JSON object with no markdown formatting, matching one of these formats:
{{"action": "calculate", "expression": "15 * 266"}}
{{"action": "create_task", "task": "check crop", "time": "tomorrow"}}
{{"action": "save_note", "note": "growing rice"}}
{{"action": "create_checklist", "items": ["ploughing", "buying seeds"]}}

User message: {message}"""

def action_node(state):
    message = state.get("message", "")
    prompt = ACTION_PARSER_PROMPT.format(message=message)
    raw = ask_gemini(prompt)

    try:
        cleaned = raw.strip().strip("```json").strip("```").strip()
        parsed = json.loads(cleaned)
    except Exception:
        parsed = {}

    action_type = parsed.get("action", "")

    if action_type == "calculate":
        expr = parsed.get("expression", "")
        calc_result = evaluate_expression(expr)
        if calc_result["success"]:
            state["action_result"] = (
                f"Calculated: {calc_result['expression']} = {calc_result['result']}"
            )
        else:
            state["action_result"] = (
                f"Calculation error on '{expr}': {calc_result['error']}"
            )

    elif action_type == "create_task":
        task_text = parsed.get("task", message)
        time_text = parsed.get("time", "tomorrow")
        res = create_task(task_text, time_text)
        state["action_result"] = res["summary"]

    elif action_type == "save_note":
        note_text = parsed.get("note", message)
        res = save_note(note_text)
        state["action_result"] = res["summary"]

    elif action_type == "create_checklist":
        items = parsed.get("items", [])
        if not items:
            items = [message]
        res = create_checklist(items)
        state["action_result"] = res["summary"]

    else:
        # Fallback: if user asked for a calculation or reminder that wasn't cleanly parsed
        if any(w in message.lower() for w in ["calculate", "+", "-", "*", "/", "divided", "times"]):
            # Try naive calculation extraction
            nums_and_ops = "".join(c for c in message if c in "0123456789+-*/. ()")
            calc_res = evaluate_expression(nums_and_ops)
            if calc_res["success"] and calc_res["result"] is not None:
                state["action_result"] = f"Calculated: {calc_res['expression']} = {calc_res['result']}"
            else:
                state["action_result"] = "Could not parse calculation expression."
        else:
            res = save_note(message)
            state["action_result"] = res["summary"]

    return state
