# VideoForge AI — Studio-Grade AI Video Studio

VideoForge AI is a high-performance, cinematic AI video generation studio built with **React 19**, **TanStack Start**, **Tailwind CSS**, and **Vite**. It provides a sleek, modern, multi-studio workflow backed directly by **MoneyPrinterTurbo (MPT)** as its authoritative Single Source of Truth (SSOT).

---

## Key Features

- **Script Studio (`/create`)**: AI script generation and keyword extraction via `/api/v1/scripts` and `/api/v1/terms`.
- **Render Studio (`/render`)**: Full video synthesis with real-time task polling, subtitle styling, and live MP4 streaming.
- **Audio Studio (`/audio-studio`)**: Real BGM track explorer, custom BGM uploading (`/api/v1/musics`), and standalone voice synthesis (`/api/v1/audio`).
- **Subtitle Studio (`/subtitle-studio`)**: Font mapping, SRT preview, and standalone subtitle generation (`/api/v1/subtitle`).
- **Assets Studio (`/assets`)**: Local video materials explorer and uploader (`/api/v1/video_materials`).
- **Output Library (`/outputs`)**: Completed renders with seeking video player, download links, and metadata drawer.
- **Batch Render Queue (`/queue`)**: Serial job scheduler enforcing concurrency limits to prevent MoviePy Windows tempfile collisions.
- **Developer Telemetry (`/developer`)**: Live backend ping, latency diagnostics, and endpoint verification.

---

## Architecture & Single Source of Truth

VideoForge React frontend is strictly an integration and client presentation layer. It does not rewrite or fork MPT business logic.

```
VideoForge React Frontend (Port 5173 / Nitro)
       │
       ▼ (HTTP REST API with x-api-key)
MoneyPrinterTurbo Backend (FastAPI / Port 8080)
       ├── Edge / Azure TTS Engine
       ├── MoviePy & FFmpeg Video Compositor
       ├── BGM Multiplexing & Auto-Looping
       └── Range-Header Video Streaming
```

---

## Quick Start

### 1. Launch Backend (MoneyPrinterTurbo)
```powershell
cd C:\Users\Ali\Desktop\MoneyPrinterTurbo-upstream
$env:CORS_ALLOWED_ORIGINS="*"
C:\Users\Ali\Desktop\MoneyPrinterTurbo-main\.venv\Scripts\python.exe main.py
```
Backend runs on `http://127.0.0.1:8080`.

### 2. Launch Frontend (VideoForge AI)
```powershell
cd C:\Users\Ali\Desktop\VF
npm install
npm run dev -- --port 5173
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```powershell
npm run build
```
Creates a standalone, prebuilt production output in `.output/`.

---

## Comprehensive Documentation

All project documentation is consolidated into two master documents in the `docs/` folder:

- **[Master Markdown Documentation](docs/VIDEOFORGE_DOCUMENTATION.md)** — Complete 88 KB reference covering architecture, all 33 routes, 164 interactive controls, API contracts, queue concurrency, and verified test results.
- **[Interactive HTML Documentation](docs/VIDEOFORGE_DOCUMENTATION.html)** — Standalone responsive HTML documentation page with dark-mode styling, navigation, and badges.

---

## Final Project Status

**VIDEOFORGE AI — FINAL PROJECT COMPLETE**
- Zero TypeScript errors (`npx tsc --noEmit` PASS).
- Zero build errors (`npm run build` PASS).
- 100% independent branding (Zero Lovable watermarks or dependencies).
- MPT upstream working tree remains clean.
