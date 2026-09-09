# RuralAssist AI — Project Development Log

## Baseline Confirmation & Model Stabilization (Session 1)
- **Date**: 2026-09-10
- **Status**: Verified & Operational
- **Gemini Model in Use**: `gemini-flash-lite-latest` with automated failover pool (`gemini-3.5-flash-lite`, `gemini-3.7-flash`, `gemini-3.8-flash`, `gemini-3.6-flash`).
- **Audit Findings**:
  - `gemini-3.5-flash` had hit strict 20-request/day Free Tier quotas (`RESOURCE_EXHAUSTED`).
  - Google GenAI API inspection via `client.models.list()` identified `gemini-flash-lite-latest` and `gemini-3.6-flash` as active and recommended.
  - Implemented multi-model fallback and backoff in `backend/services/gemini_client.py` so requests never fail due to per-model daily quotas.
  - Confirmed `backend/.env` is properly ignored by Git (`git check-ignore backend/.env`) and no API keys are hardcoded in tracked files.

---

## Session 3: Agriculture Agent Implementation
- **Goal**: Add the fourth domain specialist (Agriculture) to the multi-agent architecture.
- **Architectural Scope Decision**:
  - Rather than integrating an external mandi-price API (flagged as high risk for rate limits and downtime), Agriculture was built using a curated, static `backend/data/agriculture.json` dataset following the identical grounding pattern used by Schemes and Healthcare.
  - This guarantees high reliability, fast local execution, and reproducible demo behavior.
- **What Changed**:
  - Created `backend/data/agriculture.json` covering 7 key agronomic topics: wheat irrigation stages, soil types and crop suitability, NPK fertilizer management, pest and disease control, crop selection and sowing seasons, organic farming practices, and cotton/vegetable crop care.
  - Implemented `backend/agents/agriculture_agent.py` with keyword matching and strict grounding prompt instructing Gemini to answer "based ONLY on this data" and to decline guessing.
  - Updated `backend/agents/coordinator.py` with comprehensive agriculture routing keywords and an explicit exclusion clause preventing scheme/subsidy queries (e.g. PM-Kisan) from misclassifying into agriculture.
  - Wired `_agriculture` wrapper node into `backend/graph.py` adhering to LangGraph's parallel fan-out invariant (returning only modified key `{"agriculture_result": ...}`).
  - Added `backend/test_agriculture.py` and updated `backend/test_graph.py`.
- **Verification**:
  - Classic spec multi-agent query verified: `"Will it rain tomorrow and should I irrigate my wheat field?"` correctly routed to `['weather', 'agriculture']` and synthesized into a single cohesive answer by the Combiner.

---

## Session 4: Weather Agent Dynamic Location Extraction
- **Goal**: Resolve the known limitation where the Weather Agent previously used a fixed/hardcoded default city (`Pune`).
- **What Changed**:
  - Updated `backend/agents/weather_agent.py` with `extract_location(message: str) -> tuple[str, bool]`:
    - Uses a lightweight Gemini call to extract the city or district from free-text user queries.
    - If no location is mentioned, it falls back to `Pune` and transparently discloses this in the response: `(assuming you mean Pune — let me know your location for accurate results)` instead of silently guessing.
    - If OpenWeatherMap returns a 404 (not found) for a misspelled city, it cleanly informs the user to check their spelling.
  - Updated `backend/test_weather.py` to cover:
    1. Explicit location: `"What's the weather in Visakhapatnam?"` (verified live Visakhapatnam data returned).
    2. No location in message: `"Will it rain tomorrow?"` (verified fallback to Pune with disclosure).
    3. Misspelled/ambiguous location: `"What's the weather in AsdfghjklCity?"` (verified friendly error guidance).
  - Configured test suites with UTF-8 stdout encoding to prevent Windows cp1252 `UnicodeEncodeError` when rendering Indian Rupee (`₹`) symbols.

---

## Session 5: Tools & Actions (Agentic Capability)
- **Goal**: Demonstrate that agents can act and persist state, not just answer questions.
- **Architectural Scope Decision**:
  - Implemented local JSON persistence in `backend/data/user_actions.json` rather than a full SQL/NoSQL database, strictly adhering to the student portfolio scope calibration.
  - Implemented safe AST-based arithmetic parsing in `backend/tools/calculator.py` using Python's `ast` module instead of `eval()`.
- **What Changed**:
  - Created `backend/tools/calculator.py`: Safely parses binary operations, unary signs, and whitelisted functions (`round`, `abs`, `sqrt`) without code injection vulnerabilities.
  - Created `backend/tools/task_tools.py`: Implements `create_task`, `save_note`, and `create_checklist` with persistent JSON updates to `backend/data/user_actions.json`.
  - Created `backend/agents/action_agent.py`: Dispatches action requests based on structured Gemini classification to the appropriate tool.
  - Updated `backend/state.py` to add `action_result: Optional[str]`.
  - Updated `backend/agents/coordinator.py` with the `action` route (calculations, tasks/reminders, notes, checklists).
  - Wired `_action` node into `backend/graph.py` with parallel fan-out compliance and edge to `combiner`.
  - Updated `backend/agents/combiner.py` to confirm actions naturally (e.g. "I've added a reminder for you...").
  - Created `backend/test_tools.py` verifying AST calculator safety, file persistence, agent dispatch, and Coordinator routing.
  - Added Action test cases to `backend/test_graph.py` (standalone calculation and multi-agent weather + action).

---

## Session 6: Conversation Memory
- **Goal**: Support follow-up questions across a browser session (e.g. "I'm growing rice" -> "what fertilizer should I use?").
- **Architectural Scope Decision**:
  - In-memory dictionary store keyed by `session_id` (`backend/services/memory_store.py`). No database or disk persistence for memory, matching MVP simplicity.
  - Windowed memory (last 4-6 turns) to cap token usage and avoid prompt bloat.
