from agents.schemes_agent import schemes_node

state = {"message": "Am I eligible for PM-Kisan?"}
result = schemes_node(state)
print(result["schemes_result"])