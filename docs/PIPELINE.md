# Pipeline — Subject → Script → Render → Output

> Source of truth for stage IDs: `src/lib/render-pipeline.ts` →
> `PIPELINE_STAGES` (15 entries). Stage IDs map 1:1 to functions in
> MoneyPrinterTurbo's `app/services/task.py` and its co-services.

---

## 1. End-to-end flow

```
                        ┌──────────────┐
                        │   SUBJECT    │   user input on /create
                        └──────┬───────┘
                               ▼
                        ┌──────────────┐   POST /api/v1/scripts
                        │    SCRIPT    │── llm.generate_script
                        └──────┬───────┘
                               ▼
                        ┌──────────────┐   POST /api/v1/terms
                        │   KEYWORDS   │── llm.generate_terms
                        └──────┬───────┘
                               ▼
              ┌────────────────┴──────────────────┐
              ▼                ▼                  ▼
    ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
    │ VIDEO SETTINGS │ │     AUDIO      │ │   SUBTITLE     │
    │   (form only)  │ │   (form only)  │ │   (form only)  │
    └────────┬───────┘ └────────┬───────┘ └────────┬───────┘
             └───────────┬──────┴────────┬─────────┘
                         ▼               │
                ┌───────────────┐        │      POST /api/v1/tasks
                │ RENDER QUEUE  │◀───────┘      → returns task_id
                └───────┬───────┘
                        ▼
                ┌───────────────┐   15 backend stages
                │   RENDERING   │── streamed via WS /ws/tasks/{id}
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │    OUTPUTS    │   GET /api/v1/outputs
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │    HISTORY    │   /projects + /outputs
                └───────┬───────┘
                        ▼
                ┌───────────────┐   GET /api/v1/projects/{id}/export
                │    EXPORT     │   GET /tasks/{task_id}/{file}.mp4
                └───────────────┘
```

---

## 2. Stages 1–4: pre-render (synchronous REST)

| # | Phase | UI surface | Trigger | Endpoint | Result writes |
|---|---|---|---|---|---|
| 1 | Subject | `/create` Subject card | text input | — | `currentProject.subject` (local) |
| 2 | Script | `/create` Script Generator | "Generate Script" button | `POST /scripts` | `SET_SCRIPT` |
| 3 | Keywords | `/create` Keywords Manager | "Generate Keywords" button (auto after script) | `POST /terms` | `SET_KEYWORDS` |
| 4a | Video Settings | `/video-settings` | form edits | `GET /system/encoders` (probe) | `PATCH_VIDEO` |
| 4b | Audio | `/audio-studio` | voice select, BGM | `GET /voices`, `POST /voice/preview`, `POST /upload` | `PATCH_AUDIO` |
| 4c | Subtitle | `/subtitle-studio` | style edits | `GET /fonts`, `GET /subtitle/templates` | `PATCH_SUBTITLE` |

Transitions are user-driven (next button or sidebar nav). Each transition
sets `isDirty` and the autosave debounce eventually fires
`PUT /projects/{id}`.

---

## 3. Stage 5: enqueue render

**UI**: any studio's "Render" CTA, or the dashboard quick action.

**Request**: `POST /api/v1/tasks` with the `TaskRequest` body (see
`API_MAPPING.md` §13).

**Response**: `{ task_id, status: "queued" }`.

**Store**: `ENQUEUE_RENDER` adds a new `RenderTask` with `status: "queued"`,
`progress: 0`. The router then pushes `/render?id={task_id}`.

**Transition**: opens WS `ws://host/ws/tasks/{task_id}`. If the WS handshake
fails, the UI falls back to polling `GET /api/v1/tasks/{task_id}` every 2 s.

---

## 4. Stages 6–20: backend pipeline (15 stages)

These are the 15 stage IDs defined in `src/lib/render-pipeline.ts` and
their Python counterparts.

