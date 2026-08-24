# SYNTRA — Personal AI Assistant

**Phase 1: SYNTRA Core** — voice-or-text chat with an AI model, in English, Hindi, or Hinglish.

```
Frontend (React + Vite)  →  Backend (FastAPI)  →  OpenRouter  →  Backend  →  Frontend
```

---

## What's included in Phase 1

- Modern dark-theme chat UI (React + Vite + Tailwind CSS v4)
- Voice input via the browser's Web Speech API (mic button, live transcript, editable before sending)
- Text chat with short conversation-history context
- FastAPI backend that proxies chat requests to any model on OpenRouter
- Clean `AIService` abstraction — swap providers/models via env vars, no code changes
- CORS, input validation, structured error handling, and no leaked stack traces
- `.env.example` files for both frontend and backend — no secrets committed

**Not included yet** (see [Phase 2+](#roadmap) below): tasks, reminders, calendar, browser automation, computer control, long-term memory, voice *output*. These are intentionally out of scope for Phase 1.

---

## Project structure

```
SYNTRA/
├── backend/
│   ├── app/
│   │   ├── main.py              FastAPI app, CORS, health check
│   │   ├── config.py            Settings loaded from env vars / .env
│   │   ├── models.py            Pydantic request/response schemas
│   │   ├── routes/chat.py       POST /api/chat
│   │   └── services/ai_service.py   OpenRouter client (swappable)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          Header, ChatWindow, ChatMessage, MessageInput,
│   │   │                        VoiceButton, TypingIndicator
│   │   ├── hooks/                useChat.js, useSpeechRecognition.js
│   │   ├── services/api.js       fetch wrapper for the backend API
│   │   └── pages/Home.jsx        Main screen
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- An [OpenRouter](https://openrouter.ai/keys) API key

---

## 1. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and set:
#   OPENROUTER_API_KEY=sk-or-...
#   OPENROUTER_MODEL=openai/gpt-4o-mini   (or any model slug on OpenRouter)

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Check it's alive:

```bash
curl http://localhost:8000/api/health
# {"status":"ok","openrouter_configured":true,"model":"openai/gpt-4o-mini"}
```

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env    # defaults to http://localhost:8000, edit if your backend runs elsewhere
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## Configuration reference

**`backend/.env`**

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key. Never committed. |
| `OPENROUTER_MODEL` | Yes | Model slug, e.g. `openai/gpt-4o-mini`, `anthropic/claude-3.5-sonnet`. |
| `OPENROUTER_SITE_URL` | No | Sent to OpenRouter for analytics/rankings. |
| `OPENROUTER_SITE_NAME` | No | Same as above. |
| `CORS_ORIGINS` | No | Comma-separated origins allowed to call the API. Defaults to the local Vite dev server. |
| `AI_REQUEST_TIMEOUT` | No | Seconds before an OpenRouter request times out. Defaults to 30. |

**`frontend/.env`**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | URL of the backend. Defaults to `http://localhost:8000`. |

The API key is only ever read on the backend — it is never sent to or embedded in the frontend bundle.

---

## How voice input works

SYNTRA uses the browser's built-in `SpeechRecognition` API (available in Chrome, Edge, and most Chromium-based browsers; not in Firefox at the time of writing). There's a language selector for the recognizer (Hindi/Hinglish, English-India, English-US) — browsers don't have a distinct "Hinglish" mode, so Hindi (`hi-IN`) is the default and closest fit for mixed speech; you can switch to English or simply edit the transcribed text before sending. If the browser doesn't support speech recognition, or microphone permission is denied, the mic button is disabled and a clear message is shown — text chat still works normally.

---

## Testing checklist (all verified during development)

- [x] Backend starts cleanly and `/api/health` reports status
- [x] `/api/chat` returns a clear 503 when no API key is configured
- [x] Empty/whitespace messages are rejected with a validation error
- [x] Malformed request bodies are rejected, no stack trace leaked
- [x] Frontend builds (`npm run build`) with no errors
- [x] Frontend dev server and backend run together, CORS preflight succeeds
- [x] Backend-offline banner appears in the UI when the API is unreachable

To fully verify the AI response path yourself once your API key is set:

1. **Text (English):** "Explain recursion in simple terms." → expect a relevant English reply.
2. **Text (Hindi):** "मुझे मशीन लर्निंग आसान भाषा में समझाओ।" → expect a Hindi reply.
3. **Text (Hinglish):** "Machine learning ko ek real life example se samjhao." → expect a natural Hinglish/Hindi reply.
4. **Voice:** Click the mic, speak "Kal mujhe Python revise karna hai," confirm it appears as editable text.
5. **Voice + AI:** Speak "Explain what an API is," confirm it reaches the backend and a reply appears.
6. **Failure:** Stop the backend, send a message, confirm a clear error appears instead of a crash.

---

## Roadmap

- **Phase 2 — Personal Productivity:** tasks, to-dos, reminders, notifications, daily briefing, persistent database.
- **Phase 3 — Browser Intelligence:** open/search the web, inspect and summarize webpages, answer questions about documents.
- **Phase 4 — Computer Agent:** app launching, file discovery, controlled computer interaction, permission/confirmation system.
- **Phase 5 — Advanced Intelligence:** long-term memory, personalization, proactive recommendations, voice output.

The backend is structured with an isolated `AIService` and a routes layer so a future tool-routing layer (AI → Tool Router → Tasks/Calendar/Browser/Files) can be added without rewriting Phase 1.

---

## Known limitations

- Speech recognition quality depends entirely on the browser's built-in engine; there's no server-side speech-to-text fallback in Phase 1.
- Firefox does not currently support the Web Speech API — voice input will show a "not supported" message there; text chat is unaffected.
- Conversation context is kept in memory in the browser tab only (last ~12 turns) and is lost on refresh — there's no persistence yet (that's Phase 2+).
