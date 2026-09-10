# API Mapping — Page ↔ Endpoint ↔ Model ↔ Component ↔ Store ↔ UI

> Every row reads:
>
> **Page → Method + Endpoint → Request model → Response model → Status codes → Frontend component → Store action → UI update**
>
> All endpoints are prefixed `/api/v1` unless noted (`/ws`, `/healthz`,
> `/tasks/…` static). All bodies are `application/json` unless noted.

---

## 1. Dashboard — `src/routes/index.tsx`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /projects?limit=12` | — | `{ items: Project[], total }` | 200, 500 | `RecentProjectsPanel` | `setRecentProjects` (derived) | grid renders cards; skeleton replaced |
| `GET /outputs?limit=8` | — | `{ items: Output[], total }` | 200, 500 | `RecentOutputsPanel` | derived | gallery thumbs |
| `GET /tasks?status=active` | — | `RenderTask[]` | 200 | `RenderPipeline` (live tracker) | `UPDATE_RENDER` per row | progress bar animates |
| `GET /system/status` | — | `{ cpu, ram, gpu, queueDepth, version }` | 200, 503 | `SystemStatusStrip` | local | stat tiles update |
| `WS /ws/tasks` | — | event `{ stageId, status, progress, taskId }` | — | same | `UPDATE_RENDER` | live tick |

## 2. Basic Settings — `/basic-settings`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /config` | — | `ConfigToml` (record) | 200 | `ProviderGrid`, `VideoSourceGrid` | hydrate local form | inputs prefilled |
| `PUT /config` | `Partial<ConfigToml>` | `{ saved_at }` | 200, 400, 422 | save bar | `MARK_SAVED` | `<SaveIndicator>` "Saved · 2s ago" |
| `POST /providers/{id}/test` | `{}` | `{ ok, latency_ms, message }` | 200, 401, 502 | `ProviderCard` | local | green/red pill, latency badge |
| `GET /providers/{id}/models` | `?refresh=` | `{ models: string[] }` | 200, 401 | `ModelBrowser` | local | dropdown populated |

## 3. Create / Script Studio — `/create`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `POST /scripts` | `{ video_subject, video_language, paragraph_number, video_script_tone, custom_system_prompt? }` | `{ video_script: string }` | 200, 400, 422, 502 | `ScriptGenerator` | `SET_SCRIPT` | editor populated, analytics tiles recompute |
| `POST /terms` | `{ video_subject, video_script, amount }` | `{ video_terms: string[] }` | 200, 422, 502 | `KeywordsManager` | `SET_KEYWORDS` | draggable tags rendered |
| `POST /search-videos` | `{ search_terms: string[], video_aspect: '9:16' \| '16:9', minimum_duration: number }` | `{ videos: Array<{ url, preview, duration, size, source }> }` | 200, 502 | `PexelsPreview` | local | thumbs grid |

## 4. Video Settings — `/video-settings`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /system/encoders` | — | `{ nvenc, hevc_nvenc, av1, cpu }` | 200 | `EncoderSelector` | local | unavailable encoders disabled |
| `POST /search-videos` | (same as 3) | (same as 3) | 200, 502 | Smart Matching preview | local | matched clip cards |
| *(no save endpoint — settings ship with `POST /tasks`)* | — | — | — | save bar | `PATCH_VIDEO` | dirty badge |

## 5. Audio Studio — `/audio-studio`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /voices?provider=&lang=` | — | `Voice[]` | 200 | `VoiceLibrary` | local list | filtered grid |
| `POST /voice/preview` | `{ provider, voice, text }` | `audio/mpeg` (binary) | 200, 400, 502 | `VoicePlayer` | local cache | waveform + play |
| `GET /bgm` | — | `BGMTrack[]` | 200 | `BGMBrowser` | local | track list |
| `POST /upload` (multipart) | `file` | `{ asset_id, url, durationSec }` | 200, 413, 415 | `BGMUpload` | `PATCH_AUDIO { bgmTrackId }` | toast "Uploaded" |

