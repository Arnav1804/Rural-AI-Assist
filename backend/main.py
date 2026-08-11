"""
FastAPI entry point for RuralAssist AI.
Single POST /chat endpoint that invokes the LangGraph pipeline.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import app as graph_app


# ---------------------------------------------------------------------------
# App & CORS
# ---------------------------------------------------------------------------

app = FastAPI(title="RuralAssist AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    route: list


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    initial_state = {
        "message": req.message,
        "route": [],
        "weather_result": None,
        "agriculture_result": None,
        "schemes_result": None,
        "healthcare_result": None,
        "final_response": None,
    }

    try:
        result = graph_app.invoke(initial_state)
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": f"Graph execution failed: {str(e)}"},
        )

    return ChatResponse(
        response=result.get("final_response", "No response generated."),
        route=result.get("route", []),
    )
