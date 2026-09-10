# BRAIN — Long-term Project Knowledge

> The permanent knowledge base for **Abid VideoForge AI**. New contributors
> read this first. Updated only when a foundational decision changes.

---

## 1. Vision

Build a **commercial-grade desktop application** for AI short-form video
generation that users would happily pay for. Replace the existing
Streamlit UI of MoneyPrinterTurbo (MPT) with a premium React experience
without changing the Python pipeline. The product feels like a piece of
prosumer creative software (Descript, CapCut Pro, Final Cut), not a web
demo.

**North-star metric**: minutes from "I have an idea" to "I have a
finished MP4 to post" — target ≤ 3 minutes on default settings.

---

## 2. Architecture (one-paragraph mental model)

A **thin React 19 client** owns the entire UI, layout, and ephemeral
state. **MoneyPrinterTurbo (FastAPI + 15-stage `task.py` pipeline)** owns
all business logic, model calls, FFmpeg, and persistence. They speak
over **REST + WebSocket**. The frontend never re-implements MPT logic;
it visualizes and parameterizes it.

Files of record:
- Client domain: `src/types/index.ts`
- Client state: `src/store/app-state.tsx`
- Pipeline map: `src/lib/render-pipeline.ts`
- Backend contract: `docs/API_MAPPING.md`

---

## 3. Workflow (user journey, condensed)

```
Subject → Script → Keywords → Video/Audio/Subtitle settings → Render → Output
```

Each arrow is documented in `docs/PIPELINE.md` and
`docs/WORKFLOW.md`. The render arrow is the only async one — driven by
WebSocket events from MPT.

---

## 4. Important decisions

| # | Decision | Why |
|---|---|---|
| D1 | **TanStack Start over Next.js / Vite-only** | Type-safe file routing + SSR-capable + lightweight; matches Lovable template. |
| D2 | **Tailwind v4 CSS-first theme** (no `tailwind.config.js`) | One file (`src/styles.css`) owns all tokens; OKLCH ensures perceptual consistency. |
| D3 | **React Context + `useReducer`** (not Zustand yet) | Small surface, easy to swap; no library lock-in until data layer lands. |
| D4 | **TanStack Query for server state** (planned, not adopted) | Cache + SWR + invalidation come free; reducer keeps client state. |
| D5 | **No backend changes to MPT** | Source of truth stays Python; thin FastAPI wrappers only where missing (`projects.py`, `outputs.py`, `system.py`, `ws.py`, `providers.py`). |
| D6 | **WebSocket for render progress**, REST for everything else | Long-running 15-stage pipeline needs push, not poll. |
| D7 | **Single-file shell** (`app-shell.tsx`, ~570 LOC) | All cross-cutting layout primitives in one place to enforce design uniformity. Split only when a new contributor needs to share it. |
| D8 | **Responsive layer scoped to `.app-content`** | Lets desktop design stay pixel-perfect while a single CSS layer reflows for tablet/mobile. |
| D9 | **15-stage pipeline mirrored 1:1 in `render-pipeline.ts`** | UI is a pure visualization of backend state; renames in MPT need a one-line change here. |
| D10 | **OKLCH color tokens** | Future-proof against P3 displays; theming is mechanical. |
| D11 | **Plus Jakarta Sans + Inter** | Distinctive vs default Inter-only AI aesthetic; "JakartaSans" carries brand. |
| D12 | **Cmd-K command palette** | Power-user shortcut that doubles as global navigation; reduces sidebar visual noise. |
| D13 | **Sonner toasts** over custom | Battle-tested, accessible, tiny. |
| D14 | **Radix UI primitives in `components/ui/`** | Available when needed; not pre-imported to avoid bundling everything. |
| D15 | **Auth deferred to Phase D** | MPT is single-user/desktop; auth complicates Phase 0–C. |

---

## 5. Naming conventions

