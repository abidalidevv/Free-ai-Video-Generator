# Backend Binding Plan

> Maps every React route → service hook → REST/WS endpoint → expected
> response shape → MoneyPrinterTurbo (MPT) Python module.
>
> The React app **never** owns business logic. Each page is a thin client
> over an MPT controller. This document is the contract for Phase 8B
> (wiring) — no UI changes are required to honor it.

Legend: `R` = REST, `WS` = WebSocket. Hooks are in `src/hooks/*`,
services in `src/services/*`, endpoint constants in `src/api/endpoints.ts`,
event types in `src/types/events.ts`.

---

## Dashboard — `/` (`src/routes/index.tsx`)

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| System health badge | `useApiHealth` | `settingsService.health` | `R GET /healthz` | `ApiHealth` | `app/asgi.py`, `app/services/state.py` |
| Active queue tile | `useQueue` | `renderService.list` | `R GET /tasks` | `TaskResponse[]` | `app/controllers/v1/video.py` |
| Recent outputs grid | `useOutputs` | `renderService.outputs` | `R GET /outputs` | `OutputResponse[]` | `app/controllers/v1/outputs.py` (wrapper over `storage/tasks/`) |
| Live render pipeline | direct WS | `createWebSocket(buildWsUrl(wsEndpoints.task(id)))` | `WS /ws/tasks/{id}` | `WsTaskProgressEvent` | `app/services/state.py` |

## Create Video — `/create` (`src/routes/create.tsx`)

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Generate script | `useGenerateScript` | `llmService.generateScript` | `R POST /scripts` | `ScriptResponse` | `app/controllers/v1/llm.py`, `app/services/llm.py` |
| Generate keywords | `useGenerateKeywords` | `llmService.generateTerms` | `R POST /terms` | `TermsResponse` | `app/services/llm.py` |
| Search stock clips | — | `videoService.searchVideos` | `R POST /search-videos` | `VideoSearchHit[]` | `app/controllers/v1/material.py`, `app/services/material.py` |

## Video Settings — `/video-settings`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Encoder capabilities | (Query) | `settingsService.encoders` | `R GET /system/encoders` | `ApiHealth["encoders"]` | `app/services/utils.py` (FFmpeg probe) |
| Preview stock matching | — | `videoService.searchVideos` | `R POST /search-videos` | `VideoSearchHit[]` | `app/services/material.py` |

## Audio Studio — `/audio-studio`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Voice library | `useVoices` | `voiceService.list` | `R GET /voices` | `VoiceResponse[]` | `app/controllers/v1/voice.py`, `app/services/voice.py` |
| Voice preview | — | `voiceService.preview` | `R POST /voice/preview` | `Blob` (audio) | `app/services/voice.py` |
| BGM library | (Query) | `subtitleService.bgm` | `R GET /bgm` | `BgmResponse[]` | `resource/songs/*` static |
| Custom BGM upload | — | `uploadFile({kind:"audio"})` | `R POST /upload` | `UploadResponse` | `app/controllers/v1/material.py` |

## Subtitle Studio — `/subtitle-studio`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Font catalogue | (Query) | `subtitleService.fonts` | `R GET /fonts` | `FontResponse[]` | `resource/fonts/*` static |
| Caption templates | (Query) | `subtitleService.templates` | `R GET /subtitle/templates` | `SubtitleTemplateResponse[]` | `app/services/subtitle.py` |

## Render — `/render`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Submit render | `useSubmitRender` | `renderService.submit` | `R POST /tasks` | `TaskResponse` | `app/controllers/v1/video.py`, `app/services/task.py` |
| Cancel | `useCancelRender` | `renderService.cancel` | `R POST /tasks/{id}/cancel` | `TaskResponse` | `app/services/task.py` |
| Retry | `useRetryRender` | `renderService.retry` | `R POST /tasks/{id}/retry` | `TaskResponse` | `app/services/task.py` |
| Live progress | — | WebSocket | `WS /ws/tasks/{id}` | `WsTaskProgressEvent`, `WsTaskStatusEvent`, `WsTaskCompleteEvent`, `WsTaskErrorEvent` | `app/services/state.py` |

## Queue — `/queue`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| List tasks | `useQueue` | `renderService.list` | `R GET /tasks` | `TaskResponse[]` | `app/controllers/v1/video.py` |
| Task detail | `useTask` | `renderService.get` | `R GET /tasks/{id}` | `TaskResponse` | `app/controllers/v1/video.py` |
| Delete task | — | `renderService.remove` | `R DELETE /tasks/{id}` | `void` | `app/controllers/v1/video.py` |

