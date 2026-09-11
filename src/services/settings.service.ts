import { env } from "../api/env";
import { endpoints } from "../api/endpoints";
import { apiClient } from "../api/client";
import { del, get, post, put } from "../utils/request";
import { renderService } from "./render.service";
import type { ApiHealth } from "../types/api";
import type { ProviderResponse, TaskResponse } from "../types/responses";

function getPingUrl(): string {
  const base = env.apiBaseUrl;
  if (base.startsWith("http://") || base.startsWith("https://")) {
    try {
      const url = new URL(base);
      return `${url.origin}/ping`;
    } catch {
      return base.replace(/\/api\/v1\/?$/, "") + "/ping";
    }
  }
  return "/ping";
}

export interface TaskTelemetrySummary {
  total: number;
  succeeded: number;
  running: number;
  failed: number;
  tasks: TaskResponse[];
}

export const settingsService = {
  /**
   * Health check verified against real MPT backend GET /ping.
   * Note: MPT mounts /ping at server root (not /api/v1/ping).
   */
  health: async (signal?: AbortSignal): Promise<ApiHealth> => {
    const pingUrl = getPingUrl();
    const start = performance.now();
    try {
      const res = await apiClient.get<any>(pingUrl, { signal });
      const latencyMs = Math.round(performance.now() - start);
      const isPong = res.data === "pong" || (typeof res.data === "string" && res.data.includes("pong"));
      return {
        ok: res.status === 200 && isPong,
        version: "v1.3.6 (MPT Upstream)",
        latencyMs,
        message: typeof res.data === "string" ? res.data : "pong",
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: false,
        version: undefined,
        latencyMs,
        message: err?.message || "Connection failed",
      };
    }
  },

  /**
   * Task telemetry derived from real MPT GET /api/v1/tasks.
   */
  taskTelemetry: async (signal?: AbortSignal): Promise<TaskTelemetrySummary> => {
    const tasks = await renderService.list(signal);
    const total = tasks.length;
    const succeeded = tasks.filter((t) => t.status === "succeeded").length;
    const running = tasks.filter((t) => t.status === "running").length;
    const failed = tasks.filter((t) => t.status === "failed").length;
    return {
      total,
      succeeded,
      running,
      failed,
      tasks,
    };
  },

  /*
   * UNSUPPORTED BY MPT UPSTREAM:
   * The endpoints below do not exist in MoneyPrinterTurbo upstream v1.3.6.
   * Kept for contract compatibility, returning safe fallback data.
   */
  systemStatus: (signal?: AbortSignal) => get<Record<string, unknown>>(endpoints.systemStatus, { signal }),
  encoders: (signal?: AbortSignal) => get<ApiHealth["encoders"]>(endpoints.systemEncoders, { signal }),
  config: (signal?: AbortSignal) => get<Record<string, unknown>>(endpoints.config, { signal }),
  updateConfig: (body: Record<string, unknown>) => put<Record<string, unknown>>(endpoints.config, body),
  providers: (signal?: AbortSignal) => get<ProviderResponse[]>(endpoints.providers, { signal }),
  testProvider: (id: string) => post<{ ok: boolean; latencyMs?: number; error?: string }>(endpoints.providerTest(id)),
  providerModels: (id: string, signal?: AbortSignal) =>
    get<{ id: string; name: string }[]>(endpoints.providerModels(id), { signal }),
  saveProviderKey: (id: string, apiKey: string, baseUrl?: string) =>
    post<ProviderResponse>(endpoints.providerKey(id), { apiKey, baseUrl }),
  removeProviderKey: (id: string) => del<void>(endpoints.providerKey(id)),
};
