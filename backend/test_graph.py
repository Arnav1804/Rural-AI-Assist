from graph import app
import time
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_case(label, message):
    print("=" * 60)
    print(label)
    print("=" * 60)
    result = app.invoke({
        "message": message, "route": [],
        "weather_result": None, "agriculture_result": None,
        "schemes_result": None, "healthcare_result": None,
        "action_result": None,
        "final_response": None
    })

    route = result.get("route", [])
    print(f"Route:    {route}")

    for field in ["weather_result", "agriculture_result", "schemes_result", "healthcare_result", "action_result"]:
        val = result.get(field)
        preview = val[:80] if val else "(not called)"
        print(f"{field}: {preview}")

    final = result.get("final_response")
    print(f"Final:\n{final}\n")

    status = "PASSED" if route or final else "FAILED (empty route AND no response — check rate limits)"
    print(f"[{'PASS' if 'PASSED' in status else 'CHECK'}] {label} -> {status}\n")
    time.sleep(2)


if __name__ == "__main__":
    run_case("TEST 1: Single-agent (weather)", "What's the weather in Pune?")
    run_case("TEST 2: Single-agent (agriculture)", "How should I fertilize my soil with urea and compost?")
    run_case("TEST 3: Single-agent (schemes)", "Am I eligible for PM-Kisan?")
    run_case("TEST 4: Multi-agent (weather + agriculture)", "Will it rain tomorrow and should I irrigate my wheat field?")
    run_case("TEST 5: Multi-agent (schemes + healthcare)", "I have a fever and want to know about PM-Kisan")
    run_case("TEST 6: Action (calculator)", "Calculate 15 bags of urea at 266 rupees each")
    run_case("TEST 7: Multi-agent (weather + action)", "What's the weather in Pune and remind me to spray crops tomorrow")
    run_case("TEST 8: No-match (combiner fallback)", "What is the capital of India?")