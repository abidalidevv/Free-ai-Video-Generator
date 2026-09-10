import { endpoints } from "../api/endpoints";
import { del, get, post, put } from "../utils/request";
import type { ApiHealth } from "../types/api";
import type { ProviderResponse } from "../types/responses";

export const settingsService = {
  health: (signal?: AbortSignal) => get<ApiHealth>(endpoints.health, { signal }),
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