| Layer | Convention | Example |
|---|---|---|
| Routes | `kebab-case.tsx` (TanStack file routing) | `audio-studio.tsx` |
| Components | `PascalCase.tsx`, one default export | `RenderPipeline` |
| Hooks | `useCamelCase` | `useAppState` |
| Utilities | `camelCase` | `formatBytes` |
| Types | `PascalCase`, no `I` prefix | `RenderTask` |
| Action types | `SCREAMING_SNAKE` | `PATCH_VIDEO` |
| CSS tokens | `--kebab-case` semantic | `--brand-green-500` |
| Test files | `*.test.ts(x)` next to source | `pipeline.test.ts` |
| Mocks / seed | `SEED_*` constants in `src/lib/` | `SEED_RENDER_QUEUE` |
| IDs | string, prefixed by entity | `p_001`, `rt_001`, `o_001` |

---

## 6. Folder purposes

- `src/routes/` — only file-based pages. No business logic; thin
  components that call the store and read TanStack Query (planned).
- `src/components/app-shell.tsx` — layout + design primitives used by
  every page (`Sidebar`, `TopBar`, `Card`, `Field`, `Button`, etc.).
- `src/components/render/` — pipeline visualizer + video player; shared
  by Render Studio, Outputs, Dashboard.
- `src/components/shared/` — atoms (`StatusBadge`, `EmptyState`,
  `LoadingPanel`, `SaveIndicator`, `HelpTip`, `Skeleton`).
- `src/components/ui/` — Radix/shadcn primitives. Adopt only when a
  custom themed equivalent is missing.
- `src/lib/` — pure helpers, constants, pipeline map. No React.
- `src/store/` — global state. Pure reducer.
- `src/types/` — domain contract; **mirror of MPT Pydantic schemas**.
- `src/styles.css` — Tailwind v4 `@theme`, base typography, responsive
  `.app-content` layer.
- `docs/` — every engineering document. Single root.

---

## 7. Design principles

1. **One design language.** Sidebar, TopBar, Card and Button shapes are
   identical across all 34 routes.
2. **Information density without clutter.** Premium feel comes from
   typography hierarchy + generous spacing on the right surfaces (cards,
   headings), not from emptiness.
3. **Live > static.** Wherever a backend signal exists (render progress,
   provider latency, save state), surface it animated.
4. **Progressive disclosure.** Advanced controls collapse behind
   "Advanced" toggles; novice path always works with defaults.
5. **Tooltips for every non-obvious affordance** (`HelpTip`).
6. **Zero placeholder copy in shipped UI.** Every label is intentional;
   seed data exists only as `SEED_*` constants clearly marked.
7. **Responsive is a layer, not a redesign.** Desktop is canonical;
   smaller breakpoints reflow the same layout.
8. **Keyboard-first power.** Cmd-K, Cmd-S, Cmd-Enter, Esc, G-prefix nav.

---

## 8. Backend assumptions

- MPT exposes (or accepts a thin wrapper exposing): `GET/PUT /api/v1/config`,
  `POST /api/v1/scripts`, `POST /api/v1/terms`, `POST /api/v1/search-videos`,
  `GET /api/v1/voices`, `POST /api/v1/voice/preview`, `POST /api/v1/upload`,
  `POST /api/v1/tasks`, `GET /api/v1/tasks[/{id}]`,
  `POST /api/v1/tasks/{id}/{cancel|retry}`,
  `WS /ws/tasks/{id}` emitting `{ kind, taskId, stageId?, status, progress, ... }`,
  `GET /api/v1/outputs`, static `GET /tasks/{task_id}/{file}.mp4`.
- Stage IDs in WS events match `PipelineStageId` in
  `src/lib/render-pipeline.ts`.
- Single active render at a time (MPT default); queue is FIFO.
- File outputs live under `storage/tasks/{task_id}/`.
- `config.toml` is the single source of provider keys and defaults.

---

## 9. Frontend assumptions

