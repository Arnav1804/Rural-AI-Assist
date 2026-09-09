import sys
from fastapi.testclient import TestClient
from main import app
from services.memory_store import get_history, clear_session

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)

def test_two_turn_memory():
    session_id = "test-session-rice-demo"
    clear_session(session_id)

    print("=" * 60)
    print("SESSION MEMORY TEST: Rice -> Fertilizer follow-up")
    print(f"Session ID: {session_id}")
    print("=" * 60)

    # -------------------------------------------------------------
    # TURN 1: User introduces their crop context
    # -------------------------------------------------------------
    turn1_msg = "I am growing rice in my field."
    print(f"\n[Turn 1] User: {turn1_msg}")
    res1 = client.post("/chat", json={"message": turn1_msg, "session_id": session_id})
    assert res1.status_code == 200, f"Turn 1 failed: {res1.text}"
    data1 = res1.json()
    print(f"[Turn 1] Route:    {data1['route']}")
    print(f"[Turn 1] Response:\n{data1['response']}\n")

    # Verify history was saved
    history_after_turn1 = get_history(session_id)
    assert len(history_after_turn1) == 2, f"Expected 2 entries in history, got {len(history_after_turn1)}"

    # -------------------------------------------------------------
    # TURN 2: Follow-up question relying on Turn 1 context
    # -------------------------------------------------------------
    turn2_msg = "What fertilizer should I use and how to apply it?"
    print(f"[Turn 2] User: {turn2_msg} (Note: does not mention 'rice')")
    res2 = client.post("/chat", json={"message": turn2_msg, "session_id": session_id})
    assert res2.status_code == 200, f"Turn 2 failed: {res2.text}"
    data2 = res2.json()
    print(f"[Turn 2] Route:    {data2['route']}")
    print(f"[Turn 2] Response:\n{data2['response']}\n")

    # Assertions
    route2 = data2["route"]
    response2 = data2["response"].lower()

    assert "agriculture" in route2, f"Expected 'agriculture' in route, got {route2}"
    assert any(w in response2 for w in ["urea", "npk", "fertilizer", "nutrient", "soil"]), (
        f"Expected fertilizer advice in response, got: {data2['response']}"
    )

    print("[PASS] Turn 2 correctly routed to agriculture and provided fertilizer advice based on Turn 1 context.")
    print("SESSION MEMORY VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_two_turn_memory()
