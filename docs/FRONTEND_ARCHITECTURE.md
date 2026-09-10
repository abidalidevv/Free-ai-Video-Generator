# VideoForge AI — Frontend Architecture

> Lead Architect reference document. Reflects the **current** state of the
> codebase. No invented features; planned-only items are flagged.

---

## 1. Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **TanStack Start v1** (React 19, SSR-capable, Vite 7 build) |
| Routing | **TanStack Router** with file-based routes (`src/routes/`, auto-generated `src/routeTree.gen.ts`) |
| Data layer | **TanStack Query v5** (`QueryClient` in router context) — currently UI-only, no live queries yet |
| Styling | **Tailwind CSS v4** (native `@import "tailwindcss"`, `@theme inline`, `@utility` blocks in `src/styles.css`) |
| Animation utilities | `tw-animate-css` + Tailwind transitions |
| Component primitives | **Radix UI** (Dialog, Dropdown, Popover, Tooltip, Tabs, Slider, etc.) wrapped under `src/components/ui/*` (shadcn-style) |
| Icons | **lucide-react** |
| Toaster | **sonner** (`src/components/ui/sonner.tsx`) |
| Fonts | Plus Jakarta Sans (display), Inter (body), JetBrains Mono (mono — used selectively) — loaded via `<link>` in `src/routes/__root.tsx` |
| Lang | TypeScript (strict), React 19 function components only |
| Backend | **None implemented.** All data is local state / seed constants. Target backend is the existing Python **MoneyPrinterTurbo** service. |

Build / runtime entry: `src/server.ts`, `src/start.ts`, `src/router.tsx`, root layout `src/routes/__root.tsx`.

---

## 2. Folder Structure

```
src/
├─ routes/                  # File-based routes (32 pages: 22 active + 10 redirects)
│  ├─ __root.tsx            # HTML shell, fonts, providers (Api/WebSocket/AppState), Outlet
│  ├─ index.tsx             # Dashboard (/)
│  ├─ create.tsx            # Script Studio
│  ├─ video-settings.tsx
│  ├─ audio-studio.tsx      # TTS + voice library + BGM (?tab=voices|music scrolls to section)
│  ├─ subtitle-studio.tsx   # (?tab=templates|effects)
│  ├─ render.tsx            # Render Studio
│  ├─ queue.tsx             # Render Queue
│  ├─ outputs.tsx
│  ├─ projects.tsx
│  ├─ basic-settings.tsx    # Single provider hub: LLM + stock video + TTS + future APIs
│  ├─ render-settings.tsx   # Encoder/quality/bitrate + GPU, storage, performance
│  ├─ assets.tsx
│  ├─ languages.tsx
│  ├─ logs.tsx
│  ├─ developer.tsx
│  ├─ notifications.tsx
│  ├─ about.tsx             # Version + update information
│  ├─ account.tsx           # Tabbed: profile/account/subscription/billing/api-usage/
│  │                        #   security/general + notifications prefs (?tab=...)
│  ├─ help.tsx              # Documentation hub: search, quick-start, shortcuts, FAQ
│  ├─ login.tsx             # Auth shell + "Continue as Local Studio" → /
│  ├─ signup.tsx, forgot-password.tsx, reset-password.tsx   # Auth shells
│  └─ Redirects (TanStack `redirect()` in `beforeLoad`):
│      profile.tsx → /account?tab=profile
│      billing.tsx → /account?tab=billing
│      subscription.tsx → /account?tab=subscription
│      usage.tsx → /account?tab=api-usage
│      security.tsx → /account?tab=security
│      voices.tsx → /audio-studio?tab=voices
│      music.tsx → /audio-studio?tab=music
│      templates.tsx → /subtitle-studio?tab=templates
│      effects.tsx → /subtitle-studio?tab=effects (alias: animations)
│  └─ README.md
├─ components/
│  ├─ app-shell.tsx          # Sidebar + TopBar + Footer + primitives
│  ├─ auth-shell.tsx         # Centered auth layout
│  ├─ command-palette.tsx    # ⌘K palette
│  ├─ subtitle-templates.tsx # 100+ programmatic templates
│  ├─ render/
│  │  ├─ pipeline.tsx        # 15-stage visual pipeline
│  │  └─ video-player.tsx    # Pro scrub/seek player
│  ├─ shared/
│  │  └─ index.tsx           # StatusBadge, EmptyState, LoadingPanel,
│  │                          SaveIndicator, HelpTip, Skeleton,
│  │                          StudioRedirectBanner, ComingSoonPage
│  └─ ui/                    # 46 shadcn/Radix primitives
├─ store/
│  └─ app-state.tsx          # React Context + useReducer
├─ types/
│  └─ index.ts               # All domain models
├─ lib/
│  ├─ constants.ts           # Defaults for video/audio/subtitle settings
│  ├─ render-pipeline.ts     # 15-stage map + seed queue/outputs
│  ├─ utils.ts               # cn()
│  └─ error-capture.ts, error-page.ts, lovable-error-reporting.ts
├─ hooks/use-mobile.tsx
├─ styles.css                # Theme tokens, brand utilities, responsive layer
├─ router.tsx, server.ts, start.ts, routeTree.gen.ts
└─ ...
docs/                         # This documentation set
```

