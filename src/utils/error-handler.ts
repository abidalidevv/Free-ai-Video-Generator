import type { AxiosError } from "axios";

export type NormalizedErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "timeout"
  | "server"
  | "network"
  | "cancelled"
  | "unknown";

export interface NormalizedError {
  kind: NormalizedErrorKind;
  status?: number;
  message: string;
  details?: unknown;
  /** Original error preserved for logging. Never render to user. */
  cause?: unknown;
}

export function normalizeError(err: unknown): NormalizedError {
  // Axios error
  const ax = err as AxiosError<{ message?: string; detail?: string; errors?: unknown }>;
  if (ax && ax.isAxiosError) {
    if (ax.code === "ERR_CANCELED") {
      return { kind: "cancelled", message: "Request cancelled", cause: err };
    }
    if (ax.code === "ECONNABORTED") {
      return { kind: "timeout", message: "Request timed out", cause: err };
    }
    if (!ax.response) {
      return { kind: "network", message: "Network error — backend unreachable", cause: err };
    }
    const status = ax.response.status;
    const payload = ax.response.data ?? {};
    const message = payload.message ?? payload.detail ?? ax.message ?? "Request failed";
    const kind = kindFromStatus(status);
    return { kind, status, message, details: payload.errors ?? payload, cause: err };
  }

  if (err instanceof Error) {
    return { kind: "unknown", message: err.message, cause: err };
  }
  return { kind: "unknown", message: "Unknown error", cause: err };
}

function kindFromStatus(status: number): NormalizedErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}

export function isNormalizedError(e: unknown): e is NormalizedError {
  return !!e && typeof e === "object" && "kind" in (e as Record<string, unknown>) && "message" in (e as Record<string, unknown>);
}
