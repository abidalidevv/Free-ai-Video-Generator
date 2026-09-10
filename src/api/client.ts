/**
 * Single axios instance shared by every service. Handles:
 *  - base URL + timeout from env
 *  - optional bearer / API key
 *  - exponential-backoff retries on 5xx / network errors
 *  - normalized error envelope (see utils/error-handler.ts)
 *  - upload/download progress passthrough
 *
 * Do NOT import `axios` directly anywhere else — always go through
 * `apiClient` so behavior stays consistent across the app.
 */

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { env } from "./env";
import { normalizeError } from "../utils/error-handler";
import { shouldRetry, backoffDelay } from "../utils/retry";

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.requestTimeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: auth + request id ──────────────────────
apiClient.interceptors.request.use((config) => {
  if (env.apiKey) {
    config.headers.set("Authorization", `Bearer ${env.apiKey}`);
  }
  // Correlation id for tracing — handy when the backend logs requests.
  config.headers.set("X-Request-Id", cryptoRandomId());
  return config;
});

// ── Response interceptor: retry + normalize errors ──────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (AxiosRequestConfig & { __retryCount?: number }) | undefined;
    if (config && shouldRetry(error)) {
      const next = (config.__retryCount ?? 0) + 1;
      config.__retryCount = next;
      if (next <= env.maxRetries) {
        await new Promise((r) => setTimeout(r, backoffDelay(next)));
        return apiClient.request(config);
      }
    }
    return Promise.reject(normalizeError(error));
  },
);

// ── Helpers ─────────────────────────────────────────────────────

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

/** Create a fresh AbortController-backed config for cancelable calls. */
export function withAbort(extra?: AxiosRequestConfig): {
  config: AxiosRequestConfig;
  controller: AbortController;
} {
  const controller = new AbortController();
  return { config: { ...extra, signal: controller.signal }, controller };
}
