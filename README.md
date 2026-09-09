# RuralAssist AI

A multi-agent AI platform that routes user questions to specialized agents — weather, government schemes, and healthcare guidance — and combines their answers into one clear response. Built as a demonstration of proper agentic AI architecture using LangGraph, FastAPI, and the Gemini API.

## What This Is

Rural users in India often have to search across many separate sources — weather sites, government portals, health resources — to get the information they need. Instead of one generic chatbot, RuralAssist AI uses a **Coordinator Agent** that reads a user's message, decides which specialized agent(s) are relevant, invokes them, and merges their outputs into one coherent answer.

This is a scoped, domain-specific assistant — not a general-purpose chatbot. Questions outside its domains (weather, schemes, healthcare) are gracefully declined with a suggestion to rephrase, rather than hallucinated.

## Architecture

```
User (React chat UI)
        │
        ▼
FastAPI  POST /chat
        │
        ▼
LangGraph StateGraph
        │
        ▼
  Coordinator Agent ──(Gemini: classify message → relevant agents)
        │
        ▼
  conditional routing, supports multiple agents in parallel
        │
   ┌────┼────────┐
   ▼    ▼        ▼
Weather Schemes Healthcare
(live   (static  (static
 API)    JSON)    JSON)
   │    │        │
   └────┴────────┘
        │
        ▼
   Combiner Agent (Gemini: merge results into one natural answer)
        │
        ▼
  Final response → React UI
```

## Agents

| Agent | Data source | Notes |
|---|---|---|
| **Coordinator** | Gemini (classification) | Decides which agent(s) a message needs |
| **Weather** | OpenWeatherMap API | Extracts the city from free text via a small Gemini call, then fetches live forecast data |
| **Schemes** | Curated static dataset (`schemes.json`) | Covers PM-Kisan, Ayushman Bharat, PMFBY, PM Awas Yojana-Gramin, Jan Dhan Yojana. Gemini is instructed to answer only from this data — no hallucinated scheme details |
| **Healthcare** | Curated static dataset (`healthcare.json`) | General guidance for common conditions (fever, cough/cold, diarrhea, minor injuries, maternal care). Explicitly instructed to never diagnose — always defers to a real healthcare worker |
| **Combiner** | Gemini | Merges whichever agents ran into one natural, coherent final answer |

## Tech Stack

- **Backend:** Python, FastAPI
- **Agent orchestration:** LangGraph (`StateGraph`, conditional edges, parallel fan-out for multi-agent requests)
- **LLM:** Gemini API (`gemini-3.5-flash`, via the `google-genai` SDK)
- **Frontend:** React + Tailwind CSS (Vite)
- **No database** — static JSON files serve the schemes/healthcare data needs; no persistence requirement exists for this MVP
- **No auth, payments, or Docker** — intentionally out of scope; this project demonstrates multi-agent architecture, not production infrastructure

## Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows; use source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

Run the server:
```bash
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`.

**Frontend** (separate terminal):
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

Open `http://localhost:5173` in a browser — both servers must be running.

## Known Limitations

- **Agriculture agent was scoped but not implemented**, due to time constraints — data.gov.in's Agmarknet API for mandi/crop prices was identified as the highest-risk, slowest integration to set up reliably within the project timeline. It would follow the same pattern as the Weather agent (live API + simple wrapper) if added later.
- **No conversation memory** — each message is handled independently; the system doesn't remember earlier turns in the same session.
- **Free-tier Gemini rate limits** can be hit during heavy testing/demo use — the system degrades gracefully with a retry mechanism and a clear fallback message rather than crashing.

## Design Decisions

- **Grounding via prompt instructions:** for the Schemes and Healthcare agents, Gemini is explicitly instructed to answer only from the provided curated data — this prevents hallucinated scheme eligibility or medical claims, which matters a great deal in these specific domains.
- **No SQLite:** evaluated and deliberately skipped — the project's data needs are fully served by static JSON datasets, avoiding unnecessary schema/migration complexity for an MVP with no persistence requirement.
- **LangGraph parallel fan-out pattern:** when the coordinator routes to multiple agents at once, each agent node returns only the specific state key it changed (not the full shared state) — required to avoid `InvalidUpdateError` from concurrent writes to shared state.
