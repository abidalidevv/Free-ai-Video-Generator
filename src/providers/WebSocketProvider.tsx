/**
 * App-wide WebSocket provider. Phase 8A only exposes the manager
 * factory and registration API — it does NOT auto-connect anywhere
 * so the current UI stays untouched. Phase 8B will mount a global
 * task subscription here.
 */

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import { buildWsUrl, createWebSocket, type WebSocketManager } from "../api/ws";

interface WebSocketContextValue {
  /** Get-or-create a manager for the given absolute WS URL. */
  acquire: (url: string) => WebSocketManager;
  /** Close + remove a manager. */
  release: (url: string) => void;
  /** Resolve a relative path (e.g. `/tasks/abc`) against the env base. */
  buildUrl: (path: string) => string;
}

const WsContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const pool = useRef(new Map<string, WebSocketManager>());

  const acquire = useCallback((url: string) => {
    let m = pool.current.get(url);
    if (!m) {
      m = createWebSocket({ url });
      pool.current.set(url, m);
    }
    return m;
  }, []);

  const release = useCallback((url: string) => {
    const m = pool.current.get(url);
    if (m) {
      m.close();
      pool.current.delete(url);
    }
  }, []);

  const value = useMemo<WebSocketContextValue>(
    () => ({ acquire, release, buildUrl: buildWsUrl }),
    [acquire, release],
  );

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWebSocketManager() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWebSocketManager must be used inside <WebSocketProvider>");
  return ctx;
}
