/**
 * Typed WebSocket events emitted by MoneyPrinterTurbo over /ws/*.
 * The discriminator is `type`. Consumers should switch exhaustively.
 */

import type { RenderStage, TaskStatus } from "./api";

export interface WsTaskProgressEvent {
  type: "task.progress";
  taskId: string;
  stage: RenderStage;
  progress: number; // 0..1
  message?: string;
}

export interface WsTaskStatusEvent {
  type: "task.status";
  taskId: string;
  status: TaskStatus;
  message?: string;
}

export interface WsTaskCompleteEvent {
  type: "task.complete";
  taskId: string;
  outputId: string;
  url: string;
}

export interface WsTaskErrorEvent {
  type: "task.error";
  taskId: string;
  error: string;
  stage?: RenderStage;
}

export interface WsLogEvent {
  type: "log";
  ts: string;
  level: "debug" | "info" | "warn" | "error";
  source: string;
  message: string;
  taskId?: string;
}

export interface WsQueueEvent {
  type: "queue.update";
  size: number;
  active?: string;
}

export interface WsNotificationEvent {
  type: "notification";
  id: string;
  level: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
}

export interface WsHeartbeatEvent {
  type: "ping" | "pong";
  ts: number;
}

export type WsEvent =
  | WsTaskProgressEvent
  | WsTaskStatusEvent
  | WsTaskCompleteEvent
  | WsTaskErrorEvent
  | WsLogEvent
  | WsQueueEvent
  | WsNotificationEvent
  | WsHeartbeatEvent;

export type WsEventType = WsEvent["type"];
