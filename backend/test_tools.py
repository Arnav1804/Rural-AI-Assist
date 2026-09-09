import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from tools.calculator import evaluate_expression
from tools.task_tools import create_task, save_note, create_checklist, DATA_PATH
from agents.action_agent import action_node
from agents.coordinator import coordinator_node

def test_calculator():
    print("=" * 60)
    print("TEST 1: Safe AST Calculator")
    print("=" * 60)
    
    # 1. Standard calculation
    res1 = evaluate_expression("15 * 266")
    print(f"15 * 266 -> {res1['result']} (Success: {res1['success']})")
    assert res1["success"] is True and res1["result"] == 3990, f"Expected 3990, got {res1}"

    # 2. Complex expression
    res2 = evaluate_expression("100 / 4 + 2**3")
    print(f"100 / 4 + 2**3 -> {res2['result']} (Success: {res2['success']})")
    assert res2["success"] is True and res2["result"] == 33, f"Expected 33, got {res2}"

    # 3. Security test: unsafe code execution attempt should fail cleanly
    res3 = evaluate_expression("__import__('os').system('echo hacked')")
    print(f"Code injection attempt -> Caught safely: {not res3['success']} (Error: {res3['error']})")
    assert res3["success"] is False, "Security vulnerability: code injection succeeded!"

    print("[PASS] Calculator tests passed safely.\n")

def test_task_tools():
    print("=" * 60)
    print("TEST 2: Task, Note & Checklist Persistence")
    print("=" * 60)

    # 1. Create Task
    task_res = create_task("Inspect wheat crop for yellow rust", "tomorrow morning")
    print(f"Task result:      {task_res['summary']}")
    assert task_res["success"] is True

    # 2. Save Note
    note_res = save_note("Growing wheat and mustard in 3-acre field")
    print(f"Note result:      {note_res['summary']}")
    assert note_res["success"] is True

    # 3. Create Checklist
    check_res = create_checklist(["Buy urea", "Check pump", "Spray neem oil"])
    print(f"Checklist result: {check_res['summary']}")
    assert check_res["success"] is True

    # Verify write to disk
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data.get("tasks", [])) > 0, "No tasks written to disk!"
    assert len(data.get("notes", [])) > 0, "No notes written to disk!"
    assert len(data.get("checklists", [])) > 0, "No checklists written to disk!"
    print(f"[PASS] Successfully verified persistence in {DATA_PATH}.\n")

def test_action_agent():
    print("=" * 60)
    print("TEST 3: Action Agent Dispatcher")
    print("=" * 60)

    # Calculation request
    state_calc = {"message": "How much is 15 bags of fertilizer at 266 rupees each?"}
    out_calc = action_node(state_calc)
    print(f"Calculation Query Result:\n  {out_calc['action_result']}")
    assert "3990" in out_calc["action_result"]

    # Reminder request
    state_task = {"message": "Remind me to check crop tomorrow"}
    out_task = action_node(state_task)
    print(f"Reminder Query Result:\n  {out_task['action_result']}")
    assert "reminder" in out_task["action_result"].lower() or "check crop" in out_task["action_result"].lower()

    print("[PASS] Action agent dispatch passed.\n")

def test_coordinator_routing():
    print("=" * 60)
    print("TEST 4: Coordinator Routing for Actions")
    print("=" * 60)

    state = {"message": "Remind me to inspect wheat field tomorrow"}
    res = coordinator_node(state)
    route = res.get("route", [])
    print(f"Message: {state['message']!r} -> Route: {route}")
    assert "action" in route, f"Expected 'action' in route, got {route}"
    print("[PASS] Coordinator action routing passed.\n")

if __name__ == "__main__":
    test_calculator()
    test_task_tools()
    test_action_agent()
    test_coordinator_routing()
    print("ALL TOOL TESTS COMPLETED SUCCESSFULLY!")
