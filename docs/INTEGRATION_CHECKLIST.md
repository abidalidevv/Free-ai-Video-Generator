# Integration Checklist

Status legend: 🟥 **Pending** · 🟧 **Ready** (scaffolded, not wired) ·
🟦 **Connected** (calling backend) · 🟩 **Verified** (end-to-end test).

After **Phase 8B** the transport, providers, and hook layer are
**Connected** at the React root. Per-page binding (Phase 8C / "Phase 9")
will move the page rows below from Pending to Connected one route at a
time as the MoneyPrinterTurbo endpoints come online.

| Service | File | Status |
|---|---|---|
| LLM (scripts, terms) | `src/services/llm.service.ts` | 🟧 |
| Video search | `src/services/video.service.ts` | 🟧 |
| Voice / TTS | `src/services/voice.service.ts` | 🟧 |
| Subtitles / fonts / BGM | `src/services/subtitle.service.ts` | 🟧 |
| Render (tasks, outputs) | `src/services/render.service.ts` | 🟧 |
| Upload | `src/services/upload.service.ts` | 🟧 |
| Projects | `src/services/project.service.ts` | 🟧 |
| Settings / providers | `src/services/settings.service.ts` | 🟧 |
| Notifications | `src/services/notification.service.ts` | 🟧 (sonner fallback) |

## Hooks

| Hook | File | Status |
|---|---|---|
| `useApiHealth` | `src/hooks/useApiHealth.ts` | 🟧 |
| `useVoices` | `src/hooks/useVoices.ts` | 🟧 |
| `useGenerateScript` | `src/hooks/useGenerateScript.ts` | 🟧 |
| `useGenerateKeywords` | `src/hooks/useGenerateKeywords.ts` | 🟧 |
| `useSubmitRender` / `useCancelRender` / `useRetryRender` | `src/hooks/useRender.ts` | 🟧 |
| `useQueue` | `src/hooks/useQueue.ts` | 🟧 |
| `useTask` | `src/hooks/useTask.ts` | 🟧 |
| `useOutputs` | `src/hooks/useOutputs.ts` | 🟧 |
| `useProjects` / `useProject` / `useUpsertProject` / `useDeleteProject` | `src/hooks/useProjects.ts` | 🟧 |

## Transport

| Item | File | Status |
|---|---|---|
| Axios client + interceptors | `src/api/client.ts` | 🟧 |
| Endpoint catalogue | `src/api/endpoints.ts` | 🟧 |
| Query key registry | `src/api/query-keys.ts` | 🟧 |
| WebSocket manager | `src/api/ws.ts` | 🟧 |
| Upload pipeline | `src/api/upload.ts` | 🟧 |
| Error normalizer | `src/utils/error-handler.ts` | 🟧 |
| Retry policy | `src/utils/retry.ts` | 🟧 |
| Env / feature flags | `src/api/env.ts`, `.env.example` | 🟧 |
| `<ApiProvider>` | `src/providers/ApiProvider.tsx` | 🟦 (mounted in `__root.tsx`) |
| `<WebSocketProvider>` | `src/providers/WebSocketProvider.tsx` | 🟦 (mounted in `__root.tsx`) |

## Pages (binding status)

| Route | Primary hooks (planned) | Status |
|---|---|---|
| `/` | `useApiHealth`, `useQueue`, `useOutputs` | 🟥 |
| `/create` | `useGenerateScript`, `useGenerateKeywords`, video search | 🟥 |
| `/video-settings` | encoders query, video search preview | 🟥 |
| `/audio-studio` | `useVoices`, BGM query, upload | 🟥 |
| `/subtitle-studio` | fonts/templates queries | 🟥 |
| `/render` | `useSubmitRender` + WS subscription | 🟥 |
| `/queue` | `useQueue`, `useCancelRender`, `useRetryRender` | 🟥 |
| `/outputs` | `useOutputs` | 🟥 |
| `/projects` | `useProjects`, `useUpsertProject`, `useDeleteProject` | 🟥 |
| `/basic-settings`, `/api-manager` | settings/providers queries + mutations | 🟥 |
| `/voices` | `useVoices` | 🟥 |
| `/assets`, `/music` | upload, BGM query | 🟥 |
| `/logs`, `/developer` | WS `/ws/logs` | 🟥 |
| `/notifications` (+ bell) | WS `/ws/notifications` → app state | 🟥 |
| `/settings`, `/languages`, `/about`, `/help`, auth/account/billing | local-only | n/a |

## Endpoints (per MPT controller)

| Endpoint | Status |
|---|---|
| `GET /healthz` | 🟧 |
| `GET /system/status`, `GET /system/encoders` | 🟧 |
| `GET/PUT /config` | 🟧 |
| `GET /providers`, `POST /providers/{id}/test`, `GET /providers/{id}/models`, `POST/DELETE /providers/{id}/keys` | 🟧 |
| `POST /scripts`, `POST /terms` | 🟧 |
| `POST /search-videos`, `POST /search-images` | 🟧 |
| `GET /voices`, `POST /voice/preview` | 🟧 |
| `GET /fonts`, `GET /bgm`, `GET /subtitle/templates` | 🟧 |
| `GET/POST /tasks`, `GET/DELETE /tasks/{id}`, `POST /tasks/{id}/cancel`, `POST /tasks/{id}/retry` | 🟧 |
| `GET /outputs`, `GET/DELETE /outputs/{id}` | 🟧 |
| `GET/POST/PUT/DELETE /projects[/{id}]`, `POST /projects/{id}/duplicate`, `GET /projects/{id}/export`, `POST /projects/import` | 🟧 |
| `POST /upload` | 🟧 |
| `GET /logs` | 🟧 |
| `WS /ws/tasks/{id}`, `WS /ws/logs`, `WS /ws/notifications` | 🟧 |

## Blocking items before Phase 8B

1. **None on the React side.** Foundation is complete and typechecks.
2. **Backend side**: confirm Pydantic shapes for `TaskResponse`,
   `OutputResponse`, `ProviderResponse` match the TS interfaces in
   `src/types/responses.ts`; ship a thin `projects.py`, `outputs.py`,
   `providers.py`, `logs.py`, `system.py` wrapper for endpoints MPT
   doesn't expose today.
3. **DevOps**: configure CORS for the React dev origin and add the Vite
   `/api`, `/ws` proxy entries (see `docs/INTEGRATION_PLAN.md`).
