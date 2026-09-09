from agents.agriculture_agent import agriculture_node

state = {"message": "How often should I irrigate my wheat crop, and what stage is critical?"}
result = agriculture_node(state)
print("Agriculture Result:")
print(result["agriculture_result"])
