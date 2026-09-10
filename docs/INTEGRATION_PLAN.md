# Backend Integration Roadmap

> Production-level plan to connect the existing React frontend to the
> existing MoneyPrinterTurbo (MPT) Python backend. No fake APIs — every
> entry below maps to a file or controller that already exists in MPT (or
> a thin wrapper around its existing services). No business logic is added
> to MPT.
>
> Effort estimates are for a **single senior full-stack engineer** and assume
> the MPT backend is running locally on `http://127.0.0.1:8080`. Multiply by
> 1.3–1.5 for shared / part-time staffing.

---

## Scoring legend

| Field | Values |
|---|---|
| Priority | P0 (blocker) · P1 (high) · P2 (nice-to-have) |
| Difficulty | ★ trivial · ★★ standard · ★★★ involved · ★★★★ hard |
| Risk | Low / Medium / High |
| Effort | engineer-days |

---

## Phase 0 — Foundation (P0)

Wire the transport layer, env, types, and dev proxy. Nothing user-visible.

| Item | Pri | Diff | Risk | Effort | Backend files | Frontend files |
|---|---|---|---|---|---|---|
| `.env` with `VITE_API_BASE_URL`, `VITE_WS_BASE_URL` | P0 | ★ | L | 0.25 | — | `.env`, `src/api/client.ts` (new) |
| `axios`/fetch client wrapper with error normalizer | P0 | ★ | L | 0.5 | — | `src/api/client.ts` |
| TanStack Query provider + devtools | P0 | ★ | L | 0.25 | — | `src/routes/__root.tsx`, `src/router.tsx` |
| Vite dev proxy `/api`, `/ws`, `/tasks` → MPT | P0 | ★ | L | 0.25 | — | `vite.config.ts` |
| Verify Pydantic → TS type parity | P0 | ★★ | M | 1 | `app/models/schema.py` | `src/types/index.ts` |
| CORS allowlist on MPT for dev origin | P0 | ★ | L | 0.25 | `app/asgi.py` (config only) | — |

**Phase 0 total: ~2.5 days.** Dependencies: none. Risk drivers: schema
drift between TS and Pydantic.

---

## Phase A — Read-only hydration (P0)

Replace seed data with live reads. No mutations yet — safe to ship behind
a feature flag.

| Item | Pri | Diff | Risk | Effort | Backend files | Frontend files |
|---|---|---|---|---|---|---|
| `GET /config` integration | P0 | ★★ | L | 1 | `app/controllers/v1/config.py` (thin wrapper) | `src/routes/basic-settings.tsx`, `src/routes/settings.tsx` |
| `GET /system/status`, `/healthz`, `/system/encoders` | P0 | ★ | L | 0.5 | `app/controllers/v1/system.py` (new wrapper) | `src/components/app-shell.tsx`, `src/routes/index.tsx`, `src/routes/video-settings.tsx` |
| `GET /voices` integration | P0 | ★★ | L | 1 | `app/controllers/v1/voice.py` | `src/routes/audio-studio.tsx`, `src/routes/voices.tsx` |
| `GET /fonts`, `/bgm`, `/subtitle/templates` | P1 | ★ | L | 1 | static handlers around `resource/` | `src/routes/subtitle-studio.tsx`, `src/routes/audio-studio.tsx`, `src/routes/music.tsx` |
| `GET /tasks` integration (Queue) | P0 | ★★ | L | 1 | `app/controllers/v1/video.py` (already exists in MPT) | `src/routes/queue.tsx`, `src/routes/index.tsx` |
| `GET /outputs` integration | P0 | ★★ | L | 1 | `app/controllers/v1/outputs.py` (new wrapper around `storage/tasks/`) | `src/routes/outputs.tsx`, `src/routes/index.tsx` |
| Skeletons + error states wired to Query | P0 | ★ | L | 1 | — | all routes |

**Phase A total: ~6.5 days.** Dependencies: Phase 0. Risk: low — all reads.

---

## Phase B — Mutations & long-running tasks (P0)

The user can actually render a video end-to-end.

