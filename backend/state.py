from typing import List, Optional, TypedDict


class AgentState(TypedDict):
    message: str                            # the user's original question
    session_id: Optional[str]               # conversation session id
    conversation_history: Optional[List[dict]] # recent turns [{"role": ..., "content": ...}]
    image_bytes: Optional[bytes]            # optional attached image data (jpg/png)
    image_mime_type: Optional[str]          # MIME type of attached image
    route: List[str]                        # which agents to run, e.g. ["weather", "schemes"]
    weather_result: Optional[str]
    agriculture_result: Optional[str]
    schemes_result: Optional[str]
    healthcare_result: Optional[str]
    action_result: Optional[str]            # result from tools/actions (calculator, tasks, notes, checklists)
    final_response: Optional[str]           # combined answer sent back to the user
