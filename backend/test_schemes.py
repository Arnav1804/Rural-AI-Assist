from agents.schemes_agent import schemes_node
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

state = {"message": "Am I eligible for PM-Kisan?"}
result = schemes_node(state)
print(result["schemes_result"])