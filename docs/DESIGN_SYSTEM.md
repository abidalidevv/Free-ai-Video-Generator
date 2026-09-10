# DESIGN_SYSTEM.md

> The visual design system as defined in `src/styles.css` and reused
> across the codebase. Values quoted here are the **current** source of
> truth.

---

## 1. Colors (OKLCH tokens, light theme)

Declared under `:root` in `src/styles.css`, exposed to Tailwind via
`@theme inline`:

| Token | OKLCH value | Used as |
| --- | --- | --- |
| `--background` | `0.972 0 0` | App background (body is forced to `#F7F7F7`) |
| `--foreground` | `0.18 0.02 160` | Primary text |
| `--card` / `--card-foreground` | `1 0 0` / `0.18 0.02 160` | Card surface |
| `--popover` / `--popover-foreground` | `1 0 0` / `0.18 0.02 160` | Popover surface |
| `--primary` | `0.42 0.11 155` | Primary brand color |
| `--primary-foreground` | `0.99 0 0` | Text on primary |
| `--primary-dark` | `0.32 0.09 155` | Pressed / dark primary |
| `--secondary` | `0.96 0.005 160` | Secondary fills (chips, controls) |
| `--secondary-foreground` | `0.22 0.02 160` | Text on secondary |
| `--muted` / `--muted-foreground` | `0.965 0.003 160` / `0.52 0.015 160` | Muted bg + text |
| `--accent` / `--accent-foreground` | `0.95 0.02 155` / `0.3 0.08 155` | Soft accent fill + text |
| `--destructive` / `--destructive-foreground` | `0.6 0.22 27` / `0.99 0 0` | Errors |
| `--success` | `0.62 0.16 155` | Success states |
| `--warning` | `0.78 0.15 75` | Warning states |
| `--border`, `--input`, `--ring` | greenish neutrals | Outlines, inputs, focus rings |
| `--sidebar`, `--sidebar-foreground`, `--sidebar-muted` | white-ish | Sidebar surfaces |

### Brand gradient

```css
@utility bg-brand-gradient {
  background-image: linear-gradient(180deg, #164E32 0%, #227850 100%);
}
@utility bg-brand-gradient-radial {
  background-image: radial-gradient(at 30% 20%, #2a8a5c 0%, #164E32 60%, #0d3a24 100%);
}
@utility text-brand-gradient { /* same gradient, clipped to text */ }
```

Tokens additionally exposed:
- `--color-primary-gradient-from: #164E32`
- `--color-primary-gradient-to:   #227850`

### Status colors

- Success: `text-emerald-700 bg-emerald-50 border-emerald-200`
- Warning: `text-amber-700  bg-amber-50  border-amber-200`
- Error:   `text-rose-700   bg-rose-50   border-rose-200`
- Info:    `text-sky-700    bg-sky-50    border-sky-200`
- Brand:   `bg-brand-gradient text-white shadow-brand`

(See `STATUS_BADGE` source in `src/components/shared/index.tsx`.)

### Dark theme

Declared via `@custom-variant dark (&:is(.dark *))` but **no dark
overrides exist yet** — switching the theme toggle has no visual effect.

---

## 2. Typography

| Token | Value |
| --- | --- |
| `--font-display` | `"Plus Jakarta Sans", "Inter", system-ui, sans-serif` |
| `--font-sans` | `"Inter", system-ui, sans-serif` |
| Mono | JetBrains Mono (used selectively via `font-mono`) |

Headings (`h1`–`h5`) automatically use `--font-display` with
`letter-spacing: -0.02em`.

### Scale (observed in code)

| Token | Size | Common use |
| --- | --- | --- |
| `text-[10.5px]` / `text-[11px]` | 10–11 px | Metadata, captions, pill text |
| `text-[11.5px]` / `text-[12.5px]` | 11–13 px | Form hints, sub-labels |
| `text-[13px]` / `text-[13.5px]` | 13 px | Default body |
| `text-[14px]` | 14 px | Card titles |
| `text-[15px]` / `text-[16px]` | 15–16 px | Section titles |
| `text-[18px]` | 18 px | Subtitle preview text |
| `text-[20px]` | 20 px | Page H2 |
| Responsive H1 | `clamp(22px, 7vw, 28px)` | Mobile heading |

Font weights used: `font-medium` (500), `font-semibold` (600), `font-bold` (700), `font-extrabold` (800).

---

## 3. Spacing

Tailwind default 4 px scale. Conventional values:

| Context | Padding | Gap |
| --- | --- | --- |
| Page content container | `px-4 sm:px-6 lg:px-8` `pb-10 pt-2` | — |
| Card default | `p-4 sm:p-6` | `gap-4` / `gap-6` |
| SectionCard header | `px-6 py-5` | — |
| TopBar | `px-6 h-16` | `gap-3` |
| Sidebar items | `px-3 py-2` | `gap-2.5` |
| Grids | `gap-4` (mobile) → `gap-6` (desktop) | — |

---

## 4. Radius

```css
--radius: 0.875rem;
--radius-sm  = radius − 4px
--radius-md  = radius − 2px
--radius-lg  = radius
--radius-xl  = radius + 4px
--radius-2xl = radius + 8px
--radius-3xl = radius + 16px
--radius-4xl = radius + 24px
```

Common usages:
- Cards → `rounded-3xl`
- Buttons → `rounded-xl`
- Pills / badges → `rounded-full`
- Inputs → `rounded-xl`

---

## 5. Shadows