## 6. Subtitle Studio — `/subtitle-studio`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /fonts` | — | `{ family, weights, url }[]` | 200 | `FontBrowser` | local | font cards |
| `GET /subtitle/templates` | — | `SubtitleTemplate[]` | 200 | `TemplateGallery` | local | 100+ cards |
| *(settings POST'd with `/tasks`)* | — | — | — | save bar | `PATCH_SUBTITLE` | dirty badge |

## 7. Render Studio — `/render`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `POST /tasks` | **`TaskRequest`** (see §13) | `{ task_id, status: 'queued' }` | 202, 400, 409, 422 | "Render" CTA | `ENQUEUE_RENDER` | route push to `/render?id=…` |
| `GET /tasks/{id}` | — | `RenderTask` + `{ stages: PipelineStageState[], output? }` | 200, 404 | `RenderStudio` | `UPDATE_RENDER` | hydrate on mount/refresh |
| `WS /ws/tasks/{id}` | — | event (§14) | — | `RenderPipeline` | `UPDATE_RENDER`, on completion `PUSH_NOTIFICATION` | stage rows flip; ETA ticks |
| `POST /tasks/{id}/cancel` | — | `{ status: 'canceled' }` | 200, 404, 409 | cancel button | `UPDATE_RENDER` | stage frozen, banner shown |

## 8. Queue — `/queue`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /tasks?status=&page=` | — | `{ items: RenderTask[], total }` | 200 | `QueueTable` | hydrate `renderQueue` | rows render |
| `WS /ws/tasks` | — | event (§14) | — | same | `UPDATE_RENDER` | per-row progress |
| `POST /tasks/{id}/cancel` | — | `{ status }` | 200 | row action | `UPDATE_RENDER` | toast |
| `POST /tasks/{id}/retry` | — | `{ task_id }` | 202 | row action | `ENQUEUE_RENDER` | toast + new row |
| `DELETE /tasks/{id}` | — | `204` | 204 | row action | local filter | row removed + toast |

## 9. Outputs — `/outputs`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /outputs?search=&sort=` | — | `{ items: Output[], total }` | 200 | `OutputsGrid` | hydrate `recentOutputs` | cards |
| `GET /outputs/{id}` | — | `Output & { tags, log_excerpt }` | 200 | `OutputDrawer` | local | drawer populated |
| `GET /tasks/{task_id}/{file}.mp4` (static) | — | `video/mp4` | 200, 206, 404 | `VideoPlayer` | — | playback |
| `PATCH /outputs/{id}` | `{ name }` | `Output` | 200, 422 | rename inline | local | new label, toast |
| `DELETE /outputs/{id}` | — | `204` | 204 | delete action | local filter | card removed, toast |

## 10. Projects — `/projects`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /projects` | `?search=&tag=&sort=` | `{ items: Project[], total }` | 200 | `ProjectsGrid` | local | grid/list |
| `GET /projects/{id}` | — | **`ProjectFull`** (§13) | 200, 404 | open action | `SET_PROJECT`, `SET_SCRIPT`, `SET_KEYWORDS`, `PATCH_VIDEO`, `PATCH_AUDIO`, `PATCH_SUBTITLE` | studios hydrate |
| `POST /projects` | `ProjectFull` | `Project` | 201, 422 | save | `SET_PROJECT`, `MARK_SAVED` | toast + redirect |
| `PUT /projects/{id}` | `ProjectFull` | `Project` | 200, 404, 422 | autosave | `MARK_SAVING/SAVED` | save indicator |
| `DELETE /projects/{id}` | — | `204` | 204 | delete | local | toast |
| `POST /projects/{id}/duplicate` | — | `Project` | 201 | duplicate | local | new card |
| `GET /projects/{id}/export` | — | `application/zip` | 200 | export | — | file download |
| `POST /projects/import` (multipart) | `file` | `Project` | 201, 415, 422 | import | local | new card + toast |

## 11. API Manager — `/api-manager`

| Method · Endpoint | Request | Response | Codes | Component | Store action | UI update |
|---|---|---|---|---|---|---|
| `GET /providers` | — | `{ providers: Array<{ id, label, status: ProviderStatus, keys: APIKey[] }> }` | 200 | `ProvidersTable` | local | provider rows |
| `POST /providers/{id}/keys` | `{ label, key, note? }` | `APIKey` | 201, 401, 422 | add key | local | new chip |
| `DELETE /providers/{id}/keys/{keyId}` | — | `204` | 204 | revoke | local | chip removed |
| `POST /providers/{id}/test` | — | `{ ok, latency_ms }` | 200, 401, 502 | test btn | local | latency pill |

## 12. Settings · Logs · Developer · Languages · Notifications

| Page | Method · Endpoint | Notes |
|---|---|---|
| `/settings` | `GET/PUT /config`, `GET /system/status` | same envelope as Basic Settings |
| `/logs` | `GET /logs?level=&since=&tail=` → `LogLine[]` | `WS /ws/logs` for tail |
| `/developer` | `GET /tasks/{id}/log`, raw `GET /tasks/{id}` JSON | inspector |
| `/languages` | `GET /i18n/locales` | read-only |
| `/notifications` | none (client-only mirror of `state.notifications`) | — |

## 13. Canonical request/response shapes

### `TaskRequest` (`POST /tasks`)
Mirrors MPT `VideoParams`. Frontend serializes from store slices:

```jsonc
{
  "video_subject":          "currentProject.subject",
  "video_script":           "currentScript.text",
  "video_terms":            "currentKeywords[].text",
  "video_aspect":           "videoSettings.aspectRatio",
  "video_concat_mode":      "videoSettings.concatMode",
  "video_transition_mode":  "videoSettings.transition",
  "video_clip_duration":    "videoSettings.maxClipDurationSec",
  "video_count":            "videoSettings.clipCount",
  "video_source":           "videoSettings.source",
  "video_language":         "currentScript.language",
  "voice_name":             "selectedVoice.id",
  "voice_volume":           "audioSettings.volume",
  "voice_rate":             "audioSettings.speed",
  "bgm_type":               "audioSettings.bgmMode",
  "bgm_file":               "audioSettings.bgmTrackId",
  "bgm_volume":             "audioSettings.bgmVolume",
  "subtitle_enabled":       "subtitleSettings.enabled",
  "subtitle_position":      "subtitleSettings.position",
  "font_name":              "subtitleSettings.fontFamily",
  "text_fore_color":        "subtitleSettings.color",
  "font_size":              "subtitleSettings.fontSize",
  "stroke_color":           "subtitleSettings.strokeColor",
  "stroke_width":           "subtitleSettings.strokeWidth",
  "n_threads":              "settings.performance.threads",
  "paragraph_number":       "currentScript.paragraphs"
}
```

### `ProjectFull` (`GET /projects/{id}` and `POST/PUT /projects`)

```ts
{
  project: Project;
  script: Script | null;
  keywords: Keyword[];
  videoSettings: VideoSettings;
  audioSettings: AudioSettings;
  subtitleSettings: SubtitleSettings;
}
```

## 14. WebSocket event envelope

```ts
type WSEvent =
  | { kind: "stage";    taskId: ID; stageId: PipelineStageId; status: StageStatus; progress: number; message?: string; payload?: { currentScene?: string; currentClip?: string; currentFile?: string } }
  | { kind: "task";     taskId: ID; status: RenderStatus; progress: number; etaSec?: number; elapsedSec?: number }
  | { kind: "complete"; taskId: ID; output: Output }
  | { kind: "error";    taskId: ID; errorMessage: string };
```

Mapped to store actions:

| `kind` | Store action(s) | UI |
|---|---|---|
| `stage` | local `pipelineStages` patch | `RenderPipeline` row flips |
| `task` | `UPDATE_RENDER` | progress bar + ETA |
| `complete` | `UPDATE_RENDER {status:'completed'}` + push to `recentOutputs` + `PUSH_NOTIFICATION(level:'success')` | toast + dashboard refresh |
| `error` | `UPDATE_RENDER {status:'failed', errorMessage}` + `PUSH_NOTIFICATION(level:'error')` | red banner + toast |

## 15. Status codes — standard handling

| Code | UI behaviour |
|---|---|
| 200, 201, 202, 204 | success path |
| 400, 422 | inline field error from `detail.loc/msg`; toast "Please check…" |
| 401 | provider card flagged "invalid key"; for app-level (Phase D), redirect to `/login` |
| 404 | route-level `notFoundComponent` |
| 409 | "Already exists / already running" toast; suggest cancel-and-retry |
| 413, 415 | upload card: "File too large / type not allowed" |
| 429 | toast with retry-after countdown; for stock APIs, suggest fallback provider |
| 5xx | red banner + "Retry" button calling `router.invalidate()` |
