from typing import List, Optional, TypedDict


class AgentState(TypedDict):
    message: str                            # the user's original question
    route: List[str]                        # which agents to run, e.g. ["weather", "schemes"]
    weather_result: Optional[str]
    agriculture_result: Optional[str]
    schemes_result: Optional[str]
    healthcare_result: Optional[str]
    final_response: Optional[str]           # combined answer sent back to the user
