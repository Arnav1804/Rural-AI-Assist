"""
FastAPI entry point for RuralAssist AI.
Single POST /chat endpoint that invokes the LangGraph pipeline.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import app as graph_app
import uuid
from typing import Optional, Any
from services.memory_store import get_history, add_turn

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}

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
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    route: list
    session_id: str
    actions: Optional[Any] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
async def chat(request: Request):
    content_type = request.headers.get("content-type", "")
    image_bytes = None
    image_mime_type = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        message = form.get("message")
        if not message:
            raise HTTPException(status_code=400, detail="Field 'message' is required.")
        session_id = form.get("session_id")
        image_file = form.get("file") or form.get("image")

        if image_file and hasattr(image_file, "read"):
            mime = getattr(image_file, "content_type", "")
            if mime not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type '{mime}'. Only JPG and PNG images or PDF documents are supported."
                )
            
            data = await image_file.read()
            if len(data) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="File too large. Maximum allowed size is 5MB."
                )
            image_bytes = data
            image_mime_type = mime
    else:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
        message = body.get("message")
        if not message:
            raise HTTPException(status_code=400, detail="Field 'message' is required.")
        session_id = body.get("session_id")

    session_id = session_id or str(uuid.uuid4())
    history = get_history(session_id)

    initial_state = {
        "message": message,
        "session_id": session_id,
        "conversation_history": history,
        "image_bytes": image_bytes,
        "image_mime_type": image_mime_type,
        "route": [],
        "weather_result": None,
        "agriculture_result": None,
        "schemes_result": None,
        "healthcare_result": None,
        "action_result": None,
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

    final_reply = result.get("final_response", "No response generated.")

    # Save turns into in-memory session store
    add_turn(session_id, "user", message)
    add_turn(session_id, "assistant", final_reply)

    return ChatResponse(
        response=final_reply,
        route=result.get("route", []),
        session_id=session_id,
        actions=result.get("action_result"),
        error=None,
    )
