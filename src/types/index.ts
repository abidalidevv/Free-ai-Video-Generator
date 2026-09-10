// ============================================================================
// VideoForge AI — Shared Domain Types
// Single source of truth for all data shapes. Mirrors the MoneyPrinterTurbo
// Python backend contract. UI components import from here; no inline shapes.
// ============================================================================

// ── Identity & timing ──────────────────────────────────────────────────────
export type ID = string;
export type ISODate = string;
export type Seconds = number;
export type Milliseconds = number;

// ── Project ────────────────────────────────────────────────────────────────
export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5";
export type ProjectStatus = "draft" | "ready" | "rendering" | "completed" | "failed";

export interface Project {
  id: ID;
  name: string;
  subject?: string;
  aspectRatio: AspectRatio;
  language: string;
  status: ProjectStatus;
  thumbnail?: string;
  durationSec?: Seconds;
  createdAt: ISODate;
  updatedAt: ISODate;
  tags?: string[];
}

// ── Script & Keywords ──────────────────────────────────────────────────────
export type Tone =
  | "tiktok" | "storytelling" | "educational" | "news"
  | "documentary" | "vlog" | "promo" | "casual";

export interface Script {
  text: string;
  language: string;
  paragraphs: number;
  tone: Tone;
  customSystemPrompt?: string;
  customRequirements?: string;
  wordCount?: number;
  estDurationSec?: Seconds;
}

export interface Keyword {
  id: ID;
  text: string;
  weight?: number;
  pinned?: boolean;
}

// ── Voice & Audio ──────────────────────────────────────────────────────────
export type VoiceGender = "male" | "female" | "neutral";
export type VoiceQuality = "standard" | "hd" | "ultra-hd";

export interface Voice {
  id: ID;
  provider: TTSProviderId;
  name: string;
  language: string;
  accent?: string;
  gender: VoiceGender;
  quality: VoiceQuality;
  isPremium?: boolean;
  isFavorite?: boolean;
  isRecommended?: boolean;
  previewUrl?: string;
}

export type TTSProviderId =
  | "azure" | "elevenlabs" | "openai" | "google" | "edge"
  | "coqui" | "siliconflow" | "fish-audio" | "minimax";

export interface AudioSettings {
  voiceId?: ID;
  volume: number;        // 0-1
  speed: number;         // 0.5-2.0
  pitch?: number;        // -12 to +12 semitones (placeholder)
  emotion?: string;      // placeholder
  style?: string;        // placeholder
  bgmMode: "none" | "preset" | "custom";
  bgmVolume: number;     // 0-1
  bgmTrackId?: ID;
  bgmFadeIn?: boolean;
  bgmFadeOut?: boolean;
  bgmLoop?: boolean;
}

// ── Video ──────────────────────────────────────────────────────────────────
export type VideoSourceId = "pexels" | "pixabay" | "coverr" | "local" | "stock";
export type ConcatMode = "sequential" | "random";
export type TransitionId =
  | "none" | "fade" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out"
  | "dissolve" | "wipe" | "push";
export type Encoder = "h264-nvenc" | "h264-cpu" | "hevc-nvenc" | "hevc-cpu" | "av1";

export interface VideoSettings {
  source: VideoSourceId;
  concatMode: ConcatMode;
  transition: TransitionId;
  aspectRatio: AspectRatio;
  maxClipDurationSec: Seconds;
  totalDurationSec?: Seconds;
  clipCount: number;
  encoder: Encoder;
  resolution: "720p" | "1080p" | "1440p" | "4k";
  fps: 24 | 30 | 60;
  bitrateKbps?: number;
}

// ── Subtitle ───────────────────────────────────────────────────────────────
export type SubtitlePosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right" | "custom";

export type StrokeStyle = "none" | "thin" | "medium" | "bold" | "glow" | "soft" | "double";
export type BackgroundStyle = "none" | "solid" | "pill" | "blur" | "glass" | "gradient";

