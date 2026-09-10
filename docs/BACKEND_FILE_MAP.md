# Backend File Map — MoneyPrinterTurbo ↔ VideoForge Frontend

> Each row lists a Python file in the existing MoneyPrinterTurbo repository,
> the responsibility it carries, the REST/WS endpoint(s) it exposes, and the
> React route(s) and store action(s) that consume it. Use this as the
> reverse-lookup when modifying a backend file: it tells you which UI
> surfaces depend on it.

## 1. ASGI entrypoint

| Backend file | Role | Frontend consumer |
|---|---|---|
| `main.py` | Uvicorn launcher | n/a |
| `app/asgi.py` | FastAPI app, CORS, router mount, static `/tasks` | `src/components/app-shell.tsx` (base URL), all routes |
| `app/router.py` | `/api/v1` aggregator | n/a |

CORS must allow the Vite dev origin (`http://localhost:8080`) and the
deployed origin.

## 2. Controllers (FastAPI routers)

| Backend file | Endpoints | Frontend routes | Store action |
|---|---|---|---|
| `app/controllers/v1/llm.py` | `POST /api/v1/scripts`, `POST /api/v1/terms` | `/create` | `SET_SCRIPT`, `SET_KEYWORDS` |
| `app/controllers/v1/video.py` | `POST /api/v1/tasks`, `GET /api/v1/tasks`, `GET /api/v1/tasks/{id}`, `POST /api/v1/tasks/{id}/cancel`, `POST /api/v1/tasks/{id}/retry`, `DELETE /api/v1/tasks/{id}` | `/render`, `/queue`, `/create`, `/video-settings` | `ENQUEUE_RENDER`, `UPDATE_RENDER` |
| `app/controllers/v1/material.py` | `POST /api/v1/search-videos`, `POST /api/v1/upload` | `/create`, `/video-settings`, `/audio-studio`, `/assets` | local component state |
| `app/controllers/v1/voice.py` | `GET /api/v1/voices`, `POST /api/v1/voice/preview` | `/audio-studio`, `/voices` | `SET_VOICE` |
| `app/controllers/v1/config.py` *(new wrapper if absent)* | `GET/PUT /api/v1/config` | `/basic-settings`, `/settings`, `/api-manager` | `PATCH_PREFS` |
| `app/controllers/v1/providers.py` *(new wrapper if absent)* | `GET /api/v1/providers`, `POST /api/v1/providers/{id}/test`, `…/keys` | `/basic-settings`, `/api-manager` | local |
| `app/controllers/v1/system.py` *(new wrapper if absent)* | `GET /api/v1/system/status`, `GET /api/v1/system/encoders`, `GET /healthz` | `/`, top-bar, `/video-settings`, `/settings` | n/a |
| `app/controllers/v1/projects.py` *(Phase B — see `INTEGRATION_PLAN.md`)* | CRUD + import/export | `/projects`, `/create` | `SET_PROJECT` |
| `app/controllers/v1/outputs.py` *(Phase B)* | List/get/delete/rename outputs | `/outputs`, `/` | `recentOutputs` |
| `app/controllers/v1/logs.py` *(Phase B)* | `GET /api/v1/logs`, `GET /api/v1/tasks/{id}/log` | `/logs`, `/developer` | n/a |
| `app/controllers/v1/ws.py` *(Phase B)* | `WS /ws/tasks/{id}`, `WS /ws/tasks`, `WS /ws/logs` | `/render`, `/queue`, `/`, `/logs` | `UPDATE_RENDER`, `PUSH_NOTIFICATION` |

Rows marked *(new wrapper)* assume MPT already implements the logic
internally (e.g. `app/config/config.py` already reads/writes `config.toml`);
only a thin FastAPI router is required to expose it. **No business logic is
being added.**

## 3. Services (called by controllers and the task runner)