---

## 3. Application Architecture

- **Single-page TanStack-routed app** rendered through `__root.tsx`. The
  root component injects fonts, the `TooltipProvider`, sonner `Toaster`,
  the `AppStateProvider`, and renders `<Outlet />` for the active route.
- **Layout-by-composition, not layout routes.** Every page imports
  `AppShell` (or `AuthShell`) directly; there are no `_layout` files.
  `AppShell` renders sidebar + topbar + scroll container.
- **State** is held in a single `AppStateProvider` (Context + reducer).
  No server state, no persistence, no auth.
- **Render pipeline** is the only domain model with deep structure
  (`src/lib/render-pipeline.ts`, 15 stages mapped to MoneyPrinterTurbo
  task IDs). Seed data drives Queue, Outputs and Render Studio.

---

## 4. Routing Architecture

| Property | Value |
| --- | --- |
| Style | File-based, flat (no nesting / no `_layout` routes) |
| Generator | TanStack Router Vite plugin → `src/routeTree.gen.ts` |
| Root | `src/routes/__root.tsx` (`createRootRoute`) — providers + `<Outlet />` |
| Total routes | **34** (33 leaf pages + root) |
| Auth-gating | None (auth pages are visual stubs) |
| Loaders | None — all pages use local state / seed constants |
| Preload | `defaultPreloadStaleTime: 0` (set in `src/router.tsx`) |
| 404 | Default TanStack handler (no custom `notFoundComponent` yet) |

Complete route catalogue: see `docs/ROUTES.md`.

---

## 5. Page Hierarchy

```
Dashboard (/)
├─ Create Video (/create)              ─┐
├─ Video Settings (/video-settings)     │
├─ Audio Studio (/audio-studio)         │  Creation flow
├─ Subtitle Studio (/subtitle-studio)   │
├─ Render Studio (/render)              │
├─ Render Queue (/queue)               ─┘
├─ Outputs (/outputs)                  ─┐  Output management
├─ Projects (/projects)                ─┘
├─ Library
│  ├─ Assets (/assets)                        # active page
│  ├─ Templates → /subtitle-studio?tab=templates   # redirect
│  ├─ Voices → /audio-studio?tab=voices            # redirect
│  ├─ Music → /audio-studio?tab=music              # redirect
│  └─ Effects → /subtitle-studio?tab=effects       # redirect
├─ Configuration
│  ├─ Basic Settings (/basic-settings)   # sole provider hub (LLM/stock/TTS/future)
│  ├─ Render Settings (/render-settings) # encoder, GPU, storage, performance
│  ├─ Languages (/languages)
│  └─ Developer Mode (/developer)
├─ System
│  ├─ Logs (/logs)
│  ├─ Notifications (/notifications)
│  └─ About (/about)
├─ Account (/account?tab=…)              # first-class sidebar item
│  └─ tabs: profile, account, subscription, billing, api-usage,
│     security, general, notifications
│  └─ /profile, /billing, /subscription, /usage, /security → redirects
├─ Help (/help)                          # documentation-only hub
└─ Auth shells
   └─ /login (+ Continue as Local Studio), /signup,
      /forgot-password, /reset-password
```

