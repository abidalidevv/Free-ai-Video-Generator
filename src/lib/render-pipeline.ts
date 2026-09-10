// ============================================================================
// VideoForge AI — Render Pipeline (MoneyPrinterTurbo task.py stage mapping)
// Each pipeline stage maps 1:1 to a stage in the Python backend's task runner.
// UI components consume these constants; backend integration only needs to
// emit `{ stageId, status, progress, message }` events to drive the UI.
// ============================================================================

import type { LucideIcon } from "lucide-react";
import {
  Boxes, ShieldCheck, FileText, Hash, Mic, Subtitles, ListVideo,
  Search, Layers, Download, Cog, Film, FileCode2, Upload, CheckCircle2,
} from "lucide-react";
import type { RenderStatus, RenderTask, Output, Notification, ID } from "@/types";

export type PipelineStageId =
  | "preparing-project" | "validating-settings" | "generating-script"
  | "generating-keywords" | "generating-voice" | "generating-subtitle"
  | "preparing-timeline" | "searching-stock" | "matching-scenes"
  | "downloading-assets" | "preparing-render" | "rendering"
  | "encoding" | "exporting" | "completed";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  hint: string;
  icon: LucideIcon;
  // backend mapping — the Python task module/function that drives this stage.
  backend: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "preparing-project",    label: "Preparing Project",     hint: "Loading project state and config",         icon: Boxes,        backend: "task.start" },
  { id: "validating-settings",  label: "Validating Settings",   hint: "Verifying API keys and parameters",         icon: ShieldCheck,  backend: "task.validate_params" },
  { id: "generating-script",    label: "Generating Script",     hint: "LLM script generation",                     icon: FileText,     backend: "llm.generate_script" },
  { id: "generating-keywords",  label: "Generating Keywords",   hint: "LLM keyword extraction",                    icon: Hash,         backend: "llm.generate_terms" },
  { id: "generating-voice",     label: "Generating Voice",      hint: "Text-to-speech synthesis",                  icon: Mic,          backend: "voice.tts" },
  { id: "generating-subtitle",  label: "Generating Subtitle",   hint: "Whisper transcription and timing",          icon: Subtitles,    backend: "subtitle.create" },
  { id: "preparing-timeline",   label: "Preparing Timeline",    hint: "Scene segmentation",                        icon: ListVideo,    backend: "task.build_timeline" },
  { id: "searching-stock",      label: "Searching Stock Videos",hint: "Querying Pexels / Pixabay",                 icon: Search,       backend: "material.search_videos" },
  { id: "matching-scenes",      label: "Matching Scenes",       hint: "Semantic ranking of clips",                 icon: Layers,       backend: "material.match" },
  { id: "downloading-assets",   label: "Downloading Assets",    hint: "Fetching matched clips",                    icon: Download,     backend: "material.download" },
  { id: "preparing-render",     label: "Preparing Render",      hint: "Building FFmpeg graph",                     icon: Cog,          backend: "video.prepare" },
  { id: "rendering",            label: "Rendering Video",       hint: "Compositing clips, voice, subtitles",       icon: Film,         backend: "video.combine_videos" },
  { id: "encoding",             label: "Encoding",              hint: "H.264 / HEVC encoding",                     icon: FileCode2,    backend: "video.encode" },
  { id: "exporting",            label: "Exporting",             hint: "Muxing and writing final file",             icon: Upload,       backend: "video.finalize" },
  { id: "completed",            label: "Completed",             hint: "Output ready",                              icon: CheckCircle2, backend: "task.complete" },
];

export type StageStatus = "waiting" | "running" | "completed" | "failed" | "cancelled";

export interface PipelineStageState {
  status: StageStatus;
  progress: number;     // 0-100
  startedAt?: string;
  endedAt?: string;
  currentScene?: string;
  currentClip?: string;
  currentFile?: string;
  message?: string;
}

export function statusTone(s: StageStatus | RenderStatus): "neutral" | "primary" | "success" | "warning" | "danger" {
  switch (s) {
    case "completed": return "success";
    case "running": case "rendering": case "encoding": case "preparing": return "primary";
    case "failed": return "danger";
    case "cancelled": case "canceled": return "warning";
    default: return "neutral";
  }
}

