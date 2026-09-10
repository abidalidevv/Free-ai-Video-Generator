# Backend Architecture — MoneyPrinterTurbo Integration

> **Purpose**: Map the existing MoneyPrinterTurbo (MPT) Python backend onto the
> Abid VideoForge AI React frontend. This document does **not** propose backend
> changes — MPT is the source of truth.
>
> **Scope**: How the frontend talks to MPT, which services it calls, what
> contracts it expects, and how long-running render jobs are streamed back to
> the UI.

---

## 1. Backend Reference (MoneyPrinterTurbo)

MoneyPrinterTurbo is a Python application that ships two surfaces:

| Surface | Module | Used by VideoForge UI? |
|---|---|---|
| Streamlit web UI | `webui/Main.py` | ❌ Replaced by this React UI |
| FastAPI REST API | `app/asgi.py` (uvicorn) | ✅ Primary contract |
| Internal task runner | `app/services/task.py` | ✅ via REST + WS |
| Config file | `config.toml` | ✅ via REST settings endpoints |
| Storage | `storage/` (local FS) | ✅ via REST file endpoints |

Default dev host: `http://127.0.0.1:8080` (FastAPI).

### 1.1 Backend service modules the frontend depends on

| Python module | Responsibility | Surfaced through |
|---|---|---|
| `app/services/llm.py` | Script + keyword generation across 16 LLM providers | `POST /api/v1/scripts`, `POST /api/v1/terms` |
| `app/services/voice.py` | TTS synthesis (Azure, edge-tts, ElevenLabs, OpenAI, SiliconFlow, GPT-SoVITS, Fish, MiniMax, Coqui) | `GET /api/v1/voices`, `POST /api/v1/voice/preview`, `POST /api/v1/tasks` |
| `app/services/material.py` | Pexels + Pixabay search, download, semantic match | `POST /api/v1/search-videos`, internal to task |
| `app/services/subtitle.py` | Whisper transcription + SRT generation | internal to task |
| `app/services/video.py` | FFmpeg compositing, encoding, finalize | internal to task |
| `app/services/task.py` | 15-stage pipeline orchestrator | `POST /api/v1/tasks`, `GET /api/v1/tasks/{id}` |
| `app/services/state.py` | In-memory task progress store | `GET /api/v1/tasks/{id}`, WS `/ws/tasks/{id}` |
| `app/config/config.py` | TOML load/save | `GET/PUT /api/v1/config` |
| `app/controllers/v1/*` | FastAPI routers | All `/api/v1/*` |

---

## 2. Transport

| Transport | Use |
|---|---|
| **HTTPS / JSON** | All CRUD: config, projects, voices, search, task submission |
| **WebSocket** | Live render progress: `ws://host/ws/tasks/{task_id}` emits `{ stageId, status, progress, message, payload }` events |
| **Static file** | Output download: `GET /tasks/{task_id}/{filename}.mp4` (served from `storage/tasks/`) |
| **Multipart** | Asset upload: `POST /api/v1/upload` for local materials and custom BGM |

A single Axios/`fetch` client is recommended; WebSocket is a thin
`WebSocketSubject` per active task.

---

## 3. High-level Data Flow

```
┌─────────────────┐   REST/JSON    ┌──────────────────────┐   spawn   ┌────────────────┐
│ React (Vite)    │ ─────────────▶ │ FastAPI (app/asgi)   │ ────────▶ │ task.py worker │
│ AppStateProvider│ ◀───────────── │ controllers/v1/*     │ ◀──────── │ services/*     │
└─────────┬───────┘    JSON        └──────────┬───────────┘   state    └────────────────┘
          │                                   │
          │           WebSocket               │
          └──────────  /ws/tasks/{id} ────────┘
                        progress events
```

1. UI hydrates settings from `GET /api/v1/config` on boot.
2. User builds a project locally (state in `AppStateProvider`).
3. **Submit render** → `POST /api/v1/tasks` returns `{ task_id }`.
4. UI opens WebSocket `/ws/tasks/{task_id}` and updates `renderQueue` slice.
5. Backend emits one event per pipeline stage (15 stages, see `PIPELINE.md`).
6. On `completed`, UI fetches `GET /api/v1/tasks/{task_id}` to read final
   `output_url`, duration, size, then prepends to `recentOutputs`.

---

## 4. Per-Page Contract

Each frontend page is documented here with inputs, outputs, required APIs,
models, responses, loading/error/validation/progress/notifications/storage.
The detailed endpoint↔component matrix lives in `API_MAPPING.md`.