---

## 6. Sidebar Architecture

Defined inline in `src/components/app-shell.tsx`:

- **Brand block** — "VideoForge AI" wordmark + "PRO" pill.
- **Two static groups** (`navMain`, `navGeneral`) — arrays of
  `{ icon, label, to, badge? }`.
- Active item resolved from `useRouterState({ select: s => s.location.pathname })`.
- Desktop: persistent column, `~260px`, shown only at `lg:` and up.
- Mobile / tablet (< `lg`): slide-in drawer (`fixed inset-y-0 left-0`)
  toggled by `mobileOpen` state, with backdrop + close button. Drawer
  auto-closes on route change (`useEffect` on `pathname`).

**Order** (current source of truth):

```
Main:      Dashboard, Create Video, Video Settings, Audio Studio,
           Projects, Subtitle Studio, Video Effects, Assets Library,
           Templates, Voices, Music, Render Studio, Render Queue,
           Outputs, Account
General:   Basic Settings, Render Settings, Languages, Logs,
           Developer Mode, About
```

Note: Video Effects, Templates, Voices and Music sidebar entries point at
routes that now **redirect** into the consolidated studios
(`/subtitle-studio`, `/audio-studio`) with the relevant tab pre-selected.

---

## 7. Top Navigation Architecture

`TopBar` (also in `app-shell.tsx`) provides:

- Mobile hamburger trigger (`onOpenMenu` prop)
- Global search trigger → opens `CommandPalette` (⌘K)
- Notification button → opens `NotificationCenter` popover (filter All / Unread)
- Language selector (8 locales, presentation only)
- Theme switcher (Sun / Moon icon toggle, presentation only — no
  `.dark` class is actually applied yet)
- System status pill — "Live" with pulsating dot
- User menu — avatar + dropdown with 7 entries
  (Profile, Account, Billing, Subscription, Usage, Security, Sign out)

`CommandPalette` (`src/components/command-palette.tsx`) provides:

- Static index of routes, providers, voices, templates, settings
- Fuzzy substring match
- ↑/↓ navigation, ↵ to open, Esc to close, ⌘K / Ctrl+K to toggle

---

## 8. State Flow

```
User input ──► page component
            ──► useApp() / useAppDispatch() (Context + reducer)
            ──► AppState (in memory only)
            ──► consumers re-render via context
```

`src/store/app-state.tsx` exports:

- `AppStateProvider` — wraps the app inside `__root.tsx`
- `useApp()` → read state
- `useAppDispatch()` → typed dispatch
- Action types include `SET_PROJECT`, `SET_SCRIPT`, `SET_KEYWORDS`,
  `SET_VOICE`, `SET_VIDEO_SETTINGS`, `SET_AUDIO_SETTINGS`,
  `SET_SUBTITLE_SETTINGS`, `ENQUEUE_TASK`, `UPDATE_TASK`,
  `MARK_DIRTY`, `MARK_SAVING`, `MARK_SAVED`, etc.

There is **no persistence** (no localStorage, no server sync).

---

## 9. Component Hierarchy

See `docs/COMPONENT_TREE.md` for the full tree. High-level:

```
__root.tsx
└─ Providers (Tooltip, AppState, Toaster)
   └─ Outlet
      ├─ AppShell                 ← used by all main pages
      │  ├─ Sidebar
      │  ├─ TopBar (CommandPalette, NotificationCenter, UserMenu)
      │  ├─ PageHeader            (per-page)
      │  ├─ page-specific sections (cards, tables, players, …)
      │  └─ Footer
      └─ AuthShell                ← login / signup / reset / forgot
```

