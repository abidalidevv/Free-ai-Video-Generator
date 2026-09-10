# Project Roadmap — Abid VideoForge AI

> Living document. Updated as phases close. Pairs with `CHANGELOG.md`
> (history) and `INTEGRATION_PLAN.md` (backend wiring detail).

---

## 1. Completed phases

| Phase | Theme | Status |
|---|---|---|
| **1** | Application shell, navigation, Dashboard (design system) | ✅ Done |
| **2** | Basic Settings + API Configuration panel | ✅ Done |
| **3** | Create Video → Script Studio | ✅ Done |
| **4** | Create Video → Video Settings | ✅ Done |
| **5** | Create Video → Audio Studio | ✅ Done |
| **6A** | Subtitle Studio + Caption Templates | ✅ Done |
| **6B** | Animation Studio + Karaoke + Brand Kit | ✅ Done |
| **6.8** | Foundation consolidation (types, store, UX feedback) | ✅ Done |
| **7** | Output Studio, Render Engine, Queue, Pro Video Player | ✅ Done |
| **7.5** | Final UI polish — Cmd-K, tooltips, skeletons | ✅ Done |
| **7.6** | Responsive overhaul (4K → mobile) | ✅ Done |
| **8** | Engineering documentation suite (`/docs`) | ✅ Done |

---

## 2. Current status

- **Frontend UI**: ~95 % complete — all 34 routes implemented; design
  system, responsive layer, command palette, save indicators, skeletons
  shipped.
- **State management**: ~90 % — single React Context store covers every
  slice the backend will need.
- **Backend connection**: 0 % — no live calls yet (seed data only).
- **Documentation**: ~95 % — Architecture, Routes, Components, Design
  System, Style Guide, Backend Architecture, File Map, API Mapping,
  State, Pipeline, Workflow, Integration Plan all in `/docs`.

---

## 3. Remaining milestones

### 3.1 Backend integration (highest priority)

Detailed plan: `INTEGRATION_PLAN.md`.

| Milestone | Effort | Blockers |
|---|---|---|
| Foundation (env, client, proxy, types parity) | 2.5 d | none |
| Read-only hydration (config, system, voices, tasks, outputs) | 6.5 d | MPT running locally |
| Mutations + WS live render | 10.5 d | WS protocol spike |
| Persistence (projects, autosave, import/export) | 9.5 d | MPT projects controller wrapper |
| Hardening (idempotency, rate-limit, error normalizer) | 7.5 d | — |

### 3.2 Testing

| Tier | Tooling | Coverage target |
|---|---|---|
| Unit | Vitest + React Testing Library | reducer, helpers, formatters: 100 % |
| Component | Vitest + RTL | shared primitives, command palette, pipeline: 80 % |
| Integration | Vitest with MSW | every store action that triggers an API call |
| E2E | Playwright | 5 critical flows (create → render → output, cancel, retry, settings save, project save/load) |
| Visual regression | Playwright screenshots / Chromatic | Dashboard, all studios @ 1920/1440/768/390 |
| Accessibility | `@axe-core/playwright` on every E2E page | 0 serious violations |

### 3.3 Production launch checklist

- [ ] Phase 0+A+B+E "light" integration shipped
- [ ] Error reporting wired (Sentry / Lovable)
- [ ] Performance budget (LCP < 2 s, JS < 300 kB initial)
- [ ] Lighthouse ≥ 90 perf / 100 a11y
- [ ] CSP + security headers
- [ ] Privacy + terms pages
- [ ] CI: typecheck + tests + build per PR
- [ ] Staging environment with seed MPT instance

### 3.4 Desktop packaging

Target: Tauri 2 (Rust shell) — smaller bundle than Electron, native
performance, and MPT can co-launch as a sidecar Python process.

| Item | Effort | Notes |
|---|---|---|
| Tauri shell scaffold | 2 d | `bun add -D @tauri-apps/cli` |
| Python sidecar runner | 3 d | spawn uvicorn, lifecycle mgmt, log piping |
| Auto-update channel | 2 d | tauri-updater + signed releases |
| Native menus, tray, OS notifications | 2 d | replace web toast for OS-level |
| Code signing (mac, win) | 2 d | certs + notarization |
| DMG / MSI / AppImage installers | 1 d | GH Actions matrix |

**Total desktop: ~12 d.**

### 3.5 Cloud version

Optional SaaS surface. Pre-req: Phase D (auth).

| Item | Effort | Notes |
|---|---|---|
| Lovable Cloud (Supabase) enablement | 0.5 d | managed |
| Per-user storage isolation | 2 d | `storage/users/{uid}/…` |
| Billing (Stripe via Lovable) | 3 d | quota + plan gates |
| MPT containerization | 3 d | one container per user or shared queue |
| Object storage for outputs (S3/R2) | 2 d | replace local FS |
| CDN for static + outputs | 1 d | — |

**Total cloud: ~12 d** on top of Phase D.

### 3.6 Future roadmap

| Idea | Horizon | Notes |
|---|---|---|
| Real-time collaborative editing | Q3 | needs CRDT (Yjs) on script + settings |
| Mobile companion app (React Native) | Q4 | read-only render monitor first |
| Plugin SDK (custom transitions, LLM providers) | Q4 | sandboxed JS or Python plugins |
| Asset marketplace (templates, brand kits) | Q4 | revenue share |
| AI auto-edit suggestions (B-roll picks, pacing) | Q4 | new MPT service |
| Multi-language subtitle burn-in | Q3 | already in `subtitle.py`; needs UI tweak |
| Team workspaces | Q4 | requires auth + RBAC |
| Audit log + version history per project | Q3 | append-only log table |

---

## 4. Out of scope

- React Native rewrite (the web app is responsive and Tauri-wrapped).
- Self-hosted Whisper retraining.
- Custom FFmpeg fork.
- Native mobile renders (MPT requires desktop FFmpeg / GPU).

---

## 5. KPIs after launch

- Time-to-first-render (TTFR) ≤ 3 minutes from cold install.
- Median render success rate ≥ 95 % on default settings.
- Cmd-K usage ≥ 30 % of weekly active users (proxy for power-user adoption).
- Crash-free sessions ≥ 99.5 %.
