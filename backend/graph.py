"""
LangGraph StateGraph for RuralAssist AI.
Nodes: coordinator → (weather | schemes | healthcare) → combiner → END
Supports routing to MULTIPLE agents in parallel via conditional fan-out.
"""

from langgraph.graph import StateGraph, END
from state import AgentState
from agents.coordinator import coordinator_node
from agents.weather_agent import weather_node
from agents.agriculture_agent import agriculture_node
from agents.schemes_agent import schemes_node
from agents.healthcare_agent import healthcare_node
from agents.action_agent import action_node
from agents.combiner import combiner_node


# ---------------------------------------------------------------------------
# Wrapper nodes — the original agent functions mutate & return the full state
# dict.  LangGraph parallel fan-out requires each branch to return ONLY the
# keys it changed, otherwise concurrent writes to the same key raise
# InvalidUpdateError.  These thin wrappers call the real function, then
# return just the relevant slice.
# ---------------------------------------------------------------------------

def _coordinator(state: AgentState) -> dict:
    updated = coordinator_node(dict(state))      # run on a copy
    return {"route": updated["route"]}


def _weather(state: AgentState) -> dict:
    updated = weather_node(dict(state))
    return {"weather_result": updated["weather_result"]}


def _agriculture(state: AgentState) -> dict:
    updated = agriculture_node(dict(state))
    return {"agriculture_result": updated["agriculture_result"]}


def _schemes(state: AgentState) -> dict:
    updated = schemes_node(dict(state))
    return {"schemes_result": updated["schemes_result"]}


def _healthcare(state: AgentState) -> dict:
    updated = healthcare_node(dict(state))
    return {"healthcare_result": updated["healthcare_result"]}


def _action(state: AgentState) -> dict:
    updated = action_node(dict(state))
    return {"action_result": updated["action_result"]}


def _combiner(state: AgentState) -> dict:
    updated = combiner_node(dict(state))
    return {"final_response": updated["final_response"]}


# ---------------------------------------------------------------------------
# Routing logic — returns a list of node names so LangGraph fans out in
# parallel when multiple agents are selected.
# ---------------------------------------------------------------------------

AGENT_MAP = {
    "weather":     "weather",
    "agriculture": "agriculture",
    "schemes":     "schemes",
    "healthcare":  "healthcare",
    "action":      "action",
}

def route_after_coordinator(state: AgentState):
    targets = [AGENT_MAP[r] for r in state["route"] if r in AGENT_MAP]
    return targets if targets else ["combiner"]


# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------

graph = StateGraph(AgentState)

graph.add_node("coordinator", _coordinator)
graph.add_node("weather",     _weather)
graph.add_node("agriculture", _agriculture)
graph.add_node("schemes",     _schemes)
graph.add_node("healthcare",  _healthcare)
graph.add_node("action",      _action)
graph.add_node("combiner",    _combiner)

graph.set_entry_point("coordinator")

graph.add_conditional_edges(
    "coordinator",
    route_after_coordinator,
    {
        "weather":     "weather",
        "agriculture": "agriculture",
        "schemes":     "schemes",
        "healthcare":  "healthcare",
        "action":      "action",
        "combiner":    "combiner",
    },
)

graph.add_edge("weather",     "combiner")
graph.add_edge("agriculture", "combiner")
graph.add_edge("schemes",     "combiner")
graph.add_edge("healthcare",  "combiner")
graph.add_edge("action",      "combiner")
graph.add_edge("combiner",    END)

app = graph.compile()
