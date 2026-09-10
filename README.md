# Abid VideoForge AI

Premium desktop interface for **MoneyPrinterTurbo** — a Python pipeline
that produces short-form videos from a topic prompt. VideoForge AI
replaces the legacy Streamlit UI with a commercial-grade React desktop
experience while keeping the existing Python services as the source of
truth.

> **Status**: Frontend UI complete (≈97 %). Integration-ready foundation
> in place (typed API client, services, TanStack Query hooks, WebSocket
> manager, upload manager). Backend wiring planned — see
> [`docs/INTEGRATION_PLAN.md`](docs/INTEGRATION_PLAN.md) and
> [`docs/BACKEND_BINDING_PLAN.md`](docs/BACKEND_BINDING_PLAN.md).

---

## Overview

VideoForge AI is the production cockpit for an AI video generator. The
user enters a subject, the app drafts a script, picks keywords, fetches
matching stock footage, synthesizes voice, builds subtitles, and renders
the final MP4 — all visible as a live 15-stage pipeline.

- Designed for 4K → mobile (responsive `.app-content` layer).
- File-based routing: 22 active pages + 10 legacy redirects
  (account/library consolidation, Phase 8.5).
- One global store, one design system, one component vocabulary.
- Pluggable backend: REST + WebSocket against MoneyPrinterTurbo.

---

## Features

- **Dashboard** with live render pipeline, recent projects/outputs,
  system health.
- **Script Studio** — LLM script + keyword generation, 8 analytics
  tiles, draggable keyword manager, sticky 9:16 preview.
- **Video Settings** — source providers, transitions, aspect, encoder
  (NVENC/CPU), Smart Matching preview.
- **Audio Studio** — 9 TTS providers, voice browser with waveform
  preview, BGM library + custom upload.
- **Subtitle Studio** — 35 fonts, 100+ caption templates, IN/OUT/LOOP
  animations, karaoke (word/line/sentence), brand kits.
- **Render Studio** — live 15-stage pipeline with per-stage progress,
  scene/clip/file payload, cancel/retry.
- **Queue** — bulk task management.
- **Outputs** — rich gallery, Pro Video Player (scrubbing, 0.25–2× speed, PiP).
- **Basic Settings** — single provider hub: LLM (OpenAI, DeepSeek,
  Claude, Gemini, Ollama), stock video (Pexels/Pixabay/Coverr + 30-provider
  manager), TTS (Edge/Azure/ElevenLabs/OpenAI), summary cards.
- **Render Settings** — encoder (NVENC/CPU), quality, bitrate, GPU,
  storage paths, performance.
- **Account** — tabbed profile, billing, subscription, API usage,
  security, general settings, notification preferences (`?tab=` deep
  links; legacy account routes redirect here).
- **Help** — documentation hub with search, quick-start cards,
  keyboard-shortcuts modal, FAQ.
- **Command Palette** — ⌘/Ctrl + K fuzzy search across projects,
  outputs, voices, templates, settings.
- **Notifications**, **Logs**, **Developer Mode**, **About** (with update
  information).

---

## Screenshots

> Placeholders — drop PNGs in `docs/screenshots/` and update paths.

