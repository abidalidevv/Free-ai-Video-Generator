/**
 * Request payload interfaces for MoneyPrinterTurbo controllers.
 * No business logic — shape only.
 */

export interface GenerateScriptRequest {
  subject: string;
  language?: string;
  paragraphs?: number;
  tone?: string;
  model?: string;
  provider?: string;
}

export interface GenerateTermsRequest {
  script: string;
  amount?: number;
  language?: string;
  provider?: string;
}

export interface SearchVideosRequest {
  terms: string[];
  source?: "pexels" | "pixabay" | "coverr" | "mixkit" | string;
  minDurationSec?: number;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  perTerm?: number;
}

export interface VoicePreviewRequest {
  voice: string;
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface TaskRequest {
  videoSubject?: string;
  videoScript?: string;
  videoTerms?: string[];
  videoAspect?: "9:16" | "16:9" | "1:1";
  videoClipDurationSec?: number;
  videoSource?: string;
  voiceName?: string;
  voiceVolume?: number;
  voiceRate?: number;
  bgmType?: "none" | "random" | "custom";
  bgmFile?: string;
  bgmVolume?: number;
  subtitleEnabled?: boolean;
  subtitleStyle?: Record<string, unknown>;
  fontName?: string;
  textForeColor?: string;
  textBackgroundColor?: string;
  fontSize?: number;
  strokeColor?: string;
  strokeWidth?: number;
  encoder?: "nvenc" | "qsv" | "amf" | "cpu";
  outputFormat?: "mp4" | "mov" | "webm";
  /** Idempotency key — required on retry. */
  idempotencyKey?: string;
}

export interface ProjectUpsertRequest {
  id?: string;
  name: string;
  payload: Record<string, unknown>;
}

export interface UploadRequest {
  kind: "video" | "audio" | "image" | "subtitle" | "project";
  filename: string;
  mime: string;
  size: number;
}