- **What Changed**:
  - Created `backend/services/memory_store.py` with `get_history`, `add_turn`, and `format_history_for_prompt`.
  - Extended `AgentState` in `state.py` with `session_id` and `conversation_history`.
  - Injected recent conversation history into Coordinator classification prompt and domain agent prompts (Agriculture and Weather).
  - Updated `backend/main.py` `/chat` endpoint to accept `session_id`, supply history to the graph, record completed turns, and return `session_id`.
  - Updated `frontend/src/api.js` to generate and maintain `currentSessionId` in memory via `crypto.randomUUID()` (no `localStorage`).
  - Added `backend/test_memory.py` validating the classic rice -> fertilizer multi-turn dialogue.

---

## Session 7: Image Input (Multimodal, Agriculture)
- **Goal**: Support multimodal crop disease inspection ("What's wrong with this plant?" + photo) with strict safety hedging.
- **Architectural Scope Decision**:
  - Dual-mode `/chat` endpoint supporting both `multipart/form-data` (file uploads) and `application/json` (pure text).
  - Strict hedging: AI never claims absolute diagnostic certainty from photos alone and explicitly directs users to visit their local Krishi Vigyan Kendra (KVK) or agricultural extension officer.
- **What Changed**:
  - Updated `backend/services/gemini_client.py` to accept `image_bytes` and `image_mime_type`, sending them via `types.Part.from_bytes` to Gemini's multimodal API.
  - Extended `AgentState` with `image_bytes` and `image_mime_type`.
  - Updated `backend/agents/agriculture_agent.py` to detect attached photos and execute multimodal crop health analysis with safety hedging.
  - Updated `backend/main.py` to support `multipart/form-data` with validation (5MB max size, JPG/PNG only) while keeping JSON requests backward compatible.
  - Updated `frontend/src/components/ChatInput.jsx` with an image upload button, hidden file input, and thumbnail preview with remove option.
  - Updated `frontend/src/components/MessageBubble.jsx` to render attached plant photos in the user message bubble.
  - Updated `frontend/src/App.jsx` and `frontend/src/api.js` to package files into `FormData`.
  - Created test fixture `backend/tests/fixtures/sample_plant.png` and test suite `backend/test_agriculture_image.py`.

---

## Session 8: Stylish, Grounded & Fully-Synced Chatbot UI
- **Goal**: Rebuild and polish the frontend with a distinctive, earthy visual design token system that avoids generic AI chatbot clichés (no dark-mode neon gradients, no cream+terracotta influencer themes, no uniform floaty SaaS cards, no tracked-out uppercase eyebrow tags).
- **Design Token Palette**:
  - Canvas: Oat Limestone (`#F4F1EA`)
  - Card / Assistant Surface: Milk Lime (`#FCFBF8`) with River Stone borders (`#E2DDD3`)
  - Body Text: Deep Loam (`#1C2620`, WCAG AAA 14.1:1 contrast)
  - Typography: Lora serif for branding & header display; Inter for crisp conversational UI body.
  - Domain Route Badges: Deep Moss (`#255940` Agriculture), River Slate (`#26526E` Weather), Amber Wheat (`#945F16` Schemes), Madder Brick (`#8A3535` Healthcare), Warm Bark (`#2F3E33` Actions).
  - Motion: Single deliberate 180ms ease-out anchor-settle animation on new messages; full support for `prefers-reduced-motion: reduce`.
- **Backend & Frontend Contract Sync**:
  - Unified `POST /chat` contract on `multipart/form-data` with fields `message`, `session_id`, and optional `file`.
  - Added support for PDF documents alongside JPG and PNG images (max 5MB).
  - Extended `ChatResponse` model in `backend/main.py` with `actions` and `error` fields.
- **Frontend Components Delivered**:
  - `api.js`: Unified multipart form-data transport, in-memory session UUID management, graceful error parsing.
  - `App.jsx`: Grounded header with status indicator, active domain indicators, "New chat" memory reset, and "Retry" affordance on connection drops.
  - `ChatWindow.jsx`: Intelligent scroll-lock with "↓ New messages" floating pill, rich empty state featuring RuralAssist emblem and 4 interactive multi-agent prompt cards.
  - `MessageBubble.jsx`: Native zero-dependency markdown parser (**bold**, lists, code, links), colored route tags with SVG icons, distinct Harvest Straw action confirmation cards, and inline rendering for images & PDFs.
  - `ChatInput.jsx`: Unified picker for images & PDFs with inline preview chip, inline error alerts in the interface's voice, Shift+Enter multi-line textarea, and visible focus rings.
  - `LoadingIndicator.jsx`: Rotating domain status updates ("Consulting agricultural records...", "Checking district weather...", etc.) with three-dot organic grain pulse.
- **Verification**:
  - `npm run build` compiled cleanly with 0 errors in 896ms.
  - Backend regression test suites (`test_tools.py`, `test_memory.py`, `test_agriculture_image.py`, `test_graph.py`) all passed 100%.

---

## Recommended Git Commit Message

```text
feat(frontend): stylish, grounded multi-agent UI with route badges and tool confirmations

- Propose and implement warm earthy design token system (oat limestone, deep loam, river stone)
- Add native markdown formatting, multi-agent route tags, and action confirmation ledger cards
- Support multimodal image and PDF uploads with inline staging chip and error alerts
- Implement intelligent auto-scroll lock with "New messages" indicator
- Add in-memory session reset and retry affordance for resilient offline/error handling
- Sync backend ChatResponse with actions and error fields and support PDF uploads
```

