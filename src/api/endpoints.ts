/**
 * Centralized REST + WebSocket endpoint catalogue.
 *
 * Every path mirrors a controller that exists (or is planned in a thin
 * wrapper) in the MoneyPrinterTurbo FastAPI backend. Do NOT call MPT
 * routes directly from components — go through `services/*` which read
 * from this file.
 */

export const endpoints = {
  // ── System / health ────────────────────────────────────────
  health: "/healthz",
  systemStatus: "/system/status",
  systemEncoders: "/system/encoders",

  // ── Config / providers / keys ─────────────────────────────
  config: "/config",
  providers: "/providers",
  providerById: (id: string) => `/providers/${id}`,
  providerTest: (id: string) => `/providers/${id}/test`,
  providerModels: (id: string) => `/providers/${id}/models`,
  providerKey: (id: string) => `/providers/${id}/keys`,

  // ── LLM / scripts / keywords ──────────────────────────────
  generateScript: "/scripts",
  generateTerms: "/terms",

  // ── Stock media search ────────────────────────────────────
  searchVideos: "/search-videos",
  searchImages: "/search-images",

  // ── Voice / TTS ───────────────────────────────────────────
  voices: "/voices",
  voicePreview: "/voice/preview",

  // ── Subtitles / fonts / bgm ───────────────────────────────
  fonts: "/fonts",
  bgm: "/bgm",
  subtitleTemplates: "/subtitle/templates",

  // ── Tasks (render pipeline) ───────────────────────────────
  tasks: "/tasks",
  taskById: (id: string) => `/tasks/${id}`,
  taskCancel: (id: string) => `/tasks/${id}/cancel`,
  taskRetry: (id: string) => `/tasks/${id}/retry`,

  // ── Outputs ───────────────────────────────────────────────
  outputs: "/outputs",
  outputById: (id: string) => `/outputs/${id}`,

  // ── Projects ──────────────────────────────────────────────
  projects: "/projects",
  projectById: (id: string) => `/projects/${id}`,
  projectDuplicate: (id: string) => `/projects/${id}/duplicate`,
  projectExport: (id: string) => `/projects/${id}/export`,
  projectImport: "/projects/import",

  // ── Uploads ───────────────────────────────────────────────
  upload: "/upload",

  // ── Logs ──────────────────────────────────────────────────
  logs: "/logs",
} as const;

export const wsEndpoints = {
  task: (id: string) => `/tasks/${id}`,
  logs: "/logs",
  notifications: "/notifications",
} as const;
