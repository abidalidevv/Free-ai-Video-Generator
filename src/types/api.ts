/**
 * API-layer types shared by every service.
 * These are intentionally minimal — keep domain shapes in `responses.ts`
 * and request payloads in `requests.ts`.
 */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export type TaskStatus =
  | "queued"
  | "preparing"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type RenderStage =
  | "init"
  | "script"
  | "keywords"
  | "search"
  | "download"
  | "voice"
  | "subtitles"
  | "concat"
  | "transitions"
  | "music"
  | "encode"
  | "thumbnail"
  | "upload"
  | "finalize"
  | "done";

export interface ApiHealth {
  ok: boolean;
  version?: string;
  uptimeSec?: number;
  encoders?: { nvenc: boolean; qsv: boolean; amf: boolean; cpu: boolean };
}
