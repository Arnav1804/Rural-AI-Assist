from agents.coordinator import coordinator_node

test_messages = [
    "Will it rain in Pune tomorrow?",
    "Am I eligible for PM-Kisan?",
    "What's the onion price in my area, and is it going to be sunny?",
    "hello"
]

for msg in test_messages:
    state = {"message": msg}
    result = coordinator_node(state)
    print(f"{msg!r} -> {result['route']}")
    