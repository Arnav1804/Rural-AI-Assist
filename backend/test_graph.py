"""
Tests for graph.py — three scenarios:
  1. Single-agent match  (schemes only)
  2. Multi-agent match   (schemes + healthcare)
  3. No-match case       (combiner fallback)
"""

from graph import app

def make_state(message: str) -> dict:
    return {
        "message": message,
        "route": [],
        "weather_result": None,
        "agriculture_result": None,
        "schemes_result": None,
        "healthcare_result": None,
        "final_response": None,
    }


def test_single_agent():
    """Asking about PM-Kisan should route to schemes only."""
    result = app.invoke(make_state("Tell me about PM-Kisan eligibility"))
    print(f"Route:    {result['route']}")
    print(f"Schemes:  {result['schemes_result'][:80]}...")
    print(f"Health:   {result['healthcare_result']}")
    print(f"Final:    {result['final_response'][:80]}...")
    assert "schemes" in result["route"], "Expected 'schemes' in route"
    assert result["schemes_result"] is not None
    assert result["final_response"] is not None
    print("[PASS] Single-agent test PASSED\n")


def test_multi_agent():
    """A question mentioning both schemes AND health should route to both."""
    result = app.invoke(make_state(
        "I have a fever and I also want to know about Ayushman Bharat health scheme"
    ))
    print(f"Route:    {result['route']}")
    print(f"Schemes:  {result['schemes_result'][:80]}...")
    print(f"Health:   {result['healthcare_result'][:80]}...")
    print(f"Final:    {result['final_response'][:80]}...")
    assert "schemes" in result["route"], "Expected 'schemes' in route"
    assert "healthcare" in result["route"], "Expected 'healthcare' in route"
    assert result["schemes_result"] is not None
    assert result["healthcare_result"] is not None
    assert result["final_response"] is not None
    print("[PASS] Multi-agent test PASSED\n")


def test_no_match():
    """A random greeting should route to no agents → combiner fallback."""
    result = app.invoke(make_state("Hello, how are you?"))
    print(f"Route:    {result['route']}")
    print(f"Final:    {result['final_response'][:80]}...")
    assert result["final_response"] is not None
    print("[PASS] No-match test PASSED\n")


if __name__ == "__main__":
    print("=" * 60)
    print("TEST 1: Single-agent (schemes)")
    print("=" * 60)
    test_single_agent()

    print("=" * 60)
    print("TEST 2: Multi-agent (schemes + healthcare)")
    print("=" * 60)
    test_multi_agent()

    print("=" * 60)
    print("TEST 3: No-match (combiner fallback)")
    print("=" * 60)
    test_no_match()

    print("All graph tests PASSED")
