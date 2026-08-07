from typing import TypedDict
from langgraph.graph import StateGraph, END

class ToyState(TypedDict):
    number: int
    result: str

def check_node(state: ToyState) -> ToyState:
    return state  # just passes through; routing happens next

def route_decision(state: ToyState) -> str:
    return "even" if state["number"] % 2 == 0 else "odd"

def even_node(state: ToyState) -> ToyState:
    state["result"] = f"{state['number']} is even"
    return state

def odd_node(state: ToyState) -> ToyState:
    state["result"] = f"{state['number']} is odd"
    return state

graph = StateGraph(ToyState)
graph.add_node("check", check_node)
graph.add_node("even", even_node)
graph.add_node("odd", odd_node)

graph.set_entry_point("check")
graph.add_conditional_edges("check", route_decision, {"even": "even", "odd": "odd"})
graph.add_edge("even", END)
graph.add_edge("odd", END)

app = graph.compile()

if __name__ == "__main__":
    print(app.invoke({"number": 4, "result": ""}))
    print(app.invoke({"number": 7, "result": ""}))
    