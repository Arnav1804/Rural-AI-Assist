from agents.weather_agent import weather_node
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_test(label, message):
    print("=" * 60)
    print(label)
    print(f"Message: {message}")
    result = weather_node({"message": message})
    print(f"Result:  {result['weather_result']}\n")

if __name__ == "__main__":
    # Case 1: Explicit location
    run_test("TEST 1: Explicit location (Visakhapatnam)", "What's the weather in Visakhapatnam?")

    # Case 2: No location in message (fallback to Pune with disclosure)
    run_test("TEST 2: No location (fallback path)", "Will it rain tomorrow?")

    # Case 3: Misspelled/ambiguous location
    run_test("TEST 3: Misspelled location", "What's the weather in AsdfghjklCity?")