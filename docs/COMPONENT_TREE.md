# COMPONENT_TREE.md

> Component composition as it exists today. Tree nodes correspond to
> actual files; no invented components.

---

## 1. Top-down Tree

```
App entry  (src/start.ts → src/router.tsx → __root.tsx)
└─ RootRoute (src/routes/__root.tsx)
   ├─ <html>/<head> shell (fonts, viewport, manifest)
   ├─ TooltipProvider              (src/components/ui/tooltip)
   ├─ AppStateProvider             (src/store/app-state.tsx)
   ├─ Toaster                      (src/components/ui/sonner.tsx)
   └─ <Outlet />
      │
      ├─ AppShell  (src/components/app-shell.tsx)            ← used by all main pages
      │  ├─ Sidebar
      │  │  ├─ Brand block (wordmark + PRO pill)
      │  │  ├─ NavGroup "Main"      (Dashboard, Create, …, Outputs)
      │  │  └─ NavGroup "General"   (API Manager, Settings, …, About)
      │  ├─ Mobile drawer (slide-in + backdrop)
      │  ├─ TopBar
      │  │  ├─ Hamburger (mobile)
      │  │  ├─ Search trigger ──► CommandPalette (cmd/ctrl+K)
      │  │  ├─ NotificationCenter (popover, All/Unread tabs)
      │  │  ├─ LanguageSelector (8 locales, visual)
      │  │  ├─ ThemeSwitch (Sun/Moon, visual)
      │  │  ├─ System "Live" pill
      │  │  └─ UserMenu (avatar + 7-entry dropdown)
      │  ├─ PageHeader (per-page; crumb + title + actions)
      │  ├─ <page content>
      │  └─ Footer
      │
      └─ AuthShell  (src/components/auth-shell.tsx)
         └─ Centered card + brand glyph + form slot
```

## 2. Pages → Sections

### Dashboard (`/`)
```
DashboardPage
├─ Hero stats grid (4× StatCardHero)
├─ RenderPipeline                 (component)
├─ TimerCard
├─ QuickActions
├─ RecentOutputs grid
└─ RecentProjects gallery
```

### Create Video (`/create`)
```
CreatePage
├─ SubjectCard
├─ GenerationPipeline (5 SectionCard steps)
├─ AdvancedScriptSettings (SectionCard)
├─ ScriptEditor
│  ├─ AnalyticsTiles (8)
│  └─ AIActionsRow (10 buttons)
├─ KeywordManager (draggable tags + Pexels preview)
└─ StickyRail
   ├─ LivePreview (9:16)
   └─ AIAssistantCard
```

### Video Settings (`/video-settings`)
```
VideoSettingsPage
├─ SourceProviderGrid
├─ AssemblyModeSwitch
├─ TransitionGallery
├─ AspectRatioSelector + ClipDurationSliders
├─ EncoderSelector + HardwareBadges
├─ SmartMatchingPreview
└─ RenderPlanSidebar
```

### Audio Studio (`/audio-studio`)
```
AudioStudioPage
├─ TTSProviderGrid (9)
├─ VoiceLibrary (filters + cards)
├─ VoicePreviewPlayer (waveform)
├─ VoiceControls (volume / speed)
├─ CustomAudioUploader
└─ BGMSection (modes + loop/fade/trim)
```

### Subtitle Studio (`/subtitle-studio`)
```
SubtitleStudioPage
├─ FontLibrary (35)
├─ TemplateGrid                  ← subtitle-templates.tsx
├─ PositionGrid
├─ BackgroundsPanel
├─ AnimationStudio (IN/OUT/LOOP cards)
├─ KaraokeAndHighlight
├─ BrandKit
└─ AIStyleRecommendationCard
```

### Render Studio (`/render`)
```
RenderPage
├─ ProjectMetaRail
├─ RenderPipeline (live state)
├─ VideoPlayer
└─ OutputMetaRail
```

### Render Queue (`/queue`)
```
QueuePage
├─ Toolbar (filters)
└─ QueueTable (progress + actions)
```

### Outputs (`/outputs`)
```
OutputsPage
├─ Toolbar (search + filters)
├─ OutputCardGrid
└─ DetailDrawer (VideoPlayer + metadata)
```

### Basic Settings (`/basic-settings`)
```
BasicSettingsPage
├─ AIProvidersGrid
├─ ModelBrowser
├─ ConnectionHealthPanel
├─ VideoSourceCards (Pexels, Pixabay)
└─ QuickActions (Import/Export/Backup/Reset)
```

(Other pages follow the same Page → SectionCards → Cards pattern.)

