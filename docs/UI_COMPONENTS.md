# UI_COMPONENTS.md

> Reusable component reference. Each entry lists the **current** export
> signature, props, dependencies, callers, variants, planned backend
> binding, and accessibility notes.

---

## Layout / Shell

### `AppShell`
- **File:** `src/components/app-shell.tsx`
- **Purpose:** Standard application chrome (sidebar + topbar + scroll container + footer).
- **Props:** `{ children: ReactNode; maxWidth?: number = 1760 }`
- **Dependencies:** `Sidebar`, `TopBar`, `Footer` (all in same file), `useRouterState`, lucide icons, `CommandPalette`.
- **Used by:** Every main page (`index`, `create`, `video-settings`, `audio-studio`, `subtitle-studio`, `render`, `queue`, `outputs`, `projects`, `basic-settings`, `settings`, `api-manager`, `assets`, `templates`, `voices`, `music`, `effects`, `languages`, `logs`, `developer`, `notifications`, `about`).
- **Variants:** `maxWidth` only.
- **Backend:** none directly.
- **A11y:** Hamburger has `aria-label`; drawer backdrop is a button with `aria-label="Close menu"`; auto-closes on route change.

### `AuthShell`
- **File:** `src/components/auth-shell.tsx`
- **Purpose:** Centered card layout for auth flows.
- **Props:** `{ children: ReactNode }` (and brand slot internally).
- **Used by:** `login`, `signup`, `forgot-password`, `reset-password`.
- **Variants:** none.

### `PageHeader`
- **Props:** `{ crumb: string[]; title: string; subtitle?: string; actions?: ReactNode }`
- **Purpose:** Page title row with breadcrumb and optional trailing actions.

---

## TopBar surfaces

### `CommandPalette` + `useCommandPalette`
- **File:** `src/components/command-palette.tsx`
- **Purpose:** ⌘K palette for navigating routes, providers, voices, templates, settings.
- **Hook API:** `const { open, setOpen } = useCommandPalette()`.
- **Variants:** none.
- **Backend:** future binding to search index (projects, outputs).
- **A11y:** Keyboard navigation ↑/↓/↵/Esc, focus trap inside dialog overlay, ⌘K + Ctrl+K bindings.

### NotificationCenter, UserMenu, LanguageSelector, ThemeSwitch
- Defined inline inside `app-shell.tsx`. Visual only.

---

## Render-specific

### `RenderPipeline`
- **File:** `src/components/render/pipeline.tsx`
- **Purpose:** Visualizes the 15-stage MoneyPrinterTurbo pipeline.
- **Props:** `{ states: Partial<Record<PipelineStageId, PipelineStageState>>; compact?: boolean }`
- **Dependencies:** `PIPELINE_STAGES`, `statusTone` from `src/lib/render-pipeline.ts`; `Pill`.
- **Used by:** `/render`, `/` (Dashboard).
- **Variants:** `compact` hides progress bars and per-stage metadata.
- **Backend:** map directly from MPT task event stream → `states`.
- **A11y:** Status conveyed by both icon and text label.

### `VideoPlayer`
- **File:** `src/components/render/video-player.tsx`
- **Purpose:** Pro-grade desktop video player (scrub, speed 0.25×–2×, loop, subtitle preview, safe-area, PiP, fullscreen).
- **Props:** `{ src?: string; poster?: string; aspect?: "9:16" | "16:9" | "1:1" | "4:5"; title?: string }`
- **Used by:** `/outputs`, `/render`.
- **Variants:** placeholder UI when `src` missing.
- **Backend:** consumes signed URLs from MPT output store.
- **A11y:** All control buttons have `title`; range inputs are native.

---

## Shared primitives

### `StatusBadge`
- **File:** `src/components/shared/index.tsx`
- **Props:** `{ tone?: "success"|"warning"|"error"|"info"|"neutral"|"brand"; icon?: LucideIcon; children: ReactNode }`
- **Used by:** `/basic-settings`, `/render`, `/queue`.
- **Variants:** 6 tones.

### `EmptyState`
- **Props:** `{ icon?: LucideIcon; title: string; description?: string; action?: ReactNode }`
- **Used by:** `/outputs`, `/queue` (when empty).

### `LoadingPanel`
- **Props:** `{ label?: string = "Loading…" }`
- **Backend:** wrap during `useQuery` `isLoading` states (future).

### `SaveIndicator`
- **Props:** `{ isDirty: boolean; isSaving: boolean; lastSavedAt?: string | null }`
- **Used by:** `/create`, `/basic-settings`, `/subtitle-studio`, `/video-settings`, `/audio-studio`.

### `HelpTip`
- **Props:** `{ label: string; learnMoreHref?: string }`
- **Used by:** `/basic-settings`, `/create`.
- **A11y:** `aria-label`, `role="tooltip"`, keyboard focusable, dismisses on blur.

### `Skeleton`
- **Props:** `{ className?: string }`
- **Backend:** future loading placeholders.

### `StudioRedirectBanner`
- **Props:** `{ title; description; to; ctaLabel }`
- **Used by:** `/templates`, `/voices`, `/music` (entry points pointing to canonical studios).

### `ComingSoonPage`
- **Props:** `{ crumb; title; subtitle?; eta?; description?; icon? }`
- **Used by:** account-area stubs.

---

## Form / Control primitives (from `app-shell.tsx`)

| Component | Props (key) | Notes |
| --- | --- | --- |
| `Card` | `{ children; className?; padding? = "p-4 sm:p-6" }` | Standard `rounded-3xl bg-card border shadow-card` |
| `SectionCard` | `{ title; subtitle?; right?; children; defaultOpen? = true; collapsible? = true }` | Collapsible content section with header row |
| `Field` | `{ label; hint?; children }` | Form-field wrapper with label + hint |
| `Input` | Standard `<input>` props | Tailwind-themed text input |
| `Textarea` | Standard `<textarea>` props | Themed textarea |
| `Select` | Standard `<select>` props | Themed select |
| `Toggle` | `{ checked?; onChange? }` | Brand-gradient switch |
| `Slider` | `{ value?; min?; max?; onChange? }` | Branded range slider |
| `PrimaryButton` | Native `<button>` + brand styling | Brand-gradient CTA |
| `GhostButton` | Native `<button>` + ghost styling | Secondary action |
| `Pill` | `{ children; tone?: "default"|"success"|"warning"|"primary"|"danger" }` | Small status chip |

All are presentation-only — no internal state besides what the prop dictates.

---

## Library entry banners

`StudioRedirectBanner` is the canonical pattern for "this page points to a
richer studio" routing. Use for any future library page redirecting to a
specialized editor.

---

## Accessibility checklist (current status)

| Area | Status |
| --- | --- |
| Keyboard nav (Tab, Enter, Esc, ⌘K) | ✅ in CommandPalette, drawers, HelpTip |
| `aria-label` on icon-only buttons | ✅ mostly (hamburger, drawer close, HelpTip) |
| Focus rings | ✅ via `focus:ring-*` Tailwind classes |
| Color contrast | ✅ tokens designed against AA on the light theme |
| Reduced motion | ⚠️ not yet honored |
| Screen-reader labels for pipeline stages | ⚠️ icon + text present; could add `aria-live` for progress |
| Form validation announcements | ❌ no `aria-invalid` / `aria-describedby` wired (forms are visual) |
