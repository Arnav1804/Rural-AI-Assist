from agents.healthcare_agent import healthcare_node

state = {"message": "I have a fever, what should I do?"}
result = healthcare_node(state)
print(result["healthcare_result"])