### 4.1 `/` Dashboard (`src/routes/index.tsx`)
- **Inputs**: none (read-only).
- **Outputs**: navigation actions only.
- **APIs**:
  - `GET /api/v1/projects?limit=12&sort=updated_desc`
  - `GET /api/v1/outputs?limit=8`
  - `GET /api/v1/tasks?status=active`
  - `GET /api/v1/system/status` (GPU/CPU/RAM, queue depth)
- **Models**: `Project[]`, `Output[]`, `RenderTask[]`, `SystemStatus`.
- **Expected response**: paginated `{ items, total }` envelopes.
- **Loading**: 4 `<Skeleton>` blocks (one per panel).
- **Error**: silent for system status (show "—"); inline `<EmptyState>` for projects/outputs.
- **Validation**: none.
- **Progress events**: subscribe to global `/ws/tasks` broadcast to keep "Live Render Pipeline" card current.
- **Notifications**: dispatch `PUSH_NOTIFICATION` when a WS `completed`/`failed` event arrives.
- **Storage**: none.

### 4.2 `/basic-settings` (`src/routes/basic-settings.tsx`)
- **Inputs**: provider id, `api_key`, `base_url`, `model_name`, video source toggles.
- **Outputs**: persisted `config.toml`.
- **APIs**:
  - `GET /api/v1/config` → entire `config.toml`
  - `PUT /api/v1/config` → merge-patch
  - `POST /api/v1/providers/{id}/test` → `{ ok, latency_ms, message }`
  - `GET /api/v1/providers/{id}/models` → `string[]`
- **Models**: `LLMProviderConfig`, `APIKey`, `ProviderStatus`.
- **Expected response**: `{ saved_at, dirty: false }` for PUT.
- **Loading**: per-card spinner during `test`/`save`.
- **Error**: surfaces backend `detail` in red Alert under the card.
- **Validation**: client-side regex per provider (`sk-…`, UUID, etc.) + server echo.
- **Progress events**: none.
- **Notifications**: toast "Settings saved" on PUT 200.
- **Storage**: backend `config.toml`; UI mirrors masked key in `APIKey[]`.

### 4.3 `/create` Script Studio (`src/routes/create.tsx`)
- **Inputs**: `subject`, `language`, `tone`, `paragraphs`, `customSystemPrompt`.
- **Outputs**: `Script`, derived `Keyword[]`.
- **APIs**:
  - `POST /api/v1/scripts` → `{ video_script }`
  - `POST /api/v1/terms`   → `{ video_terms: string[] }`
  - `POST /api/v1/search-videos` (preview pane) → `{ videos: [{ url, thumb, duration }] }`
- **Models**: `Script`, `Keyword`.
- **Expected response**: plain JSON; script is a single string (split client-side into paragraphs for the editor).
- **Loading**: animated 5-step pipeline (script gen is single request — UI fakes intermediate ticks via timers until response).
- **Error**: editor stays empty + toast with backend `detail`.
- **Validation**: subject required (3-280 chars), paragraphs 1-10.
- **Progress events**: none (synchronous calls; usually < 30 s).
- **Notifications**: toast on completion ("Script ready · N words").
- **Storage**: result lives in `state.currentScript`; persisted with project save.

### 4.4 `/video-settings` (`src/routes/video-settings.tsx`)
- **Inputs**: `source`, `concatMode`, `transition`, `aspectRatio`, `maxClipDurationSec`, `encoder`, `resolution`, `fps`, `bitrateKbps`.
- **Outputs**: patched `VideoSettings` slice.
- **APIs**:
  - `GET /api/v1/system/encoders` → `{ nvenc: bool, hevc: bool, av1: bool }`
  - `POST /api/v1/search-videos` (Smart Matching preview) — same as 4.3.
- **Models**: `VideoSettings`.
- **Expected response**: encoder capability map.
- **Loading**: skeleton on first hardware probe.
- **Error**: greys out unsupported encoders.
- **Validation**: bitrate 1-50 000 kbps, clip 1-30 s.
- **Progress events**: none.
- **Notifications**: none (saved with project).
- **Storage**: state slice + project payload.

### 4.5 `/audio-studio` (`src/routes/audio-studio.tsx`)
- **Inputs**: `voiceId`, `volume`, `speed`, BGM mode/track/volume/fades.
- **Outputs**: `AudioSettings`.
- **APIs**:
  - `GET /api/v1/voices?provider=&lang=` → `Voice[]`
  - `POST /api/v1/voice/preview` body `{ provider, voice, text }` → `audio/mpeg` blob
  - `GET /api/v1/bgm` → `{ id, name, durationSec, url }[]`
  - `POST /api/v1/upload` (custom BGM) → `{ asset_id, url }`