export interface SubtitleStyle {
  enabled: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  textCase: "as-typed" | "upper" | "lower" | "title";
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  position: SubtitlePosition;
  positionOffsetY?: number;
  stroke: StrokeStyle;
  strokeColor: string;
  strokeWidth: number;
  background: BackgroundStyle;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundRadius: number;
  backgroundPaddingX: number;
  backgroundPaddingY: number;
  backgroundMargin: number;
  shadow: boolean;
}

export interface SubtitleTemplate {
  id: ID;
  name: string;
  category: string;
  thumbnailHue?: string;
  isPro?: boolean;
  isFavorite?: boolean;
  style?: Partial<SubtitleStyle>;
}

export type AnimationKind = "in" | "out" | "loop";
export interface SubtitleAnimation {
  id: ID;
  kind: AnimationKind;
  name: string;
  durationMs?: Milliseconds;
  intensity?: number;
  delayMs?: Milliseconds;
  curve?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";
}

export type KaraokeMode = "off" | "word" | "line" | "sentence" | "syllable";

export interface SubtitleSettings extends SubtitleStyle {
  templateId?: ID;
  animationIn?: ID;
  animationOut?: ID;
  animationLoop?: ID;
  karaokeMode: KaraokeMode;
  karaokeColor?: string;
  themeId?: string;
}

// ── Overlays ───────────────────────────────────────────────────────────────
export interface Overlay {
  id: ID;
  kind: "logo" | "watermark" | "image" | "lower-third";
  src: string;
  position: SubtitlePosition;
  opacity: number;
  scale: number;
}

// ── Output / Render ────────────────────────────────────────────────────────
export type RenderStatus = "queued" | "preparing" | "rendering" | "encoding" | "completed" | "failed" | "canceled";

export interface RenderTask {
  id: ID;
  projectId: ID;
  projectName: string;
  status: RenderStatus;
  progress: number; // 0-100
  etaSec?: Seconds;
  elapsedSec?: Seconds;
  startedAt?: ISODate;
  completedAt?: ISODate;
  errorMessage?: string;
}

export interface Output {
  id: ID;
  projectId: ID;
  name: string;
  thumbnail?: string;
  durationSec: Seconds;
  fileSizeBytes?: number;
  resolution: string;
  format: string;
  createdAt: ISODate;
  filePath?: string;
}

// ── Providers / API ────────────────────────────────────────────────────────
export type LLMProviderId =
  | "openai" | "azure-openai" | "gemini" | "groq" | "moonshot" | "deepseek"
  | "qwen" | "anthropic" | "ollama" | "openrouter" | "g4f" | "oneapi"
  | "cloudflare" | "ernie" | "pollinations" | "siliconflow";

export interface LLMProviderConfig {
  id: LLMProviderId;
  label: string;
  recommended?: boolean;
  comingSoon?: boolean;
  baseUrl?: string;
  defaultModel?: string;
}

export interface APIKey {
  id: ID;
  providerId: LLMProviderId | VideoSourceId;
  label: string;             // "Production", "Staging", etc.
  maskedKey: string;
  isActive: boolean;
  note?: string;
  createdAt: ISODate;
  lastUsedAt?: ISODate;
}

export interface ProviderStatus {
  providerId: LLMProviderId | VideoSourceId | TTSProviderId;
  isOnline: boolean;
  latencyMs?: number;
  quotaUsed?: number;
  quotaLimit?: number;
  requestsToday?: number;
  lastCheckedAt?: ISODate;
}

// ── Notifications ──────────────────────────────────────────────────────────
export type NotificationLevel = "info" | "success" | "warning" | "error";
export type NotificationCategory = "render" | "api" | "system" | "billing" | "update";

export interface Notification {
  id: ID;
  level: NotificationLevel;
  category: NotificationCategory;
  title: string;
  message?: string;
  createdAt: ISODate;
  isRead: boolean;
  actionLabel?: string;
  actionTo?: string;
}

// ── User Preferences ───────────────────────────────────────────────────────
export type ThemeMode = "light" | "dark" | "system";

export interface UserPreferences {
  theme: ThemeMode;
  language: string;
  desktopNotifications: boolean;
  audioNotifications: boolean;
  autoSave: boolean;
  autoUpdate: boolean;
  reduceMotion: boolean;
  developerMode: boolean;
}
