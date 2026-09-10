# Changelog

All notable changes to **Abid VideoForge AI** (frontend). Format loosely
follows Keep a Changelog. Dates are sequential build dates inside the
Lovable session, not calendar dates.

---

## [0.9.0] — Phase 8.5 · Final frontend consolidation

### Added
- `/help` rebuilt as a documentation-only hub: global search, quick-topic
  chips, four Quick Start cards, keyboard-shortcuts modal, FAQ accordion.
- "Continue as Local Studio" link on `/login` → navigates to `/` (no fake
  session).
- Query-param tab support: `/account?tab=…` (8 validated tabs),
  `/audio-studio?tab=voices|music` (section scroll),
  `/subtitle-studio?tab=templates|effects`.

### Changed
- Command Palette entries point at consolidated destinations.

### Redirects (307, `beforeLoad` + `redirect()`)
- `/profile → /account?tab=profile`, `/billing → /account?tab=billing`,
  `/subscription → /account?tab=subscription`, `/usage → /account?tab=api-usage`,
  `/security → /account?tab=security`.
- `/voices → /audio-studio?tab=voices`, `/music → /audio-studio?tab=music`,
  `/templates → /subtitle-studio?tab=templates`,
  `/effects → /subtitle-studio?tab=effects`.

### Verified
- `tsgo --noEmit` clean; HTTP smoke: active pages 200, legacy routes 307.

---

## [0.8.3] — Settings removal & API Manager removal

### Removed
- `/settings` route, sidebar item, and page component. Contents
  redistributed: rendering/GPU/storage/performance → `/render-settings`;
  general → `/account?tab=general`; notifications → Account Notifications
  tab; updates → `/about`; developer → top-level `/developer`.
- `/api-manager` route, sidebar item, and page component. All provider
  configuration (LLM incl. Claude/Gemini/Ollama, stock video, TTS, future
  providers + summary cards) consolidated into `/basic-settings` — the
  single source of truth for provider config.
- Unused imports, dead nav links, and command-palette entries for both.

### Added
- `/render-settings` top-level sidebar item (Sparkles icon).
- Account as a first-class main-sidebar item.

---

## [0.8.0] — Phase 8 · Engineering documentation suite

### Added
- `docs/FRONTEND_ARCHITECTURE.md`, `ROUTES.md`, `COMPONENT_TREE.md`,
  `UI_COMPONENTS.md`, `DESIGN_SYSTEM.md`, `UI_STYLE_GUIDE.md`.
- `docs/BACKEND_ARCHITECTURE.md`, `BACKEND_FILE_MAP.md`, `API_MAPPING.md`,
  `STATE_MANAGEMENT.md`, `PIPELINE.md`, `WORKFLOW.md`, `INTEGRATION_PLAN.md`.
- `docs/PROJECT_ROADMAP.md`, `CHANGELOG.md`, `README_PROJECT.md`,
  `BRAIN.md`, `FINAL_AUDIT.md`.

### Changed
- Relocated `FRONTEND_ARCHITECTURE.md` from project root to `/docs`.

---

## [0.7.6] — Phase 7.6 · Responsive overhaul

### Added
- Non-intrusive `.app-content` responsive layer in `src/styles.css`.
- Off-canvas mobile sidebar drawer with hamburger trigger in TopBar.
- Fluid typography via `clamp()`; auto-scrolling tables.

### Changed
- `PageHeader` stacks vertically on mobile; `Footer` wraps gracefully.
- `Card` adopts responsive padding (`p-4` mobile → `p-6` desktop).
- Sticky rails un-pin below `lg` to avoid overlap.

### Verified
- Zero horizontal overflow at 390 px and 768 px across all 34 routes.

---

## [0.7.5] — Phase 7.5 · Final UI polish

### Added
- `src/components/command-palette.tsx` — ⌘/Ctrl + K palette with fuzzy
  search across Projects, Outputs, Voices, Templates, Settings, Providers.
- `HelpTip` tooltip primitive and `Skeleton` shimmer in
  `src/components/shared/index.tsx`.
- "Live" system status tooltip in TopBar.

### Changed
- TopBar search input replaced by Cmd-K trigger button.

---