- **Models**: `Voice`, `AudioSettings`.
- **Expected response**: voice preview is binary; cache by `voiceId+textHash`.
- **Loading**: waveform shows a shimmer until first audio decoded.
- **Error**: per-voice "preview unavailable" pill.
- **Validation**: preview text 1-200 chars; upload ≤ 50 MB, mp3/wav/ogg.
- **Progress events**: none.
- **Notifications**: toast on upload success.
- **Storage**: uploaded assets persisted server-side under `storage/local/bgm/`.

### 4.6 `/subtitle-studio` (`src/routes/subtitle-studio.tsx`)
- **Inputs**: typography (font, size, weight…), position, stroke, background, template id, animations, karaoke mode.
- **Outputs**: `SubtitleSettings`.
- **APIs**:
  - `GET /api/v1/fonts` → `{ family, weights }[]` (reads `resource/fonts/`)
  - `GET /api/v1/subtitle/templates` → `SubtitleTemplate[]`
- **Models**: `SubtitleSettings`, `SubtitleTemplate`, `SubtitleAnimation`.
- **Expected response**: font list is static; backend serves the file at `/static/fonts/{file}`.
- **Loading**: 35 skeleton font cards.
- **Error**: fallback to bundled web fonts list.
- **Validation**: font size 12-128, opacity 0-100.
- **Progress events**: none.
- **Notifications**: toast when brand kit applied.
- **Storage**: brand kit persisted client-side (Phase A); server-side under future `/api/v1/brand-kits` (Phase C — see `INTEGRATION_PLAN.md`).

### 4.7 `/render` Render Studio (`src/routes/render.tsx`)
- **Inputs**: triggered with `task_id` (state or query param).
- **Outputs**: live pipeline visualization.
- **APIs**:
  - `POST /api/v1/tasks` (entry from `/create`/`/video-settings` "Render")
  - `GET /api/v1/tasks/{id}`
  - **WS** `/ws/tasks/{id}` ← stage events
  - `POST /api/v1/tasks/{id}/cancel`
- **Models**: `RenderTask`, `PipelineStageState`.
- **Expected event**: `{ stageId, status, progress, message, payload?: { currentScene?, currentClip?, currentFile? } }`.
- **Loading**: stages start in `waiting`, transition to `running` then `completed` per event.
- **Error**: stage flips to `failed`, banner with `errorMessage`, "Retry" CTA.
- **Validation**: server-side only.
- **Progress events**: yes (primary consumer).
- **Notifications**: on `completed` and `failed` → `PUSH_NOTIFICATION`.
- **Storage**: final `output_url` written to `recentOutputs`.

### 4.8 `/queue` (`src/routes/queue.tsx`)
- **Inputs**: filter (`all/active/failed/completed`), bulk select.
- **Outputs**: cancel/retry/remove actions.
- **APIs**:
  - `GET /api/v1/tasks?status=…&page=`
  - `POST /api/v1/tasks/{id}/cancel`
  - `POST /api/v1/tasks/{id}/retry`
  - `DELETE /api/v1/tasks/{id}`
  - **WS** `/ws/tasks` broadcast (all tasks)
- **Models**: `RenderTask[]`.
- **Expected response**: `{ items, total }`.
- **Loading**: row skeletons.
- **Error**: row-level inline error message.
- **Validation**: confirm dialog on cancel/delete.
- **Progress events**: WS updates `progress` and `etaSec` per row.
- **Notifications**: success/error toast per action.
- **Storage**: `state.renderQueue`.

### 4.9 `/outputs` (`src/routes/outputs.tsx`)
- **Inputs**: search, filter, sort.
- **Outputs**: download, rename, delete.
- **APIs**:
  - `GET /api/v1/outputs?search=&page=&sort=`
  - `GET /api/v1/outputs/{id}` (metadata drawer)
  - `GET /tasks/{task_id}/{file}.mp4` (static)
  - `DELETE /api/v1/outputs/{id}`
  - `PATCH /api/v1/outputs/{id}` `{ name }`
- **Models**: `Output`.
- **Expected response**: `Output[]`.
- **Loading**: grid skeleton.
- **Error**: empty state with retry.
- **Validation**: name 1-120 chars.
- **Progress events**: none.
- **Notifications**: toast on delete/rename.
- **Storage**: server filesystem; UI mirror in `recentOutputs`.

