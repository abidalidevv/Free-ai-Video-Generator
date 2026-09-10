# State Management

> **Authoritative store**: `src/store/app-state.tsx` — single React Context
> built on `useReducer`. Types come from `src/types/index.ts`. The store is
> deliberately small and side-effect-free; backend integration adds a
> middleware/effect layer **around** it without changing the shape.

---

## 1. Global store shape

```ts
interface AppState {
  // Current working document
  currentProject: Project | null;
  currentScript: Script | null;
  currentKeywords: Keyword[];

  // Selections (studios)
  selectedVoice: Voice | null;
  selectedSubtitleTemplate: SubtitleTemplate | null;
  selectedSubtitleAnimation: SubtitleAnimation | null;
  selectedTransition: TransitionId;

  // Settings (per project)
  videoSettings: VideoSettings;
  audioSettings: AudioSettings;
  subtitleSettings: SubtitleSettings;

  // Lists
  recentProjects: Project[];
  recentOutputs: Output[];
  renderQueue: RenderTask[];
  notifications: Notification[];

  // User
  preferences: UserPreferences;

  // Save lifecycle
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}
```

## 2. Logical slices

The reducer is single-file today but logically partitioned. Backend
integration should keep these boundaries — they map 1:1 to controller files
in MPT and to the planned Zustand/RTK slices.

### 2.1 Project slice
- Fields: `currentProject`, `recentProjects`, `isDirty`, `isSaving`, `lastSavedAt`.
- Actions: `SET_PROJECT`, `MARK_DIRTY`, `MARK_SAVING`, `MARK_SAVED`.
- Owns hydration from `GET /projects/{id}` and serialization to `POST/PUT /projects`.
- `isDirty` flips `true` on any settings mutation; `MARK_SAVED` clears.

### 2.2 Script slice
- Fields: `currentScript`, `currentKeywords`.
- Actions: `SET_SCRIPT`, `SET_KEYWORDS`.
- Sourced from `POST /scripts` and `POST /terms`. Edits are local until
  next project save.

### 2.3 Video settings slice
- Field: `videoSettings`.
- Action: `PATCH_VIDEO` (shallow merge).
- Serialized into `TaskRequest` on render submit and into `ProjectFull` on save.

### 2.4 Audio slice
- Fields: `audioSettings`, `selectedVoice`.
- Actions: `PATCH_AUDIO`, `SET_VOICE`.

### 2.5 Subtitle slice
- Fields: `subtitleSettings`, `selectedSubtitleTemplate`, `selectedSubtitleAnimation`.
- Actions: `PATCH_SUBTITLE`, `SET_TEMPLATE`, `SET_ANIMATION`, `SET_TRANSITION`.

### 2.6 Render slice
- Field: `renderQueue`.
- Actions: `ENQUEUE_RENDER`, `UPDATE_RENDER`.
- Hydrated from `GET /tasks` on `/queue` mount; live updates via WS.

### 2.7 Queue slice
Logical subset of Render — same array, filtered by status. No separate
storage to keep the WS event handler single-target.

### 2.8 Notification slice
- Field: `notifications` (capped at 100).
- Actions: `PUSH_NOTIFICATION`, `MARK_NOTIFICATIONS_READ`.
- Sources: WS `complete`/`error` events, settings save, upload completions.

### 2.9 Settings / preferences slice
- Field: `preferences` (theme, language, autosave, reduceMotion, etc.).
- Actions: `SET_THEME`, `PATCH_PREFS`.
- Local-only (no backend mirror for UI prefs); rendering defaults overlap
  with backend `config.toml` and are handled by the **API slice**.

### 2.10 Voice slice
Logical subset of Audio — kept as `selectedVoice` plus an ephemeral
component-level `voices: Voice[]` list (no need to globalize the catalog).

### 2.11 Subtitle library slice
Templates, fonts, animations are fetched per-mount and cached by TanStack
Query (Phase A). Selection lives in the Subtitle slice.

### 2.12 API slice (backend config)
Not yet in the reducer. Phase A adds:
```ts
interface APIState {
  config: ConfigToml | null;          // GET /config
  providers: ProviderStatus[];        // GET /providers
  encoders: EncoderCapabilities;      // GET /system/encoders
}
```
Owned by TanStack Query (`queryKey: ['config']`, `['providers']`,
`['encoders']`) rather than the reducer, because the Query cache already
gives us SWR + invalidation.