## [0.7.0] — Phase 7 · Render engine, Queue, Outputs

### Added
- `src/lib/render-pipeline.ts` — 15-stage pipeline mapping to MPT
  `task.py` (with stage IDs, icons, backend hooks, seed data).
- `/render` Render Studio with live pipeline tracker.
- `/queue` Render Queue with bulk actions and per-row progress.
- `/outputs` rich gallery with metadata drawer.
- `src/components/render/video-player.tsx` — Pro player (scrubbing,
  speed 0.25–2×, PiP).

### Changed
- Dashboard `RenderPipeline` widget hooked into shared pipeline data.

---

## [0.6.8] — Phase 6.8 · Foundation consolidation

### Added
- `src/types/index.ts` — single source of truth for 28 domain types.
- `src/store/app-state.tsx` — React Context + `useReducer` store with 19
  action types covering project, script, video/audio/subtitle settings,
  notifications, render queue, save lifecycle.
- Shared UX primitives: `StatusBadge`, `EmptyState`, `LoadingPanel`,
  `SaveIndicator`.
- Global Sonner `<Toaster>` mounted in root.
- `StudioRedirectBanner` on duplicate library pages; `ComingSoonPage`
  stub for administrative pages.

### Removed
- Inline duplicated type definitions across studios.

---

## [0.6.0] — Phase 6A/6B · Subtitle Studio

### Added
- `/subtitle-studio` with 35-font browser, 100+ caption templates,
  Animation Studio (IN/OUT/LOOP), Karaoke modes (word/line/sentence),
  Brand Kit panel, AI Style Recommendation card.
- `src/components/subtitle-templates.tsx` (562 lines) — programmatic
  template gallery with search and category filters.

---

## [0.5.0] — Phase 5 · Audio Studio

### Added
- `/audio-studio` with searchable voice library across 9 TTS providers,
  animated preview player, volume/speed sliders, drag-and-drop custom
  audio upload with waveforms.
- Background music modes: none / preset / custom with loop/fade/trim.

---

## [0.4.0] — Phase 4 · Video Settings

### Added
- `/video-settings` with source provider grid (Pexels/Pixabay/Coverr/
  Local/Stock), Sequential/Random assembly, transition gallery with
  preview thumbnails.
- Encoder selector with NVENC/CPU detection badges.
- Smart Video Matching visual workflow (semantic ranking preview).
- Render Plan summary sidebar (clip count, estimated size).

---

## [0.3.0] — Phase 3 · Script Studio

### Added
- `/create` rebuilt as Script Studio: 5-step animated generation
  pipeline, advanced settings (paragraphs slider, tone presets, custom
  system prompt), 8 real-time analytics tiles, 10 AI action buttons,
  draggable Keywords Manager with Pexels preview, sticky 9:16 Live
  Preview rail + AI Assistant.

---

## [0.2.0] — Phase 2 · Basic Settings & API Configuration

### Added
- `/basic-settings` with AI Configuration provider grid (16 LLM
  providers), masked API keys, model browser with search/pinning.
- Video Source APIs cards (Pexels, Pixabay) with status toggles.
- Connection panel with health/latency/quota, "Test Connection" states.
- Import/Export/Backup/Restore + Reset All.

---

## [0.1.0] — Phase 1 · Application shell + Dashboard

### Added
- `src/components/app-shell.tsx` — Sidebar, TopBar, Footer, PageHeader,
  Card primitives.
- `src/components/auth-shell.tsx` — dedicated auth layout.
- Dashboard at `/` with stat cards, live render pipeline widget, timer
  widget, recent outputs and projects galleries, Quick Actions.
- Premium design system: green gradient (`#164E32` → `#227850`), F7F7F7
  background, OKLCH semantic tokens, Plus Jakarta Sans + Inter
  typography, fluid 1760 px desktop layout.
- 30+ stub routes for Create, Subtitle Studio, Voices, Music, Effects,
  Templates, Assets, Outputs, Projects, API Manager, Languages, Logs,
  Settings, Developer, About, plus auth/account screens.

### Tech baseline
- React 19, TanStack Start v1, Vite 7, Tailwind v4 with CSS-first theme,
  Radix UI primitives, Lucide icons.