| Utility | Definition | Use |
| --- | --- | --- |
| `shadow-card` | `0 1px 2px rgb(16 24 40 / 0.04), 0 1px 3px rgb(16 24 40 / 0.03)` | Standard cards |
| `shadow-card-lg` | `0 4px 24px -8px rgb(16 24 40 / 0.08), 0 2px 6px -2px rgb(16 24 40 / 0.04)` | Elevated cards, drawer |
| `shadow-brand` | `0 8px 24px -8px rgb(22 78 50 / 0.35)` | Brand CTAs, active pipeline stage |

---

## 6. Animation durations

- Tailwind defaults: `duration-150`, `duration-200`, `duration-300` (used inside `app-shell.tsx` drawer transition).
- `tw-animate-css`: `animate-in`, `slide-in-from-left`, `fade-in-0`, `zoom-in-95`.
- Spinners: `animate-spin` with `Loader2` icon.
- Pulsating "Live" status: Tailwind `animate-pulse` on the dot.

---

## 7. Icons

- Library: **lucide-react** (already imported per page).
- Size convention: `w-3.5 h-3.5` (small), `w-4 h-4` (default), `w-[18px] h-[18px]` (pipeline), `w-5 h-5` (headers), `w-6 h-6` (hero), `w-7 h-7` (XL).
- `strokeWidth={2.2}` is used in the pipeline.

---

## 8. Grid system

- 12-column Tailwind grid (`grid-cols-12`) for dense layouts.
- Common shapes:
  - Dashboard hero: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
  - Page split (content + rail): `grid-cols-1 xl:grid-cols-[1fr_360px]`
  - Provider cards: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Responsive layer in `styles.css` automatically collapses 3+ col grids
  inside `.app-content`:
  - `< 1024 px` → 2 cols
  - `< 640 px`  → 1 col

---

## 9. Container widths

- Sidebar: `~260 px` desktop, `280 px` drawer (`max-w-[85vw]`)
- TopBar: matches content `maxWidth`
- Page content: `mx-auto`, `maxWidth` default **1760 px**
- Auth shell: `max-w-md`
- ComingSoonPage card: `max-w-2xl`

---

## 10. Breakpoints

Tailwind defaults (used throughout):

| Token | Min width |
| --- | --- |
| `sm` | 640 px |
| `md` | 768 px |
| `lg` | 1024 px (sidebar appears) |
| `xl` | 1280 px |
| `2xl` | 1536 px |

Custom media queries in `styles.css` at `max-width: 1023px` and `max-width: 639px`.

---

## 11. Glassmorphism

Used sparingly:
- Mobile drawer backdrop: `bg-foreground/40 backdrop-blur-sm`
- Video player overlays: `bg-black/40 backdrop-blur`
- NotificationCenter / UserMenu floats over content with `shadow-card-lg`

Not used as the dominant aesthetic; surfaces are solid.

---

## 12. Cards

`rounded-3xl bg-card border border-border shadow-card`, padding `p-4 sm:p-6`.

`SectionCard` adds a header (`px-6 py-5 border-b border-border`) with
title, optional subtitle, optional right slot, and collapse chevron.

---

## 13. Buttons

| Variant | Implementation | Visual |
| --- | --- | --- |
| Primary | `PrimaryButton` | `bg-brand-gradient text-white rounded-xl h-10 px-4 shadow-brand` |
| Ghost | `GhostButton` | `bg-card border border-border rounded-xl h-10 px-4 hover:bg-secondary` |
| Icon (topbar) | inline | `w-9 h-9 rounded-xl bg-secondary` |
| Tool button (player) | `ToolBtn` | `w-9 h-9 rounded-xl` toggleable |

---

## 14. Inputs

Themed via `app-shell.tsx`:
- Height `h-10`, radius `rounded-xl`, border `border-border`, focus ring `focus:ring-2 focus:ring-primary/30`.
- `Field` wraps with `label` (`text-[12px] font-semibold text-foreground/80`) and optional `hint`.

---

## 15. Forms

- Layout: vertical stacks of `Field` inside `SectionCard`.
- No client-side validation library wired in user-facing forms (zod and react-hook-form are installed but unused at the page level).
- Save state communicated via `SaveIndicator`.

---

## 16. Dialogs / Drawers / Sheets

- shadcn `dialog`, `drawer`, `sheet`, `alert-dialog` are available but mostly unused by pages.
- Custom drawer = mobile sidebar.
- Custom modal = `CommandPalette` overlay.

---

## 17. Tables

- Default Tailwind tables; responsive layer makes them horizontally scrollable below `lg`.
- Used in `/queue`, `/logs`, `/api-manager`.

---

## 18. Badges & Pills

- `Pill` (custom): rounded-full chip with tones default/success/warning/primary/danger.
- `StatusBadge` (shared): rounded-full uppercase tag, 6 tones.
- Sidebar uses small inline pills (e.g., "AI", "PRO", "NEW", "24", "3").

---

## 19. Toast system

- Library: **sonner**.
- Mounted globally in `__root.tsx` via `<Toaster />` (`src/components/ui/sonner.tsx`).
- Class overrides keep toast styles aligned with theme tokens.

---

## 20. Loading system

- `LoadingPanel` for full-card loading.
- `Loader2` + `animate-spin` for inline spinners.
- `SaveIndicator` for saving state.

---

## 21. Skeleton system

- `Skeleton` from `shared/index.tsx`: `animate-pulse rounded-lg bg-secondary/70`.
- Also exists as `ui/skeleton.tsx` (unused).

---

## 22. Z-index conventions (observed)

- Mobile drawer backdrop: `z-40`
- Mobile drawer panel: `z-50`
- Tooltip / Popover content: `z-50` (Radix default)
- Tooltip in `HelpTip`: `z-50`
