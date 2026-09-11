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

// ── Seed outputs ────────────────────────────────────────────────────────────

// ── Seed notifications ──────────────────────────────────────────────────────

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