---

## 3. Persistence

| What | Where | When | How |
|---|---|---|---|
| Current project | Backend `POST/PUT /projects` | Autosave (debounce 1 500 ms after `isDirty`) and on render submit | `TanStack mutation` → `MARK_SAVED` |
| Preferences | `localStorage` key `vf.preferences` | On every `PATCH_PREFS` | `useEffect` listener on `state.preferences` |
| Theme | `localStorage` key `vf.theme` + `<html data-theme>` | On `SET_THEME` | sync writer |
| Brand kit (subtitle) | `localStorage` key `vf.brandKits` (Phase A); backend `POST /brand-kits` (Phase C) | On save action | manual |
| Notifications | in-memory only | — | cleared on reload |
| Render queue | derived from `GET /tasks` | on `/queue`/`/render` mount + WS | no local persistence |
| API keys | backend `config.toml` only | on save in `/basic-settings`, `/api-manager` | UI never stores raw key |

### 3.1 Autosave policy

```
state.isDirty → debounce 1500ms → PUT /projects/{id} → MARK_SAVED
                                  ↘ on failure → keep isDirty, toast warning
```

Indicator: `<SaveIndicator>` in the top bar reads `isSaving`, `isDirty`,
`lastSavedAt` and renders "Saving…", "Unsaved", or "Saved · 12s ago".

### 3.2 Future synchronization

Two scenarios anticipated:

1. **Multi-tab single user** — when the same project is open in two tabs.
   Solution (Phase C): `BroadcastChannel('vf-project-<id>')` carrying the
   action; replicate via `dispatch` on receivers. The reducer is pure, so
   replaying is safe.
2. **Multi-device / cloud sync** — out of scope for MPT. If Lovable Cloud is
   enabled (Phase D), `PUT /projects/{id}` already provides the
   authoritative copy; conflict resolution = last-write-wins keyed by
   `updatedAt`.

WS reconnection: backoff 1s → 2s → 5s → 15s, then "Reconnect" CTA.

---

## 4. Action catalogue (current)

```ts
type Action =
  | { type: "SET_PROJECT";              payload: Project | null }
  | { type: "SET_SCRIPT";               payload: Script | null }
  | { type: "SET_KEYWORDS";             payload: Keyword[] }
  | { type: "SET_VOICE";                payload: Voice | null }
  | { type: "SET_TEMPLATE";             payload: SubtitleTemplate | null }
  | { type: "SET_ANIMATION";            payload: SubtitleAnimation | null }
  | { type: "SET_TRANSITION";           payload: TransitionId }
  | { type: "PATCH_VIDEO";              payload: Partial<VideoSettings> }
  | { type: "PATCH_AUDIO";              payload: Partial<AudioSettings> }
  | { type: "PATCH_SUBTITLE";           payload: Partial<SubtitleSettings> }
  | { type: "SET_THEME";                payload: ThemeMode }
  | { type: "PATCH_PREFS";              payload: Partial<UserPreferences> }
  | { type: "PUSH_NOTIFICATION";        payload: Notification }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "ENQUEUE_RENDER";           payload: RenderTask }
  | { type: "UPDATE_RENDER";            payload: { id: string; patch: Partial<RenderTask> } }
  | { type: "MARK_DIRTY" }
  | { type: "MARK_SAVING";              payload: boolean }
  | { type: "MARK_SAVED" };
```

Every dirty-making action sets `isDirty: true`. Saving/render-submit reset
it through `MARK_SAVED`.

---

## 5. Suggested integration layout (no code change required today)

```
src/store/
  app-state.tsx          ← reducer (current)
  slices/                ← optional split when Zustand or RTK is adopted
    project.ts
    script.ts
    video.ts
    audio.ts
    subtitle.ts
    render.ts
    notification.ts
    settings.ts
    api.ts
src/api/
  client.ts              ← axios/fetch wrapper, base URL from env
  endpoints.ts           ← typed endpoint constants
  queries/               ← TanStack Query factories (one per slice)
  mutations/
  ws.ts                  ← WebSocket subject + reconnect
```

The reducer keeps its current public surface; queries/mutations dispatch
actions on success.