| Surface | Image |
|---|---|
| Dashboard | `![Dashboard](docs/screenshots/dashboard.png)` |
| Script Studio | `![Create](docs/screenshots/create.png)` |
| Video Settings | `![Video Settings](docs/screenshots/video-settings.png)` |
| Audio Studio | `![Audio Studio](docs/screenshots/audio-studio.png)` |
| Subtitle Studio | `![Subtitle Studio](docs/screenshots/subtitle-studio.png)` |
| Render Studio | `![Render Studio](docs/screenshots/render.png)` |
| Outputs | `![Outputs](docs/screenshots/outputs.png)` |
| Command Palette | `![Cmd-K](docs/screenshots/cmdk.png)` |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Browser / Tauri shell                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ React 19 + TanStack Start                             │  │
│  │  ├── src/routes/        (34 file-based routes)        │  │
│  │  ├── src/components/    (app-shell, render, shared)   │  │
│  │  ├── src/store/         (Context + useReducer)        │  │
│  │  ├── src/lib/           (pipeline, constants, utils)  │  │
│  │  └── src/types/         (domain contract)             │  │
│  └────────────┬──────────────────────────────┬───────────┘  │
└───────────────│──────────────────────────────│──────────────┘
                │ REST /api/v1/*               │ WS /ws/tasks/*
                ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│ MoneyPrinterTurbo (FastAPI, uvicorn)                        │
│  app/controllers/v1/  llm · video · voice · material · ...  │
│  app/services/        task · llm · voice · material · ...   │
│  storage/             tasks/ · local/                       │
│  config.toml                                                │
└─────────────────────────────────────────────────────────────┘
```

Full breakdown in [`docs/BACKEND_ARCHITECTURE.md`](docs/BACKEND_ARCHITECTURE.md).

---

## Tech Stack

- **Framework**: React 19, TanStack Start v1 (SSR-capable)
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` tokens, OKLCH palette)
- **Typography**: Plus Jakarta Sans (display), Inter (body)
- **Icons**: Lucide
- **Primitives**: Radix UI (46 shadcn-style components in `src/components/ui/`)
- **State**: React Context + `useReducer` (Zustand-ready)
- **Routing**: TanStack Router (file-based, type-safe)
- **Forms / validation**: lightweight inline + Zod-ready
- **Toasts**: Sonner
- **Data fetching (planned)**: TanStack Query
- **Backend**: MoneyPrinterTurbo (Python · FastAPI · uvicorn)

---

## Folder Structure

```text
.
├── docs/                       ← all engineering documentation
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── ROUTES.md
│   ├── COMPONENT_TREE.md
│   ├── UI_COMPONENTS.md
│   ├── DESIGN_SYSTEM.md
│   ├── UI_STYLE_GUIDE.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── BACKEND_FILE_MAP.md
│   ├── API_MAPPING.md
│   ├── STATE_MANAGEMENT.md
│   ├── PIPELINE.md
│   ├── WORKFLOW.md
│   ├── INTEGRATION_PLAN.md
│   ├── PROJECT_ROADMAP.md
│   ├── CHANGELOG.md
│   ├── README_PROJECT.md
│   ├── BRAIN.md
│   └── FINAL_AUDIT.md
├── src/
│   ├── routes/                 ← 34 TanStack Start routes
│   ├── components/
│   │   ├── app-shell.tsx       ← Sidebar, TopBar, primitives
│   │   ├── auth-shell.tsx
│   │   ├── command-palette.tsx
│   │   ├── subtitle-templates.tsx
│   │   ├── render/             ← pipeline + video-player
│   │   ├── shared/             ← StatusBadge, EmptyState, Skeleton, HelpTip
│   │   └── ui/                 ← Radix/shadcn primitives (46)
│   ├── lib/
│   │   ├── render-pipeline.ts  ← 15 stages, seed data
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── store/app-state.tsx     ← global reducer
│   ├── types/index.ts          ← domain contract
│   ├── styles.css              ← Tailwind v4 theme + responsive layer
│   ├── router.tsx
│   └── routeTree.gen.ts        ← auto-generated, do not edit
├── public/
└── package.json
```

---

## Installation

Prerequisites:
- **Node.js ≥ 20** (or **Bun ≥ 1.1** — preferred)
- **Python ≥ 3.10** + MoneyPrinterTurbo cloned in a sibling folder
- FFmpeg on `$PATH` (required by MPT)

```bash
git clone <this-repo> videoforge-ui
cd videoforge-ui
bun install
cp .env.example .env       # set VITE_API_BASE_URL and VITE_WS_BASE_URL
```

Start MoneyPrinterTurbo separately:

```bash
cd ../MoneyPrinterTurbo
python -m uvicorn app.asgi:app --host 127.0.0.1 --port 8080
```

---

## Development

```bash
bun dev                    # Vite at http://localhost:5173 (proxies /api → MPT)
bun typecheck              # tsgo
bun test                   # vitest (when tests land in Phase E)
```

Vite dev proxy is configured in `vite.config.ts` to forward `/api/*`,
`/ws/*` and `/tasks/*` to MPT.

---

## Build

```bash
bun build                  # SSR-capable static + worker bundle
bun preview                # serve the production build locally
```

Desktop packaging (planned, Phase 9):

```bash
bun tauri dev              # native window with MPT sidecar
bun tauri build            # DMG / MSI / AppImage
```

---

## Roadmap

See [`docs/PROJECT_ROADMAP.md`](docs/PROJECT_ROADMAP.md) and
[`docs/INTEGRATION_PLAN.md`](docs/INTEGRATION_PLAN.md).

Highlights:
- ✅ UI design system + all 34 routes + responsive layer
- ⏳ Backend integration (REST + WebSocket)
- ⏳ Test suite (Vitest + Playwright + axe)
- ⏳ Tauri desktop packaging
- ⏳ Cloud SaaS (Lovable Cloud + Stripe)

---

## License

To be confirmed by the project owner (MIT recommended for the UI;
MoneyPrinterTurbo retains its own license).
