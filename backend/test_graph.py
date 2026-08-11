from graph import app

def run_case(label, message):
    print("=" * 60)
    print(label)
    print("=" * 60)
    result = app.invoke({
        "message": message, "route": [],
        "weather_result": None, "agriculture_result": None,
        "schemes_result": None, "healthcare_result": None,
        "final_response": None
    })

    route = result.get("route", [])
    print(f"Route:    {route}")

    for field in ["schemes_result", "healthcare_result"]:
        val = result.get(field)
        preview = val[:80] if val else "(not called)"
        print(f"{field}: {preview}")

    final = result.get("final_response")
    final_preview = final[:80] if final else "(no final response)"
    print(f"Final:    {final_preview}")

    status = "PASSED" if route or final else "FAILED (empty route AND no response — check rate limits)"
    print(f"[{'PASS' if 'PASSED' in status else 'CHECK'}] {label} -> {status}")


if __name__ == "__main__":
    run_case("TEST 1: Single-agent (schemes)", "Am I eligible for PM-Kisan?")
    run_case("TEST 2: Multi-agent (schemes + healthcare)", "I have a fever and want to know about PM-Kisan")
    run_case("TEST 3: No-match (combiner fallback)", "What is the capital of India?")