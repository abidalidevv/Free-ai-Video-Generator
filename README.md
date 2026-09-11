<div align="center">

<img src="https://img.shields.io/badge/VideoForge_AI-Studio_Grade_Video_Generator-6C63FF?style=for-the-badge&logo=videolan&logoColor=white" alt="VideoForge AI"/>

# VideoForge AI

**Studio-Grade AI Video Generator — Powered by MoneyPrinterTurbo**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TanStack](https://img.shields.io/badge/TanStack_Start-latest-FF4154?style=flat-square)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-22C55E?style=flat-square&logo=checkmarx)]()

</div>

---

## What is VideoForge AI?

VideoForge AI is a **cinematic AI video generation studio** that turns a single topic into a fully edited, narrated, and subtitled short-form video — automatically.

It is a **pure frontend integration layer** over [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) (MPT), which is the authoritative backend engine. VideoForge adds a premium multi-studio React UI on top without forking or replacing any MPT business logic.

---

## Studios & Routes

| Studio | Route | What it does |
|---|---|---|
| Script Studio | `/create` | AI script generation + keyword extraction via Groq LLM |
| Render Studio | `/render` | Full video synthesis with real-time progress polling |
| Audio Studio | `/audio-studio` | BGM explorer, custom BGM upload, standalone TTS |
| Subtitle Studio | `/subtitle-studio` | Font mapping, SRT preview, subtitle generation |
| Assets Studio | `/assets` | Local video materials explorer and uploader |
| Output Library | `/outputs` | Completed renders with video player, download and metadata |
| Render Settings | `/render-settings` | Codec, resolution, FPS, and clip duration controls |
| Batch Queue | `/queue` | Serial job scheduler (MAX_CONCURRENCY=1 for Windows) |
| Telemetry | `/developer` | Live backend ping, latency, endpoint health |

---

## Architecture

```
VideoForge AI (React 19 + TanStack Start)   <- Port 5173
        |
        v  HTTP REST  (x-api-key header)
MoneyPrinterTurbo Backend (FastAPI)         <- Port 8080
        |-- Groq LLM  (allam-2-7b)
        |-- Edge / Azure TTS Engine
        |-- MoviePy + FFmpeg Compositor
        |-- BGM Auto-Looping and Multiplexing
        `-- Range-Header MP4 Streaming
```

> **Rule**: VideoForge never forks or duplicates MPT business logic.
> MPT is the **Single Source of Truth (SSOT)** for all video generation.

---

## Quick Start

### 1. Start the Backend (MoneyPrinterTurbo)

```powershell
cd C:\Users\Ali\Desktop\MoneyPrinterTurbo-upstream
$env:CORS_ALLOWED_ORIGINS = "*"
.\.venv\Scripts\python.exe main.py
```

Backend API available at `http://127.0.0.1:8080`

### 2. Start the Frontend (VideoForge AI)

```powershell
cd C:\Users\Ali\Desktop\VF
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Configure API Key

Create a `.env` file in the root (copy from `.env.example`):

```env
VITE_MPT_API_BASE=http://127.0.0.1:8080
VITE_MPT_API_KEY=your_mpt_api_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### 4. Production Build

```powershell
npm run build
```

Output is in `.output/` ready to deploy on any Node.js host.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start (SSR) |
| Build Tool | Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + Custom Design Tokens |
| State | TanStack Query + Zustand |
| LLM | Groq API (allam-2-7b) |
| Backend | MoneyPrinterTurbo (FastAPI + MoviePy) |

---

## Documentation

All documentation is in the `docs/` folder:

- **[Master Docs (Markdown)](docs/VIDEOFORGE_DOCUMENTATION.md)** — Complete architecture, API contracts, route audit, and test results
- **[Interactive Docs (HTML)](docs/VIDEOFORGE_DOCUMENTATION.html)** — Dark-mode HTML documentation with navigation

---

## Project Status

| Check | Status |
|---|---|
| TypeScript (`tsc --noEmit`) | Zero errors |
| Production Build (`npm run build`) | Passing |
| Lovable Branding | Fully removed |
| MPT Integration | Live and verified |
| Groq LLM | Active (allam-2-7b) |

---

<div align="center">

Built with care — VideoForge AI 2025

</div>
