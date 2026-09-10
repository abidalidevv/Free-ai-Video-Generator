# Workflows

> Every user-visible workflow, each with happy path, alternative paths,
> failure handling, and the backend calls that drive it. Refer to
> `API_MAPPING.md` for exact request/response shapes and to `PIPELINE.md`
> for stage semantics.

---

## 1. Create-to-Render (happy path)

1. **Dashboard** → "New Video" → router pushes `/create`.
2. **`/create`** Subject card: user types subject + picks language/tone.
3. "Generate Script" → `POST /scripts` → editor populated, analytics tiles
   recompute. Status: `idle → loading → success`.
4. "Generate Keywords" (auto-fires post-script) → `POST /terms` → draggable
   keyword chips appear; Pexels preview pane calls `POST /search-videos`
   per chip change (debounced 600 ms).
5. Sidebar → `/video-settings`. User picks source/transitions/aspect/encoder.
   `GET /system/encoders` probes hardware once.
6. `/audio-studio`. Pick voice → `POST /voice/preview` for live audition.
   Optional: upload BGM via `POST /upload`.
7. `/subtitle-studio`. Pick template or tune typography.
8. "Render" CTA (sticky rail or footer of any studio).
   - Confirm dialog summarizes plan (duration, encoder, output size).
   - `POST /tasks` → `{ task_id }`.
9. Router pushes `/render?id={task_id}`. WebSocket opens.
10. Stages tick through 1→15. ETA badge counts down.
11. `complete` event → toast "Render ready", router offers "Open output".
12. `/outputs` highlights the new card. Download or rename.

State touched: `SET_PROJECT, SET_SCRIPT, SET_KEYWORDS, SET_VOICE,
PATCH_VIDEO/AUDIO/SUBTITLE, ENQUEUE_RENDER, UPDATE_RENDER, PUSH_NOTIFICATION`.

---

## 2. Alternative entry — Open existing project

1. Sidebar → `/projects` → card → "Open".
2. `GET /projects/{id}` returns `ProjectFull`.
3. Reducer dispatches: `SET_PROJECT`, `SET_SCRIPT`, `SET_KEYWORDS`,
   `PATCH_VIDEO`, `PATCH_AUDIO`, `PATCH_SUBTITLE`. `isDirty: false`.
4. Router pushes the studio the user was last in (default: `/create`).

## 3. Alternative entry — Duplicate / template start

- "Duplicate" → `POST /projects/{id}/duplicate` → opens copy in `/create`.
- "Use template" *(future)* → server returns a `ProjectFull` skeleton with
  empty `script.text`.

---

## 4. Cancel render

1. `/render` or `/queue` → "Cancel" → confirm dialog.
2. `POST /tasks/{id}/cancel`.
   - 200 → WS pushes `{ kind: "task", status: "canceled" }` →
     `UPDATE_RENDER` greys progress, banner with "Resume" / "Retry"
     depending on backend capability.
   - 409 ("already complete") → toast "Render already finished".
3. Notifications: `PUSH_NOTIFICATION(level:"warning", category:"render")`.

## 5. Resume render

Only available if the backend reports `resumable: true` on `GET /tasks/{id}`
(MPT 1.2+).

1. `/render` banner → "Resume from <last stage>".
2. `POST /tasks/{id}/retry` with `?from=last-stage`.
3. WS re-attaches; UI keeps completed stages green and resumes from the
   first non-completed.
4. On failure (or if MPT lacks resume), fall back to **Retry**.

## 6. Retry render

1. `/queue` row or `/render` failed state → "Retry".
2. `POST /tasks/{id}/retry` → `{ task_id: <new> }`.
3. New `ENQUEUE_RENDER` row; old failed row stays for history.
4. WS opens against the new task.

---

## 7. Import project

1. `/projects` → "Import" → file picker (`.zip`).
2. `POST /projects/import` (multipart).
   - 201 → `Project` returned, local list refetched, toast "Imported".
   - 415 → toast "Unsupported file"; 422 → "Project file invalid".
3. Optional auto-open after import (`SET_PROJECT` + route push).

## 8. Export project

1. `/projects` row → "Export" → `GET /projects/{id}/export` returns a
   `.zip` containing `project.json`, scripts, subtitle SRT, settings, and
   optionally the last rendered output if user opted in.
2. Browser downloads the file. No state change.

## 9. Export output (download MP4)

1. `/outputs` card → "Download" → opens static URL
   `GET /tasks/{task_id}/{file}.mp4`.
2. Range requests (206) are supported by the static server so the user can
   preview in `<VideoPlayer>` while it downloads.

---

## 10. Project save

### 10.1 Autosave (default)

