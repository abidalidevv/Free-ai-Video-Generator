/**
 * Response interfaces returned by MoneyPrinterTurbo. Mirror MPT Pydantic
 * models; keep optional fields optional.
 */

import type { TaskStatus, RenderStage } from "./api";

export interface ScriptResponse {
  script: string;
  language?: string;
  wordCount?: number;
  estimatedDurationSec?: number;
}

export interface TermsResponse {
  terms: string[];
}

export interface VideoSearchHit {
  id: string;
  source: string;
  url: string;
  previewUrl?: string;
  thumbnail?: string;
  durationSec?: number;
  width?: number;
  height?: number;
}

export interface VoiceResponse {
  id: string;
  name: string;
  language: string;
  gender?: "male" | "female" | "neutral";
  provider: string;
  sampleUrl?: string;
}

export interface SubtitleTemplateResponse {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  payload: Record<string, unknown>;
}

export interface FontResponse {
  family: string;
  url?: string;
}

export interface BgmResponse {
  id: string;
  name: string;
  url: string;
  durationSec?: number;
}

export interface TaskResponse {
  id: string;
  status: TaskStatus;
  stage: RenderStage;
  progress: number; // 0..1
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  request?: Record<string, unknown>;
  output?: OutputResponse;
}

export interface OutputResponse {
  id: string;
  taskId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  durationSec: number;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface ProviderResponse {
  id: string;
  name: string;
  enabled: boolean;
  hasKey: boolean;
  health?: "ok" | "degraded" | "down" | "unknown";
  latencyMs?: number;
  quotaRemaining?: number | string;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
}

export interface LogEntryResponse {
  ts: string;
  level: "debug" | "info" | "warn" | "error";
  source: string;
  message: string;
  taskId?: string;
}