## Outputs — `/outputs`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| List outputs | `useOutputs` | `renderService.outputs` | `R GET /outputs` | `OutputResponse[]` | `app/controllers/v1/outputs.py` (wrapper) |
| Delete output | — | `renderService.removeOutput` | `R DELETE /outputs/{id}` | `void` | wrapper over `storage/tasks/{id}/` |

## Projects — `/projects`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| List | `useProjects` | `projectService.list` | `R GET /projects` | `ProjectResponse[]` | new `app/controllers/v1/projects.py` (thin JSON store) |
| Get | `useProject` | `projectService.get` | `R GET /projects/{id}` | `ProjectResponse` | as above |
| Create / Update | `useUpsertProject` | `projectService.create/update` | `R POST/PUT /projects[/{id}]` | `ProjectResponse` | as above |
| Delete | `useDeleteProject` | `projectService.remove` | `R DELETE /projects/{id}` | `void` | as above |
| Duplicate | — | `projectService.duplicate` | `R POST /projects/{id}/duplicate` | `ProjectResponse` | as above |
| Export / Import | — | `projectService.export/import` | `R GET/POST /projects/{id}/export · /projects/import` | `Blob` / `ProjectResponse` | as above |

## Basic Settings & API Manager — `/basic-settings`, `/api-manager`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Read config | (Query) | `settingsService.config` | `R GET /config` | `Record<string, unknown>` | `app/config/config.py` (TOML reader) |
| Write config | — | `settingsService.updateConfig` | `R PUT /config` | echoed config | `app/config/config.py` |
| Provider list | (Query) | `settingsService.providers` | `R GET /providers` | `ProviderResponse[]` | `app/config/config.py` + `app/services/llm.py` |
| Test provider | — | `settingsService.testProvider` | `R POST /providers/{id}/test` | `{ok, latencyMs}` | per-provider probe |
| List models | (Query) | `settingsService.providerModels` | `R GET /providers/{id}/models` | `{id,name}[]` | provider-specific |
| Save / Remove key | — | `settingsService.saveProviderKey / removeProviderKey` | `R POST/DELETE /providers/{id}/keys` | `ProviderResponse` | `app/config/config.py` |

## Voices — `/voices`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| List voices | `useVoices` | `voiceService.list` | `R GET /voices` | `VoiceResponse[]` | `app/services/voice.py` |

## Assets / Music — `/assets`, `/music`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Upload | — | `uploadFile` | `R POST /upload` | `UploadResponse` | `app/controllers/v1/material.py` |
| BGM list | (Query) | `subtitleService.bgm` | `R GET /bgm` | `BgmResponse[]` | static `resource/songs/*` |

## Logs — `/logs`, `/developer`

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Historical | (Query) | `get("/logs")` | `R GET /logs` | `LogEntryResponse[]` | new `logs.py` (tail `storage/logs/*`) |
| Live tail | direct WS | `createWebSocket(buildWsUrl(wsEndpoints.logs))` | `WS /ws/logs` | `WsLogEvent` | wrap `loguru` sink |

## Notifications — `/notifications`, AppShell bell

| Need | Hook | Service · Method | Endpoint | Response | MPT module |
|---|---|---|---|---|---|
| Push channel | direct WS | `createWebSocket(buildWsUrl(wsEndpoints.notifications))` | `WS /ws/notifications` | `WsNotificationEvent` | bridges `task.complete`/`task.error` |

---

## Pages that DO NOT bind to MPT

These are local-only UI surfaces and stay backed by `localStorage` /
preferences:

`/settings` (theme, language), `/languages`, `/about`, `/help`,
`/profile`, `/account`, `/billing`, `/subscription`, `/usage`,
`/security`, `/login`, `/signup`, `/forgot-password`, `/reset-password`,
`/effects`, `/templates` (until Phase C brand-kit sync lands).

---

## Phase 8B activation checklist

1. Wrap `<RouterProvider>` in `__root.tsx` with `<ApiProvider><WebSocketProvider>…</></>`.
2. Flip `enabled: true` (or remove the flag) inside each hook as the
   matching MPT endpoint becomes available.
3. Replace seed arrays in routes with hook reads (skeletons are already
   in place from Phase 7.5).
4. Mount one global `/ws/notifications` and `/ws/tasks/{active}` subscription
   in `AppShell`; dispatch to `AppStateProvider` actions.