| Item | Pri | Diff | Risk | Effort | Backend files | Frontend files |
|---|---|---|---|---|---|---|
| `POST /scripts` and `POST /terms` | P0 | ★★ | M | 1 | `app/controllers/v1/llm.py` (exists) | `src/routes/create.tsx` |
| `POST /search-videos` | P0 | ★★ | L | 0.5 | `app/controllers/v1/material.py` (exists) | `src/routes/create.tsx`, `src/routes/video-settings.tsx` |
| `POST /voice/preview` returning audio blob | P1 | ★★ | M | 1 | `app/controllers/v1/voice.py` | `src/routes/audio-studio.tsx`, `src/components/render/*` |
| `POST /upload` (multipart, custom BGM) | P1 | ★★ | M | 1 | `app/controllers/v1/material.py` | `src/routes/audio-studio.tsx`, `src/routes/assets.tsx` |
| `POST /tasks` (submit render) with `TaskRequest` builder | P0 | ★★★ | H | 2 | `app/controllers/v1/video.py`, `app/services/task.py` | `src/store/app-state.tsx`, `src/api/mutations/tasks.ts` (new) |
| **WS `/ws/tasks/{id}`** live pipeline | P0 | ★★★★ | H | 3 | `app/controllers/v1/ws.py` (new wrapper around `state.py`) | `src/api/ws.ts` (new), `src/routes/render.tsx`, `src/components/render/*` |
| `POST /tasks/{id}/cancel` + `/retry` + `DELETE` | P0 | ★★ | M | 1 | `app/controllers/v1/video.py` | `src/routes/queue.tsx`, `src/routes/render.tsx` |
| Notification bridge (WS → `PUSH_NOTIFICATION` → toast) | P0 | ★★ | L | 1 | — | `src/api/ws.ts`, `src/components/app-shell.tsx` |

**Phase B total: ~10.5 days.** Dependencies: Phase A. Risk drivers: WS
protocol details (event names, reconnect semantics) — verify against
`app/services/state.py` first.

---

## Phase C — Persistence & polish (P1)

Projects survive reloads; multi-tab is consistent; brand kits are
shareable.

| Item | Pri | Diff | Risk | Effort | Backend files | Frontend files |
|---|---|---|---|---|---|---|
| `POST /projects`, `PUT /projects/{id}`, `GET /projects[/{id}]`, `DELETE` | P1 | ★★★ | M | 2 | `app/controllers/v1/projects.py` (new) + small storage shim (`storage/projects/{id}.json`) | `src/routes/projects.tsx`, `src/routes/create.tsx` |
| Autosave w/ debounce + `<SaveIndicator>` wired | P1 | ★★ | L | 1 | — | `src/store/app-state.tsx`, `src/components/shared/*` |
| `POST /projects/{id}/duplicate`, `/export`, `/import` | P1 | ★★ | M | 1.5 | `projects.py` | `src/routes/projects.tsx` |
| `PATCH/DELETE /outputs/{id}` rename + delete | P1 | ★ | L | 0.5 | `outputs.py` | `src/routes/outputs.tsx` |
| `GET /logs` + `WS /ws/logs` | P2 | ★★ | L | 1 | `logs.py` (tail `storage/logs/`) | `src/routes/logs.tsx`, `src/routes/developer.tsx` |
| Provider CRUD: `POST/DELETE /providers/{id}/keys`, `POST /providers/{id}/test`, `GET /providers/{id}/models` | P1 | ★★ | M | 1.5 | `providers.py` (new) reading/writing `config.toml` via `app/config/config.py` | `src/routes/basic-settings.tsx`, `src/routes/api-manager.tsx` |
| BroadcastChannel multi-tab sync | P2 | ★★ | M | 1 | — | `src/store/app-state.tsx` |
| Brand kits server-side `POST/GET /brand-kits` | P2 | ★★ | L | 1 | `brand_kits.py` (new, optional) | `src/routes/subtitle-studio.tsx` |

**Phase C total: ~9.5 days.** Dependencies: Phase B. Risk: project
serialization format — pin it in `src/types/index.ts` (`ProjectFull`).

---

## Phase D — Auth & accounts (P2, optional)

Only needed if the app is deployed beyond a single trusted desktop.

| Item | Pri | Diff | Risk | Effort | Backend files | Frontend files |
|---|---|---|---|---|---|---|
| Enable Lovable Cloud (Supabase) | P2 | ★★ | M | 0.5 | n/a | `src/integrations/supabase/*` (generated) |
| Wire `/login`, `/signup`, `/forgot`, `/reset` to Supabase | P2 | ★★ | M | 2 | — | `src/routes/login.tsx` … |
| `_authenticated` layout + route guards | P2 | ★★ | M | 1 | — | `src/routes/_authenticated.tsx` (new) |
| Add `?token=` to WS handshake; bearer on REST | P2 | ★★★ | M | 1.5 | `app/asgi.py` auth middleware | `src/api/client.ts`, `src/api/ws.ts` |
| User-scoped projects in `storage/users/{uid}/projects/…` | P2 | ★★★ | H | 2 | `projects.py` | — |
| `/account`, `/billing`, `/subscription`, `/usage`, `/security` | P2 | ★★ | L | 2 | optional Stripe via Lovable | corresponding routes |