| # | `stageId` | UI label | Backend function | Emits payload |
|---|---|---|---|---|
| 1 | `preparing-project` | Preparing Project | `task.start` | — |
| 2 | `validating-settings` | Validating Settings | `task.validate_params` | warnings |
| 3 | `generating-script` | Generating Script | `llm.generate_script` *(skipped if script supplied)* | tokens, model |
| 4 | `generating-keywords` | Generating Keywords | `llm.generate_terms` *(skipped if supplied)* | terms count |
| 5 | `generating-voice` | Generating Voice | `voice.tts` | duration, file |
| 6 | `generating-subtitle` | Generating Subtitle | `subtitle.create` (Whisper) | srt path |
| 7 | `preparing-timeline` | Preparing Timeline | `task.build_timeline` | scene count |
| 8 | `searching-stock` | Searching Stock Videos | `material.search_videos` | provider, page |
| 9 | `matching-scenes` | Matching Scenes | `material.match` | currentScene |
| 10 | `downloading-assets` | Downloading Assets | `material.download` | currentFile, MB |
| 11 | `preparing-render` | Preparing Render | `video.prepare` | filter graph |
| 12 | `rendering` | Rendering Video | `video.combine_videos` | currentClip, % |
| 13 | `encoding` | Encoding | `video.encode` | fps, bitrate |
| 14 | `exporting` | Exporting | `video.finalize` | output path |
| 15 | `completed` | Completed | `task.complete` | `Output` |

### 4.1 Per-stage event contract

```ts
{ kind: "stage",
  taskId: ID,
  stageId: PipelineStageId,         // one of the 15 above
  status: "running" | "completed" | "failed" | "cancelled",
  progress: number,                 // 0-100 within this stage
  message?: string,
  payload?: {
    currentScene?: string,
    currentClip?: string,
    currentFile?: string
  }
}
```

### 4.2 Per-task event contract (overall)

```ts
{ kind: "task",
  taskId: ID,
  status: RenderStatus,             // queued|preparing|rendering|encoding|completed|failed|canceled
  progress: number,                 // 0-100 across all stages
  etaSec?: number,
  elapsedSec?: number }
```

### 4.3 Terminal events

```ts
{ kind: "complete", taskId: ID, output: Output }
{ kind: "error",    taskId: ID, errorMessage: string }
```

---

## 5. Stages 21–24: post-render

| # | Phase | UI surface | Trigger | Endpoint(s) | Notes |
|---|---|---|---|---|---|
| 21 | Outputs | `/outputs` + dashboard | `complete` event | `GET /outputs`, `GET /outputs/{id}` | drawer shows metadata |
| 22 | History | `/projects` | implicit (project saved with new `outputId`) | `GET /projects/{id}` | output appears in project sidebar |
| 23 | Export | `/outputs` row → "Download" | user action | `GET /tasks/{task_id}/{file}.mp4` (static) | browser download |
| 24 | Export project | `/projects` row → "Export" | user action | `GET /projects/{id}/export` (zip) | bundle with script + settings |

---

## 6. Cancellation

Cancellation is cooperative — `POST /tasks/{id}/cancel` flips a backend
flag; `task.py` checks between stages and emits a final
`{ kind: "task", status: "canceled" }`. The UI immediately greys the active
stage and shows a "Resume from last stage" CTA when the backend supports
checkpoint resume (MPT 1.2+); otherwise the CTA reads "Retry from start".

---

## 7. Retry

`POST /tasks/{id}/retry` either:
- restarts with the same `TaskRequest` (default), or
- if MPT supports it, resumes at the first non-completed stage.

The UI does not assume resume capability — it shows progress from zero
unless the first stage event reports `status: "completed"` immediately,
in which case stages are visually pre-filled.

---

## 8. Stage timing (informational, used for ETA fallback)

When the backend does not provide `etaSec`, the UI estimates from typical
durations (defaults, in seconds):

| Stage | Typical |
|---|---|
| preparing-project / validating-settings | < 1 |
| generating-script | 6–15 |
| generating-keywords | 3–8 |
| generating-voice | 0.4 × scriptSeconds |
| generating-subtitle | 0.6 × scriptSeconds |
| preparing-timeline | < 1 |
| searching-stock | 5–10 |
| matching-scenes | 2–4 |
| downloading-assets | 1 × clipCount |
| preparing-render | 2 |
| rendering | 0.8 × scriptSeconds (NVENC) / 2 × (CPU) |
| encoding | 0.3 × scriptSeconds |
| exporting | 1–3 |

These constants live nowhere yet — when adopted, place them in
`src/lib/render-pipeline.ts` next to `PIPELINE_STAGES` so they evolve
together.