| Backend file | Purpose | Pipeline stage(s) |
|---|---|---|
| `app/services/llm.py` | Provider abstraction (OpenAI, Azure, Gemini, Groq, Moonshot, DeepSeek, Qwen, Anthropic, Ollama, OpenRouter, g4f, OneAPI, Cloudflare, Ernie, Pollinations, SiliconFlow) | `generating-script`, `generating-keywords` |
| `app/services/voice.py` | 9 TTS providers + audio mux | `generating-voice` |
| `app/services/material.py` | Pexels/Pixabay search, download, semantic ranking | `searching-stock`, `matching-scenes`, `downloading-assets` |
| `app/services/subtitle.py` | Whisper transcription, SRT building, styling | `generating-subtitle` |
| `app/services/video.py` | FFmpeg graph build, NVENC/CPU encode, finalize | `preparing-render`, `rendering`, `encoding`, `exporting` |
| `app/services/task.py` | 15-stage orchestrator; writes progress into `state.py` | all stages |
| `app/services/state.py` | In-memory task progress map | WS source |
| `app/services/utils.py` | Path helpers, ID, time | n/a |

## 4. Models / schemas

| Backend file | TS counterpart |
|---|---|
| `app/models/schema.py` (Pydantic) | `src/types/index.ts` |
| `app/models/exception.py` | mapped to `errorMessage` strings |
| `app/models/const.py` | `src/lib/constants.ts` |

The TS types in `src/types/index.ts` are the authoritative client contract.
Any Pydantic schema field added in MPT must be mirrored here (or the field
is dropped client-side without error).

## 5. Config & storage

| Backend path | Role | Frontend touchpoint |
|---|---|---|
| `config.toml` | All provider keys, defaults | `GET/PUT /api/v1/config` → `/basic-settings`, `/settings` |
| `storage/tasks/{task_id}/` | Per-task working dir + final mp4 | static download URL |
| `storage/local/` | Uploaded BGM and stock | `POST /api/v1/upload`, `/assets` |
| `resource/fonts/` | Bundled subtitle fonts | `GET /api/v1/fonts` → `/subtitle-studio` |
| `resource/songs/` | Built-in BGM library | `GET /api/v1/bgm` → `/audio-studio` |

## 6. Reverse lookup — frontend file → backend dependencies

| Frontend file | Backend modules touched |
|---|---|
| `src/routes/index.tsx` | `projects.py`, `outputs.py`, `video.py`, `system.py`, `ws.py` |
| `src/routes/basic-settings.tsx` | `config.py`, `providers.py`, `llm.py` |
| `src/routes/create.tsx` | `llm.py`, `material.py` |
| `src/routes/video-settings.tsx` | `system.py`, `material.py` |
| `src/routes/audio-studio.tsx` | `voice.py`, `material.py` (upload), `resource/songs` |
| `src/routes/subtitle-studio.tsx` | `subtitle.py` (style only), `resource/fonts` |
| `src/routes/render.tsx` | `video.py` + WS `task.py` |
| `src/routes/queue.tsx` | `video.py`, `state.py`, WS |
| `src/routes/outputs.tsx` | `outputs.py`, static |
| `src/routes/projects.tsx` | `projects.py` |
| `src/routes/api-manager.tsx` | `providers.py`, `config.py` |
| `src/routes/settings.tsx` | `config.py`, `system.py` |
| `src/routes/logs.tsx`, `src/routes/developer.tsx` | `logs.py`, WS `/ws/logs` |
| `src/routes/voices.tsx`, `src/routes/music.tsx`, `src/routes/effects.tsx`, `src/routes/templates.tsx`, `src/routes/assets.tsx` | read-only listings via `voice.py`, `material.py`, `resource/*` |
| `src/components/app-shell.tsx` | `system.py` (health), `ws.py` (global notifications) |
| `src/components/render/*` | WS `/ws/tasks/{id}` |
| `src/store/app-state.tsx` | n/a (pure client) — consumes all of the above |
| `src/lib/render-pipeline.ts` | maps to `task.py` stage IDs |

## 7. Files that exist client-side but have **no** backend counterpart

These remain UI-only (or persist in `localStorage`) until a backend owner is
added. Listed here so they are not mistakenly wired to non-existent
endpoints.

- Brand kits (`/subtitle-studio` brand panel)
- Favorites / pins (voices, templates, models)
- Theme, language, notification prefs (`UserPreferences`)
- Account / billing / subscription / usage / security / profile
  (`auth-shell` routes) — MPT has no auth.