```
mutation in any studio
  → reducer sets isDirty=true
  → SaveIndicator shows "Unsaved"
  → debounce 1500ms
  → MARK_SAVING(true)
  → PUT /projects/{id}
      → 200 → MARK_SAVED → "Saved · 0s ago"
      → 4xx → toast detail, keep isDirty
      → 5xx → exponential retry (3 attempts) → if still failing, toast "Could not save"
```

### 10.2 Explicit save

Cmd/Ctrl+S anywhere → same flow, but no debounce.

### 10.3 First-time save (no `id` yet)

- `POST /projects` → response `Project` → `SET_PROJECT` with new id →
  subsequent saves use `PUT`.

## 11. Project load

- Dashboard "Recent" card → router push `/create` with project id in state
  → `GET /projects/{id}` → hydrate all slices → studios render with values.
- Cold start with deep link: route loader (TanStack Query
  `ensureQueryData(projectQuery(id))`) → component reads via
  `useSuspenseQuery`. Skeletons show during load.

---

## 12. Notification flow

```
WS event (complete/error/warning)
  → handler in components/render/* or src/api/ws.ts
  → dispatch PUSH_NOTIFICATION(...)
  → AppShell TopBar bell shows unread count
  → toast (sonner) fires for success/error in real time
  → user opens bell panel → marks all read → MARK_NOTIFICATIONS_READ
  → /notifications route mirrors state.notifications
```

Categories surface different toasts/icons:

| Category | Icon | Toast tone | Action |
|---|---|---|---|
| render | film | success/error | "Open output" → `/outputs` |
| api | key | warning/error | "Fix" → `/api-manager` |
| system | server | info/warning | — |
| billing | wallet | info | "Manage" → `/billing` |
| update | refresh | info | "Release notes" → `/about` |

---

## 13. Settings change (provider key / model)

1. `/basic-settings` → edit `api_key` for provider X.
2. `PUT /config` with merge-patch.
   - 200 → `MARK_SAVED`, toast "Saved".
   - 400/422 → field-level error from `detail.loc`.
3. "Test" button → `POST /providers/{id}/test`.
   - 200 → green pill + latency badge.
   - 401 → red "Invalid key".
   - 5xx/timeout → amber "Unreachable".

## 14. Adding / rotating an API key

1. `/api-manager` → provider row → "Add key".
2. `POST /providers/{id}/keys { label, key, note? }` → returns `APIKey` with masked value.
3. UI never re-shows the raw key. Old key kept until user revokes via
   `DELETE …/keys/{keyId}`.

---

## 15. Voice preview

1. `/audio-studio` voice card hover/select → "Preview".
2. `POST /voice/preview { provider, voice, text }` returns audio blob.
3. Player decodes and starts; subsequent previews of the same voice+text
   replay from cache.

## 16. BGM upload

1. `/audio-studio` BGM section → "Upload custom" → file picker.
2. Client validates size ≤ 50 MB, type ∈ {mp3, wav, ogg, m4a}.
3. `POST /upload` (multipart) → `{ asset_id, url, durationSec }`.
4. `PATCH_AUDIO { bgmTrackId: asset_id, bgmMode: "custom" }`.

---

## 17. Failure handling matrix

| Failure | UI | Backend |
|---|---|---|
| Network down (any call) | Top-bar "Live" badge flips red; failed mutation rolled back from optimistic state; toast "Offline" | n/a |
| WS disconnect | Reconnect with backoff 1/2/5/15 s; banner "Reconnecting…"; if 4 retries fail → "Reconnect" CTA → manual | n/a |
| Render failed mid-stage | Stage row red; banner with `errorMessage`; "Retry" + "View log" CTAs | next request `POST /tasks/{id}/retry` |
| 401 on provider test | Red pill in provider card; "Update key" link → `/api-manager` | — |
| 429 stock provider | Toast "Pexels rate limited — falling back to Pixabay"; auto-flip `videoSettings.source` for the next call only | — |
| Upload too large | Inline error in upload zone | — |
| Save conflict (409) | Toast "Newer version exists — refresh"; offer "Reload from server" → `GET /projects/{id}` | — |

---

## 18. Keyboard shortcuts (workflow accelerators)

| Shortcut | Action |
|---|---|
| ⌘/Ctrl + K | Open Command Palette |
| ⌘/Ctrl + S | Save current project |
| ⌘/Ctrl + Enter | Submit render from any studio |
| Esc | Close drawer / dialog / palette |
| G then D / P / O / Q | Go to Dashboard / Projects / Outputs / Queue |

---

## 19. Empty / first-run state

- No projects → `/projects` shows `<EmptyState>` "Create your first video"
  → CTA to `/create`.
- No outputs → `/outputs` shows `<EmptyState>` "Renders will appear here".
- No API keys configured → `/basic-settings` flags providers as "Setup
  required" and Render CTAs are disabled with tooltip "Configure an LLM key
  first".

These checks read from the API slice (TanStack Query cache); render CTAs
are gated by `useCanRender()` helper introduced in Phase A.