---

## 10. Shared Components

From `src/components/shared/index.tsx`:

| Export | Purpose |
| --- | --- |
| `StatusBadge` | Rounded badge with tone variants (success / warning / error / info / brand / neutral) |
| `EmptyState` | Dashed-border empty placeholder with icon + CTA |
| `LoadingPanel` | Centered spinner + label |
| `SaveIndicator` | Dirty / saving / saved state pill |
| `HelpTip` | Inline question-mark tooltip with optional "Learn more" link |
| `Skeleton` | Pulsing block for skeleton screens |
| `StudioRedirectBanner` | Brand-gradient banner pointing duplicate routes to canonical studios |
| `ComingSoonPage` | Full-page "Planned for Phase X" placeholder |

From `src/components/app-shell.tsx` (also shared primitives):
`AppShell`, `PageHeader`, `Card`, `SectionCard`, `Field`, `Input`,
`Textarea`, `Select`, `Toggle`, `PrimaryButton`, `GhostButton`, `Pill`,
`Slider`.

From `src/components/render/`:
`RenderPipeline`, `VideoPlayer`.

From `src/components/`:
`CommandPalette` + `useCommandPalette`, `subtitle-templates.tsx`
(programmatic 100+ template generator).

---

## 11. Shared Layouts

- **`AppShell`** — every application page.
- **`AuthShell`** — `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- **`__root.tsx`** — only the HTML scaffold (head, fonts, providers).

There are no nested layout routes.

---

## 12. Context Providers

Mounted inside `__root.tsx`:

| Provider | Source | Role |
| --- | --- | --- |
| `TooltipProvider` | `@/components/ui/tooltip` | Radix tooltip context for the whole tree |
| `AppStateProvider` | `@/store/app-state` | Global app state |
| `Toaster` | `@/components/ui/sonner` | Toast portal (sonner) |

No `QueryClientProvider` is mounted at the app level today (the QueryClient is
created inside the router for future use, but no `useQuery` calls exist yet).

---

## 13. Hooks

| Hook | File | Purpose |
| --- | --- | --- |
| `useApp` | `src/store/app-state.tsx` | Read app state |
| `useAppDispatch` | `src/store/app-state.tsx` | Dispatch typed actions |
| `useCommandPalette` | `src/components/command-palette.tsx` | Global ⌘K open/close |
| `useIsMobile` | `src/hooks/use-mobile.tsx` | Window width breakpoint helper |
| Built-in route hooks | `useRouterState`, `useNavigate`, `Link` | TanStack Router |

---

## 14. Libraries Used

`@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query`,
`react` 19, `react-dom`, `tailwindcss` v4, `tw-animate-css`,
`@radix-ui/*` (accordion, alert-dialog, avatar, checkbox, collapsible,
context-menu, dialog, dropdown-menu, hover-card, label, menubar,
navigation-menu, popover, progress, radio-group, scroll-area, select,
separator, slider, switch, tabs, toggle, toggle-group, tooltip),
`lucide-react`, `sonner`, `class-variance-authority`, `clsx`,
`tailwind-merge`, `cmdk`, `embla-carousel-react`, `react-day-picker`,
`react-hook-form`, `recharts`, `vaul`, `zod`, `next-themes`.

See `package.json` for the canonical version list.

---

## 15. Styling Strategy

- **Tailwind v4** with all theme tokens declared in `src/styles.css`
  via `@theme inline` (colors, radii, font families).
- **Color tokens** in **OKLCH** under `:root`. No dark theme variables
  defined yet (theme switcher is visual only).
- **Brand utilities** declared with Tailwind v4 `@utility` blocks:
  `bg-brand-gradient`, `bg-brand-gradient-radial`, `text-brand-gradient`,
  `shadow-card`, `shadow-card-lg`, `shadow-brand`.
- **No hardcoded hex** in components except the brand gradient stops
  (`#164E32`, `#227850`) used inside `styles.css`.
- **Responsive layer** scoped to `.app-content` in `styles.css`
  collapses dense grids on tablet/mobile, un-pins sticky rails, and
  makes tables horizontally scroll.

---

## 16. Responsive Strategy

| Breakpoint | Behavior |
| --- | --- |
| ≥ 1280 px (desktop, target) | Full multi-column layouts, sticky rails, max content width 1760 px |
| 1024–1279 px | Sidebar visible, grids may collapse to 2 cols via `.app-content` rules |
| 640–1023 px | Sidebar becomes drawer (hamburger), 3+-col grids → 2 cols, sticky rails un-pinned, tables scroll |
| < 640 px | All grids → 1 col, headings clamp via `clamp()`, flex rows wrap |

Page padding is fluid: `px-4 sm:px-6 lg:px-8`. `AppShell` accepts a
`maxWidth` prop (default 1760 px).

---

## 17. Animation Strategy

- Tailwind transitions on hover/active states (`transition`, `duration-*`).
- `tw-animate-css` for fade-in / slide-in (mobile drawer uses
  `animate-in slide-in-from-left duration-200`).
- Lucide `Loader2` + `animate-spin` for loading spinners.
- Pulsating "Live" status indicator and pipeline progress bars.
- No GSAP / Framer Motion currently in dependencies.

---

## 18. Design Principles

1. **Premium desktop first** — generous spacing, rounded-3xl cards,
   subtle shadows (`shadow-card`, `shadow-card-lg`).
2. **Brand gradient is the focal accent** — used sparingly on hero CTAs,
   active states, and progress.
3. **Semantic tokens only** — components consume `bg-card`,
   `text-foreground`, `border-border`, etc.; raw colors are forbidden in
   page code.
4. **Information density without clutter** — heavy use of pills,
   inline icons, and 11–12 px metadata text.
5. **Always reachable** — every workflow is one ⌘K away.

---

## 19. Theme System

- Single light theme defined under `:root` in `styles.css`.
- Dark variant declared via `@custom-variant dark (&:is(.dark *))` but
  no `.dark` color overrides are wired yet.
- Theme toggle in TopBar is visual only.

---

## 20. Current Frontend Limitations

- No real authentication; `/login`, `/signup`, etc. are visual shells.
- No data persistence (state resets on reload).
- No live data — render queue, outputs, notifications, and projects use
  seed constants from `src/lib/render-pipeline.ts`.
- Dark theme switch is not actually applied.
- No `notFoundComponent` / route-level error boundaries.
- TanStack Query installed but unused.
- Some "Coming Soon" stubs (`/account`, `/billing`, `/help`, etc.) are
  intentionally placeholder.
- File uploads, downloads and exports are UI-only (no I/O).

---

## 21. Backend Readiness (MoneyPrinterTurbo)

| UI surface | Maps to MoneyPrinterTurbo concept |
| --- | --- |
| `/basic-settings` AI providers + Pexels/Pixabay | `config.toml` (`llm_*`, `pexels_api_keys`, `pixabay_api_keys`) |
| `/create` script generation | `services/llm.generate_script` |
| Keywords search preview | `services/material.search_videos` |
| `/audio-studio` voice + BGM | `services/voice`, `services/material.get_bgm_file` |
| `/subtitle-studio` styling/animation | `services/subtitle.generate` + post-processing options |
| `/video-settings` assembly, transitions, encoder | `services/video.combine_videos` + ffmpeg encoder selection |
| `/render` + `/queue` 15-stage pipeline | `controllers/v1/video.create` task lifecycle (`state.update_task`) |
| `/outputs` | Files produced under `storage/tasks/<task_id>/final-N.mp4` |
| `/logs`, `/developer` | App + uvicorn logs, raw task JSON |

The store's `RenderTask` shape already aligns with the task event payload
needed to wire a WebSocket / SSE channel.

---

End of FRONTEND_ARCHITECTURE.md.
