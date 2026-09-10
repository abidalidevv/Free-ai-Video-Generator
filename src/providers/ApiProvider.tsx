/**
 * Wires the integration layer at the React root.
 *
 * Phase 8A: provides a per-app QueryClient + env + feature flags context.
 * Phase 8B will flip queries on by passing `enabled: true` defaults here
 * and by wrapping mutations with toast feedback.
 *
 * The current AppShell mounts this safely without touching layout — it's
 * a pure context provider with no rendered DOM.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { env, featureFlags, isFeatureEnabled, type FeatureFlag } from "../api/env";

interface ApiContextValue {
  env: typeof env;
  flags: typeof featureFlags;
  isFeatureEnabled: (flag: FeatureFlag) => boolean;
}

const ApiContext = createContext<ApiContextValue | null>(null);

interface ApiProviderProps {
  children: ReactNode;
  /** Allow tests to inject a shared client. */
  queryClient?: QueryClient;
}

export function ApiProvider({ children, queryClient }: ApiProviderProps) {
  const client = useMemo(
    () =>
      queryClient ??
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount) => failureCount < env.maxRetries,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
    [queryClient],
  );

  const value = useMemo<ApiContextValue>(
    () => ({ env, flags: featureFlags, isFeatureEnabled }),
    [],
  );

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside <ApiProvider>");
  return ctx;
}

export function useFeatureFlag(flag: FeatureFlag) {
  return isFeatureEnabled(flag);
}
