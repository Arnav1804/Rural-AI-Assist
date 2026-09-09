from agents.coordinator import coordinator_node

test_messages = [
    "Will it rain in Pune tomorrow?",
    "Am I eligible for PM-Kisan?",
    "Will it rain tomorrow and should I irrigate my wheat field?",
    "How to manage pests and fertilizers in soil?",
    "hello"
]

for msg in test_messages:
    state = {"message": msg}
    result = coordinator_node(state)
    print(f"{msg!r} -> {result['route']}")

    