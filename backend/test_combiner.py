from agents.schemes_agent import schemes_node
from agents.healthcare_agent import healthcare_node
from agents.combiner import combiner_node

state = {"message": "I have a fever and also want to know about PM-Kisan"}
state = schemes_node(state)
state = healthcare_node(state)
state = combiner_node(state)

print(state["final_response"])