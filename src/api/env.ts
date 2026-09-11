/**
 * Typed access to Vite environment variables used by the integration
 * layer. Centralized so that the rest of the app never reaches into
 * `import.meta.env` directly.
 */

const raw = import.meta.env;

function str(key: string, fallback = ""): string {
  const v = (raw as Record<string, string | undefined>)[key];
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function num(key: string, fallback: number): number {
  const v = (raw as Record<string, string | undefined>)[key];
  const parsed = v ? Number(v) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(key: string, fallback: boolean): boolean {
  const v = (raw as Record<string, string | undefined>)[key];
  if (v == null) return fallback;
  return v === "true" || v === "1" || v === "yes";
}

export const env = {
  apiBaseUrl: str("VITE_API_BASE_URL", "/api/v1"),
  wsBaseUrl: str("VITE_WS_BASE_URL", ""),
  apiKey: str("VITE_API_KEY", ""),
  requestTimeout: num("VITE_REQUEST_TIMEOUT", 30_000),
  uploadLimit: num("VITE_UPLOAD_LIMIT", 512 * 1024 * 1024),
  maxRetries: num("VITE_API_MAX_RETRIES", 2),
  environment: str("VITE_ENVIRONMENT", "development"),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export const featureFlags = {
  render: bool("VITE_FEATURE_RENDER", true),
  voiceCloning: bool("VITE_FEATURE_VOICE_CLONING", false),
  aiImages: bool("VITE_FEATURE_AI_IMAGES", false),
  crossPosting: bool("VITE_FEATURE_CROSS_POSTING", false),
  cloudRendering: bool("VITE_FEATURE_CLOUD_RENDERING", false),
  captions: bool("VITE_FEATURE_CAPTIONS", true),
  templates: bool("VITE_FEATURE_TEMPLATES", true),
  analytics: bool("VITE_FEATURE_ANALYTICS", false),
  saas: bool("VITE_FEATURE_SAAS", false),
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