**Phase D total: ~9 days.** Dependencies: Phase C. Skip entirely if MPT
stays single-user/desktop.

---

## Phase E — Hardening (P1)

Production-readiness pass; do not ship to real users without this.

| Item | Pri | Diff | Risk | Effort | Backend files | Frontend files |
|---|---|---|---|---|---|---|
| Idempotency keys on `POST /tasks` (header `Idempotency-Key`) | P1 | ★★ | M | 1 | `app/controllers/v1/video.py` | `src/api/mutations/tasks.ts` |
| Centralized error normalizer + Sentry breadcrumbs | P1 | ★★ | L | 1 | — | `src/api/client.ts`, `src/lib/error-capture.ts` |
| Rate-limit awareness (429 with `Retry-After`) | P1 | ★★ | M | 1 | `material.py`, `llm.py` | `src/api/client.ts` |
| File-size + MIME validation parity (client + server) | P1 | ★ | L | 0.5 | `material.py` upload | `src/routes/audio-studio.tsx` |
| Cancel-safe WS cleanup, AbortController on every query | P1 | ★★ | M | 1 | — | `src/api/*` |
| Observability: structured logs from FE → backend `/api/v1/client-logs` (optional) | P2 | ★★ | L | 1 | optional `client_logs.py` | `src/lib/lovable-error-reporting.ts` |
| Load testing the WS layer (concurrent renders) | P1 | ★★★ | H | 2 | — | — |

**Phase E total: ~7.5 days.**

---

## Summary timeline

| Phase | Total days | Cumulative |
|---|---|---|
| 0 — Foundation | 2.5 | 2.5 |
| A — Read-only hydration | 6.5 | 9 |
| B — Mutations + WS | 10.5 | 19.5 |
| C — Persistence + polish | 9.5 | 29 |
| D — Auth (optional) | 9 | 38 |
| E — Hardening | 7.5 | 45.5 |

**Single-user desktop MVP** (Phases 0 + A + B + E light): **~20 days**.
**Production multi-user SaaS** (all phases): **~45 days**.

---

## Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Pydantic ↔ TS drift | Silent data loss | Schema parity check job + automated TS generation from `app/models/schema.py` |
| WS protocol mismatch | Renders look stuck | Phase B starts with a 1-day spike against `app/services/state.py` before front-end work |
| MPT has no projects controller | Phase C blocked | Phase C ships a thin `projects.py` wrapper around JSON files — does not change MPT business logic |
| Single render at a time in MPT | Queue is mostly visual | Document the constraint; show "Will start when current finishes" pill |
| Rate-limited stock providers | Mid-render failure | Auto-fallback Pexels ↔ Pixabay; surface in `/api-manager` |
| Long renders blow WS idle timeouts | Stuck progress bar | Server-side keepalive ping every 15 s; client treats >30 s silence as "reconnect" |
| File paths leak in static URL | Security | Phase D adds signed URLs; pre-D, restrict static mount to `storage/tasks/{task_id}` only |

---

## Acceptance criteria per phase

- **Phase 0** — `curl $VITE_API_BASE_URL/healthz` works through Vite proxy.
- **Phase A** — Dashboard, Queue, and Outputs show real data; offline → graceful skeleton/empty.
- **Phase B** — A new render submitted from `/create` reaches `/outputs` end-to-end with live progress; cancel/retry work.
- **Phase C** — Project survives full reload; autosave indicator green.
- **Phase D** — Two users can't see each other's projects/outputs.
- **Phase E** — Lighthouse perf ≥ 85, no unhandled promise rejections in 24 h soak, no duplicate task on double-click.

---

## Out of scope (kept for transparency)

These were requested at various points but are **not** part of the
integration plan because they require backend changes MPT does not provide:

- Real-time collaborative editing on a project.
- Server-side render farm / horizontal scaling beyond MPT's single worker.
- Built-in payments — handled instead via Lovable Cloud / Stripe in Phase D.
- Mobile app shell — current React app is responsive but not packaged.