// ── Seed render queue (8 mixed-status tasks) ────────────────────────────────
export const SEED_RENDER_QUEUE: RenderTask[] = [
  {
    id: "rt_001", projectId: "p_001", projectName: "Morning Habits of CEOs",
    status: "rendering", progress: 62, etaSec: 184, elapsedSec: 312,
    startedAt: new Date(Date.now() - 312_000).toISOString(),
  },
  {
    id: "rt_002", projectId: "p_002", projectName: "Top 10 AI Tools 2026",
    status: "queued", progress: 0, etaSec: 540,
  },
  {
    id: "rt_003", projectId: "p_003", projectName: "Tokyo at Midnight",
    status: "queued", progress: 0, etaSec: 420,
  },
  {
    id: "rt_004", projectId: "p_004", projectName: "Productivity Hacks",
    status: "completed", progress: 100, elapsedSec: 498,
    completedAt: new Date(Date.now() - 1_200_000).toISOString(),
  },
  {
    id: "rt_005", projectId: "p_005", projectName: "Crypto Explained",
    status: "completed", progress: 100, elapsedSec: 612,
    completedAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: "rt_006", projectId: "p_006", projectName: "Sleep Science",
    status: "failed", progress: 38,
    errorMessage: "Pexels API rate limit exceeded (HTTP 429)",
  },
  {
    id: "rt_007", projectId: "p_007", projectName: "Stoicism in 60 seconds",
    status: "canceled", progress: 14,
  },
  {
    id: "rt_008", projectId: "p_008", projectName: "Why People Quit",
    status: "preparing", progress: 4, etaSec: 720,
  },
];

// ── Seed outputs ────────────────────────────────────────────────────────────
export const SEED_OUTPUTS: Output[] = [
  { id: "o_001", projectId: "p_004", name: "Productivity Hacks", durationSec: 498, fileSizeBytes: 248_000_000, resolution: "1080p", format: "mp4", createdAt: new Date(Date.now() - 1_200_000).toISOString(), filePath: "~/Movies/VideoForge/productivity_hacks_1080p.mp4" },
  { id: "o_002", projectId: "p_005", name: "Crypto Explained", durationSec: 612, fileSizeBytes: 412_000_000, resolution: "1080p", format: "mp4", createdAt: new Date(Date.now() - 3_600_000).toISOString(), filePath: "~/Movies/VideoForge/crypto_explained_1080p.mp4" },
  { id: "o_003", projectId: "p_009", name: "Morning Habits of CEOs", durationSec: 504, fileSizeBytes: 248_000_000, resolution: "4k",    format: "mp4", createdAt: new Date(Date.now() - 7_200_000).toISOString(), filePath: "~/Movies/VideoForge/morning_habits_4k.mp4" },
];

// ── Seed notifications ──────────────────────────────────────────────────────
export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n_001", level: "success", category: "render", title: "Render completed", message: "Productivity Hacks · 1080p · 248 MB", createdAt: new Date(Date.now() - 60_000).toISOString(),    isRead: false, actionLabel: "Open", actionTo: "/outputs" },
  { id: "n_002", level: "info",    category: "render", title: "Render started",   message: "Morning Habits of CEOs queued",        createdAt: new Date(Date.now() - 240_000).toISOString(),   isRead: false, actionTo: "/queue" },
  { id: "n_003", level: "warning", category: "api",    title: "Pexels rate limit",message: "Falling back to Pixabay",              createdAt: new Date(Date.now() - 900_000).toISOString(),   isRead: false, actionTo: "/basic-settings" },
  { id: "n_004", level: "success", category: "system", title: "Project saved",    message: "Tokyo at Midnight",                    createdAt: new Date(Date.now() - 1_800_000).toISOString(), isRead: true },
  { id: "n_005", level: "error",   category: "render", title: "Render failed",    message: "Sleep Science · Pexels HTTP 429",      createdAt: new Date(Date.now() - 3_300_000).toISOString(), isRead: true,  actionLabel: "Retry", actionTo: "/queue" },
  { id: "n_006", level: "info",    category: "update", title: "Update available", message: "VideoForge AI 1.1.0 is ready",         createdAt: new Date(Date.now() - 7_200_000).toISOString(), isRead: true },
];

// ── Formatting helpers ──────────────────────────────────────────────────────
export function formatDuration(sec?: number): string {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
export function formatBytes(b?: number): string {
  if (!b) return "—";
  if (b > 1_000_000_000) return `${(b / 1_000_000_000).toFixed(2)} GB`;
  if (b > 1_000_000) return `${Math.round(b / 1_000_000)} MB`;
  return `${Math.round(b / 1_000)} KB`;
}
export function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

// ── Render task factory ─────────────────────────────────────────────────────
export function makeRenderTask(projectId: ID, projectName: string): RenderTask {
  return {
    id: `rt_${Math.random().toString(36).slice(2, 9)}`,
    projectId, projectName,
    status: "queued", progress: 0,
  };
}