### 4.10 `/projects` (`src/routes/projects.tsx`)
- **Inputs**: search, tag filter, grid/list toggle.
- **Outputs**: open, duplicate, delete, export.
- **APIs**:
  - `GET /api/v1/projects`
  - `GET /api/v1/projects/{id}` (full payload — script, keywords, settings)
  - `POST /api/v1/projects`
  - `PUT /api/v1/projects/{id}`
  - `DELETE /api/v1/projects/{id}`
  - `POST /api/v1/projects/{id}/duplicate`
  - `GET /api/v1/projects/{id}/export` (zip)
  - `POST /api/v1/projects/import` (multipart zip)
- **Models**: `Project` + nested `Script/Keyword[]/VideoSettings/AudioSettings/SubtitleSettings`.
- **Loading**: card grid skeleton.
- **Error**: inline toast.
- **Validation**: name required, unique per user.
- **Notifications**: toast on save/duplicate/delete.
- **Storage**: backend SQLite/JSON; assumption: MPT extends `config.toml` or
  adds `storage/projects/{id}.json` (the only piece **not** already in MPT —
  see `INTEGRATION_PLAN.md` Phase B).

### 4.11 `/api-manager` (`src/routes/api-manager.tsx`)
- **Inputs**: provider id, key label, raw key, note.
- **Outputs**: rotated/disabled keys.
- **APIs**:
  - `GET /api/v1/providers`        → catalog + live status
  - `POST /api/v1/providers/{id}/keys`
  - `DELETE /api/v1/providers/{id}/keys/{keyId}`
  - `POST /api/v1/providers/{id}/test`
- **Loading**: card spinners.
- **Error**: inline with provider docs link.
- **Validation**: provider-specific regex.
- **Notifications**: toast on add/remove/test.
- **Storage**: backend `config.toml` (or encrypted store if MPT enables one).

### 4.12 `/voices`, `/music`, `/effects`, `/templates`, `/assets`
Thin browsers. Read-only — see `API_MAPPING.md`. All write actions live in
the studios (Audio, Subtitle, Video Settings).

### 4.13 `/settings` (`src/routes/settings.tsx`)
- **Inputs**: rendering defaults, GPU prefs, storage paths, performance caps.
- **Outputs**: patched `config.toml`.
- **APIs**: `GET/PUT /api/v1/config`, `GET /api/v1/system/status`.
- Same loading/error/validation/notification pattern as `/basic-settings`.

### 4.14 `/logs`, `/developer`
- **APIs**: `GET /api/v1/logs?level=&since=&tail=`, `GET /api/v1/tasks/{id}/log`.
- WS optional: `/ws/logs` for tail.
- Read-only.

### 4.15 `/languages`
- **APIs**: `GET /api/v1/i18n/locales`. Read-only; UI mirror is the language switcher.

### 4.16 `/notifications`
- Pure client view of `state.notifications`. No backend (events are pushed by
  WS handlers across the app).

### 4.17 Auth-shell routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account`, `/billing`, `/subscription`, `/usage`, `/security`, `/profile`)
- **Out of scope for MPT**. MPT has no auth surface. These pages remain
  UI-only stubs until Lovable Cloud / external auth is wired (Phase D).

---

## 5. Concurrency & Idempotency

- **Single active render** is the MPT default. The frontend Queue page assumes
  the backend will run one task at a time and queue others. If MPT is run
  with a worker pool, the UI scales naturally (each `RenderTask` is
  independent).
- **Idempotency keys**: `POST /api/v1/tasks` should accept an
  `Idempotency-Key` header derived from `projectId + updatedAt` so a retry
  doesn't enqueue duplicates.
- **Cancellation**: cooperative — backend sets a flag; `task.py` checks
  between stages.

---

## 6. Security

- API key never leaves the backend after submission. UI receives a masked
  preview only.
- WS connection includes `?token=` (future, when auth lands).
- File download URLs are static; path traversal protection is the backend's
  responsibility.

---

## 7. Observability

- Backend logs: `GET /api/v1/logs` and `/ws/logs` feed `/logs` and
  `/developer`.
- Health: `GET /healthz` (UI top-bar "Live" badge).
- Per-task log: `GET /api/v1/tasks/{id}/log`.

See `PIPELINE.md` for the full stage event schema and `WORKFLOW.md` for
user-visible state transitions.