## 3. Dialogs / Drawers / Popovers in use

- `CommandPalette` — modal overlay (custom, in `command-palette.tsx`)
- `NotificationCenter` — popover (inline in `app-shell.tsx`)
- `UserMenu` — dropdown (inline in `app-shell.tsx`)
- Outputs `DetailDrawer` (inline in `outputs.tsx`)
- shadcn primitives available but not yet used: `dialog`, `drawer`,
  `sheet`, `alert-dialog`.

## 4. Shared Components

`src/components/shared/index.tsx`:
- `StatusBadge`, `EmptyState`, `LoadingPanel`, `SaveIndicator`,
  `HelpTip`, `Skeleton`, `StudioRedirectBanner`, `ComingSoonPage`

`src/components/app-shell.tsx` (exported helpers):
- `AppShell`, `PageHeader`, `Card`, `SectionCard`, `Field`, `Input`,
  `Textarea`, `Select`, `Toggle`, `PrimaryButton`, `GhostButton`,
  `Pill`, `Slider`

`src/components/render/`:
- `RenderPipeline`, `VideoPlayer`

`src/components/`:
- `CommandPalette`, `useCommandPalette`
- `subtitle-templates.tsx` (template factory)

## 5. Primitive UI (`src/components/ui/` — 46 files)

accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
button, calendar, card, carousel, chart, checkbox, collapsible, command,
context-menu, dialog, drawer, dropdown-menu, form, hover-card,
input-otp, input, label, menubar, navigation-menu, pagination, popover,
progress, radio-group, resizable, scroll-area, select, separator, sheet,
sidebar, skeleton, slider, sonner, switch, table, tabs, textarea,
toggle-group, toggle, tooltip.

> Most application pages use the **custom** primitives exported from
> `app-shell.tsx` (Card, Input, Toggle, …) rather than the shadcn
> versions; the shadcn set is available for future composition.

## 6. Reusable Components

- `AppShell`, `PageHeader`, `Card`, `SectionCard`, `Pill`, `Field`,
  `Input`, `Textarea`, `Select`, `Toggle`, `Slider`,
  `PrimaryButton`, `GhostButton`
- `RenderPipeline`, `VideoPlayer`
- All `shared/*` exports
- `CommandPalette`

## 7. Duplicate / Overlapping Components

| Duplicate pair | Where | Recommendation |
| --- | --- | --- |
| `Card` (custom in `app-shell.tsx`) vs `Card` from `ui/card.tsx` | app-shell.tsx is used everywhere; the shadcn one is unused | Keep one; alias the unused |
| `Input`, `Textarea`, `Select`, `Slider`, `Toggle` exist in both `app-shell.tsx` (used) and `ui/*` (unused) | same | Consider folding the custom ones onto shadcn primitives later |
| `Skeleton` in `shared/index.tsx` and `ui/skeleton.tsx` | both exist; only the shared one is used | Pick one canonical export |
| `Toggle` (custom) vs `Switch` (shadcn) | semantic overlap | Keep custom for now |

## 8. Candidates for Extraction

- **StatCardHero / TimerCard / QuickActions** — currently inline in
  `index.tsx`; promote to `components/dashboard/*` once a second page
  needs them.
- **Sticky preview rail** in `create.tsx` — pattern repeats in
  `video-settings.tsx`; extract a `StickyRail` shell.
- **Provider grid card** (AI providers in `basic-settings.tsx`, TTS
  providers in `audio-studio.tsx`, video sources in
  `video-settings.tsx`) — same shape; extract `ProviderCard`.
- **Brand-gradient hero banner** repeated in multiple pages — extract
  `HeroBanner` to complement `StudioRedirectBanner`.

## 9. Large Files Needing Refactor

| File | Lines | Notes |
| --- | --- | --- |
| `src/routes/create.tsx` | 804 | Break into `SubjectCard`, `GenerationPipeline`, `ScriptEditor`, `KeywordManager`, `StickyRail` sub-files |
| `src/routes/video-settings.tsx` | 711 | Split source / transitions / encoder sections |
| `src/routes/basic-settings.tsx` | 627 | Split provider grid + model browser |
| `src/routes/audio-studio.tsx` | 600 | Split TTS + voice library + BGM |
| `src/routes/subtitle-studio.tsx` | 571 | Split typography / animation / brand kit |
| `src/components/app-shell.tsx` | 572 | Split Sidebar + TopBar + primitives into siblings |
| `src/components/subtitle-templates.tsx` | 562 | Move template data to JSON, keep renderer |

Total documented LoC across pages + components: **~9,000 lines**.
