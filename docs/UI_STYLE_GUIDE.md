# UI_STYLE_GUIDE.md

> Visual-language guide for VideoForge AI. Use this when adding any new
> surface so it stays consistent with the existing design system.

---

## 1. Brand Identity

- **Product name:** VideoForge AI (sometimes referred to internally as Abid VideoForge AI).
- **Brand pill:** "PRO" — gradient capsule next to the wordmark in the sidebar.
- **Primary brand color:** dark emerald gradient `#164E32 → #227850`.
- **Tone:** premium, confident, technical, calm. Avoid playful or
  cartoony elements.
- **Logo / icon stand-in:** lucide `Sparkles` glyph on a brand-gradient
  square (`rounded-2xl`/`rounded-3xl`, `shadow-brand`).
- **Voice:** short, declarative labels; sentence case for body text,
  uppercase tracking-wider for badges.

---

## 2. Visual Hierarchy

1. **Page title** (`PageHeader`) — strongest text on screen (`text-[20px]+`, `font-extrabold`).
2. **Section title** (`SectionCard`) — `text-[16px] font-bold` with optional subtitle (`text-[11.5px] text-muted-foreground`).
3. **Card title** — `text-[14px] font-bold`.
4. **Body text** — `text-[13px]` neutral foreground.
5. **Metadata** — `text-[11px]` muted, often `font-mono` for numbers.

Always pair size with weight; avoid relying on color alone.

---

## 3. Card Usage

- Standard surface: `rounded-3xl bg-card border border-border shadow-card`.
- Use `Card` for ad-hoc surfaces, `SectionCard` when content benefits
  from a titled, collapsible region.
- Elevation is conveyed by `shadow-card-lg` (drawer, popovers).
- Reserve `shadow-brand` for brand-gradient surfaces only.
- Don't nest cards more than two levels deep.

---

## 4. Spacing Rules

- Container padding: `px-4` (mobile) → `sm:px-6` → `lg:px-8`.
- Card padding: `p-4 sm:p-6`.
- Vertical rhythm: `space-y-6` between sections, `space-y-4` inside cards.
- Grid gap: `gap-4` (mobile) → `gap-6` (desktop).
- Buttons inside rows: `gap-2`.

---

## 5. Typography Scale

| Role | Size | Weight | Font |
| --- | --- | --- | --- |
| Page H1 | 28 px (clamps to 22 on mobile) | 800 | Plus Jakarta Sans |
| Section H2 | 20 px | 800 | Plus Jakarta Sans |
| Card title | 14–16 px | 700 | Plus Jakarta Sans |
| Body | 13 px | 500–600 | Inter |
| Metadata / pill | 10.5–11.5 px | 600–700 (uppercase, wider tracking) | Inter |
| Numbers / paths | 10.5–12.5 px | 500 | JetBrains Mono |

Letter-spacing for headings: `-0.02em` (configured globally).

---

## 6. Button Hierarchy

1. **Primary CTA** → `PrimaryButton` (brand gradient, `shadow-brand`). One per region.
2. **Secondary action** → `GhostButton` (bordered, neutral fill).
3. **Tertiary / icon** → bare button in `bg-secondary` square, `text-muted-foreground hover:text-foreground`.
4. **Destructive** → `text-destructive` text or rose-toned `StatusBadge`.

Disable affordance: `opacity-50 cursor-not-allowed`; disabled buttons keep their structure but lose hover changes.

---

## 7. Form Rules

- Always wrap fields with `Field` so labels and hints render consistently.
- Inputs are `h-10 rounded-xl`. Avoid raw `<input>` without theme classes.
- For dangerous toggles (e.g., experimental features), pair `Toggle` with a `StatusBadge` warning.
- Use `HelpTip` inline next to a label to explain advanced parameters.

---

## 8. Responsive Rules

- Design desktop-first; let `.app-content` responsive layer collapse grids.
- Test at: 4K (3840 px), 2560, 1920, 1600, 1440, 1366 (laptop), 1024 (tablet), 768 (small tablet), 390 (mobile).
- Never set fixed pixel widths on layout containers; rely on `max-width` + fluid columns.
- Below `lg`: sidebar becomes a drawer; sticky rails unpin (`.app-content .sticky { position: static }`).
- Below `sm`: all grids collapse to one column; headings clamp.

---

## 9. Accessibility Rules

- Every icon-only control must have either `aria-label` or `title`.
- Use semantic HTML (`<button>`, `<nav>`, `<ul>` for lists) before reaching for `<div>`.
- Maintain ≥ 4.5:1 contrast for body text against `bg-card` / `bg-background`.
- Do not convey state with color alone — pair with icon + label.
- Keyboard: every interactive element must be focusable; rely on `focus:ring-2 focus:ring-primary/30`.
- Modal surfaces (CommandPalette) trap focus and respond to Esc.

---

## 10. Icon Rules

- Use **lucide-react** only; do not introduce a second icon set.
- Default size 14–16 px (`w-3.5 h-3.5` or `w-4 h-4`). Hero icons 24–28 px.
- Stroke width: rely on lucide default (1.5–2). Use `strokeWidth={2.2}` for emphasis in the pipeline.
- Icons paired with text get `gap-1.5` or `gap-2`.

---

## 11. Motion Guidelines

- Subtle and purposeful. Use Tailwind transitions (`transition`, `duration-200`) for hover / active states.
- Use `animate-in slide-in-from-left duration-200` for the mobile drawer.
- Use `animate-spin` only on `Loader2` to indicate work in progress.
- Use `animate-pulse` for the "Live" status dot and skeletons only.
- Avoid bounce, elastic, or large parallax effects — they would break the premium feel.
- Respect users' `prefers-reduced-motion` (TODO — not yet honored).

---

## 12. Color Usage

- Use semantic tokens (`bg-card`, `text-foreground`, `border-border`, etc.) — never raw hex inside pages.
- Brand gradient is reserved for: primary CTAs, active pipeline stage, hero banner blocks, brand pill, sparkles glyph.
- Status palettes: emerald (success), amber (warning), rose (error), sky (info), neutral secondary (default).
- Never combine two status colors in the same component.

---

## 13. Dark Theme Rules

- Dark variant is declared (`@custom-variant dark (&:is(.dark *))`) but
  currently has no tokens. **Until tokens are added, do not assume a
  dark mode in design work.** When tokens land:
  - Surfaces: deep neutral with subtle green tint.
  - Brand gradient unchanged but shadow opacity reduced.
  - Foreground text: light off-white (avoid pure white).

---

## 14. Future Design Principles

- **Data first.** Every screen should communicate state (idle / running / failed / saved) at a glance.
- **Hide complexity, expose power.** Default to the smart choice; reveal advanced controls behind collapsible sections (`SectionCard collapsible`).
- **Editor parity.** All long-form editors (script, subtitles, audio, video settings) should share the same shell pattern: page header → sections → sticky rail.
- **Studio routes are authoritative.** Library pages (`/templates`, `/voices`, `/music`) should keep using `StudioRedirectBanner` to point users to the canonical editor instead of duplicating functionality.
- **One pixel grid.** New components should align to the 4 px Tailwind spacing scale; do not introduce off-grid paddings without justification.
