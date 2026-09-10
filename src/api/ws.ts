/**
 * Reusable WebSocket manager with auto-reconnect + heartbeat.
 *
 * Usage:
 *   const sock = createWebSocket(buildWsUrl(wsEndpoints.task(id)));
 *   sock.on("task.progress", (e) => { ... });
 *   sock.connect();
 *   // later
 *   sock.close();
 *
 * Do NOT hardcode URLs — always go through `buildWsUrl(path)` so the
 * env-configured base is respected.
 */

import { env } from "./env";
import type { WsEvent, WsEventType } from "../types/events";

export type WsListener<E extends WsEvent = WsEvent> = (event: E) => void;

export interface WebSocketManager {
  connect: () => void;
  close: () => void;
  send: (data: unknown) => void;
  on: <T extends WsEventType>(
    type: T,
    listener: WsListener<Extract<WsEvent, { type: T }>>,
  ) => () => void;
  onAny: (listener: WsListener) => () => void;
  readyState: () => number;
}

export interface WebSocketOptions {
  url: string;
  /** Initial reconnect delay (ms); doubles up to maxReconnectDelayMs. */
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  /** Ping interval (ms); 0 disables. */
  heartbeatMs?: number;
  /** Maximum reconnect attempts; 0 = unlimited. */
  maxReconnects?: number;
}

export function buildWsUrl(path: string): string {
  const base = env.wsBaseUrl || env.apiBaseUrl.replace(/^http/, "ws").replace(/\/api\/v1\/?$/, "/ws");
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createWebSocket(urlOrOpts: string | WebSocketOptions): WebSocketManager {
  const opts: Required<WebSocketOptions> = {
    url: typeof urlOrOpts === "string" ? urlOrOpts : urlOrOpts.url,
    reconnectDelayMs: 1_000,
    maxReconnectDelayMs: 15_000,
    heartbeatMs: 20_000,
    maxReconnects: 0,
    ...(typeof urlOrOpts === "string" ? {} : urlOrOpts),
  };

  let socket: WebSocket | null = null;
  let closedByCaller = false;
  let attempt = 0;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const typedListeners = new Map<WsEventType, Set<WsListener>>();
  const anyListeners = new Set<WsListener>();

  function dispatch(event: WsEvent) {
    for (const l of anyListeners) l(event);
    const set = typedListeners.get(event.type);
    if (set) for (const l of set) l(event);
  }

  function clearTimers() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    heartbeatTimer = null;
    reconnectTimer = null;
  }

  function scheduleReconnect() {
    if (closedByCaller) return;
    if (opts.maxReconnects > 0 && attempt >= opts.maxReconnects) return;
    const delay = Math.min(opts.maxReconnectDelayMs, opts.reconnectDelayMs * 2 ** attempt);
    attempt += 1;
    reconnectTimer = setTimeout(connect, delay);
  }

  function connect() {
    if (typeof window === "undefined") return; // SSR no-op
    closedByCaller = false;
    try {
      socket = new WebSocket(opts.url);
    } catch {
      scheduleReconnect();
      return;
    }

    socket.addEventListener("open", () => {
      attempt = 0;
      if (opts.heartbeatMs > 0) {
        heartbeatTimer = setInterval(() => {
          try {
            socket?.send(JSON.stringify({ type: "ping", ts: Date.now() }));
          } catch {
            /* ignore */
          }
        }, opts.heartbeatMs);
      }
    });

    socket.addEventListener("message", (evt) => {
      try {
        const parsed = JSON.parse(evt.data) as WsEvent;
        if (parsed && typeof parsed === "object" && "type" in parsed) {
          dispatch(parsed);
        }
      } catch {
        /* ignore non-JSON frames */
      }
    });

    socket.addEventListener("close", () => {
      clearTimers();
      if (!closedByCaller) scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      // The close handler will run next; nothing to do here.
    });
  }

  return {
    connect,
    close: () => {
      closedByCaller = true;
      clearTimers();
      socket?.close();
      socket = null;
    },
    send: (data) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(typeof data === "string" ? data : JSON.stringify(data));
      }
    },
    on: (type, listener) => {
      const set = typedListeners.get(type) ?? new Set();
      set.add(listener as WsListener);
      typedListeners.set(type, set);
      return () => set.delete(listener as WsListener);
    },
    onAny: (listener) => {
      anyListeners.add(listener);
      return () => anyListeners.delete(listener);
    },
    readyState: () => socket?.readyState ?? WebSocket.CLOSED,
  };
}