- Modern evergreen browser; CSS `clamp()`, OKLCH, container queries
  available.
- Vite dev server proxies `/api`, `/ws`, `/tasks` to MPT.
- Bundle target: ES2022, no IE11 considerations.
- Cmd-K and other shortcuts assume a physical keyboard; mobile uses
  the bottom sheet navigation.
- All money/time formatting uses the browser locale; user preference
  overrides via `state.preferences.language`.

---

## 10. Future goals

- Tauri desktop wrapper with MPT as a sidecar.
- Lovable Cloud SaaS deployment with per-user isolation.
- Plugin SDK (transitions, LLM providers, subtitle styles).
- Real-time collaborative editing (CRDT) on script + settings.
- Asset marketplace.
- AI auto-edit suggestions (new MPT service).

---

## 11. Known limitations

- **No backend connection yet** — every page uses seed data
  (`SEED_RENDER_QUEUE`, `SEED_OUTPUTS`, `SEED_NOTIFICATIONS`).
- **No tests** — Vitest + Playwright planned in Phase E.
- **`create.tsx` (804 LOC), `video-settings.tsx` (711)**,
  `basic-settings.tsx` (627), `audio-studio.tsx` (600),
  `subtitle-templates.tsx` (562), `subtitle-studio.tsx` (571),
  `app-shell.tsx` (572) — large files acceptable today but should be
  split when business logic lands (extract `<*Section>` subcomponents).
- **No auth** — Phase D adds Lovable Cloud / Supabase if multi-user is
  required.
- **No real persistence** — preferences not yet written to
  `localStorage`; project save is local-only.
- **WebSocket reconnection** not implemented (Phase B).
- **Single language** in UI strings — i18n scaffolding present
  (`/languages`) but not wired to a translation table.

---

## 12. Developer notes

- **Never edit `src/routeTree.gen.ts`** — auto-generated by the TanStack
  plugin on every dev/build.
- **Prefer adding to `src/components/app-shell.tsx`** when a primitive
  is used in ≥ 2 routes; split the file only after it crosses ~800 LOC.
- **Always import types from `src/types`**, not inline.
- **Always import constants from `src/lib/constants.ts`** to keep
  defaults canonical.
- **Run `tsgo` after schema changes** — Pydantic ↔ TS drift surfaces as
  compile errors when consumers cast `data as RenderTask`.
- **Toast on every mutation success and failure** — keep the user
  informed; `Sonner` is mounted in the root.
- **Skeletons for every async surface** (`<Skeleton>`); never spin a
  spinner without a layout placeholder.
- **Tailwind classes only** — no inline styles unless setting a CSS
  variable; no hardcoded colors (`text-black`, `#fff`) — use tokens.
- **Accessibility**: every interactive control has a label or
  `aria-label`; focus rings are not removed; color is never the only
  status signal (icons + text + color together).
- **Do not introduce a router other than TanStack Router.** No
  `react-router-dom`, no `pages/` directory.
- **Server functions live under `src/lib/*.functions.ts`** (Phase B+);
  never `src/server/`.
- **Read `docs/INTEGRATION_PLAN.md` before adding an endpoint** — it
  may already be planned with a specific shape.

---

## 13. Glossary

| Term | Meaning |
|---|---|
| **MPT** | MoneyPrinterTurbo, the Python backend |
| **Studio** | A multi-section page that edits one slice of a project (Script, Video, Audio, Subtitle, Render) |
| **Stage** | One of the 15 entries in `PIPELINE_STAGES` |
| **Task** | A single render job (`RenderTask`), tied to a `task_id` |
| **Output** | A finalized MP4 (`Output`), produced by a completed task |
| **Brand Kit** | A reusable subtitle/typography preset bundle |
| **Render Plan** | UI summary of what will be sent to `POST /api/v1/tasks` |
| **Seed data** | `SEED_*` constants used only until backend is wired |
