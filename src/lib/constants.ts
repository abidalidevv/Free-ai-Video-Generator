// ============================================================================
// VideoForge AI — Shared constants and design tokens
// Non-visual tokens (durations, spacing primitives, limits, enums).
// All hex colors live in styles.css; consume via Tailwind utilities.
// ============================================================================

import type {
  LLMProviderConfig, AspectRatio, Encoder, TransitionId, ConcatMode,
} from "@/types";

// ── Layout / sticky offsets ────────────────────────────────────────────────
export const TOPBAR_HEIGHT_PX = 64;
export const STICKY_TOP_OFFSET_PX = 88; // topbar + gutter
export const MAX_CONTENT_WIDTH_PX = 1760;
export const SIDEBAR_WIDTH_PX = 260;

// ── Animation durations ────────────────────────────────────────────────────
export const ANIM_FAST = 150;
export const ANIM_BASE = 220;
export const ANIM_SLOW = 360;

// ── Radii (mirror Tailwind classes used in design system) ──────────────────
export const RADIUS_CARD = "rounded-3xl";
export const RADIUS_PANEL = "rounded-2xl";
export const RADIUS_PILL = "rounded-xl";

// ── Shadows ────────────────────────────────────────────────────────────────
export const SHADOW_CARD = "shadow-card";
export const SHADOW_BRAND = "shadow-brand";

// ── Domain limits (match MoneyPrinterTurbo defaults) ───────────────────────
export const SCRIPT_MAX_PARAGRAPHS = 10;
export const SCRIPT_MIN_PARAGRAPHS = 1;
export const CLIP_MIN_SEC = 1;
export const CLIP_MAX_SEC = 10;
export const KEYWORDS_MAX = 24;

// ── Aspect ratios ──────────────────────────────────────────────────────────
export const ASPECT_RATIOS: { value: AspectRatio; label: string; w: number; h: number }[] = [
  { value: "9:16", label: "Vertical (Shorts / TikTok)", w: 9, h: 16 },
  { value: "16:9", label: "Landscape (YouTube)", w: 16, h: 9 },
  { value: "1:1",  label: "Square (Instagram)",  w: 1, h: 1  },
  { value: "4:5",  label: "Portrait (Feed)",     w: 4, h: 5  },
];

// ── Encoders ───────────────────────────────────────────────────────────────
export const ENCODERS: { value: Encoder; label: string; isHardware: boolean }[] = [
  { value: "h264-nvenc", label: "H.264 NVENC (GPU)",  isHardware: true  },
  { value: "h264-cpu",   label: "H.264 CPU (libx264)", isHardware: false },
  { value: "hevc-nvenc", label: "HEVC NVENC (GPU)",   isHardware: true  },
  { value: "hevc-cpu",   label: "HEVC CPU (libx265)",  isHardware: false },
  { value: "av1",        label: "AV1 (experimental)",  isHardware: false },
];

// ── Transitions ────────────────────────────────────────────────────────────
export const TRANSITIONS: { value: TransitionId; label: string }[] = [
  { value: "none",        label: "None" },
  { value: "fade",        label: "Fade" },
  { value: "dissolve",    label: "Dissolve" },
  { value: "slide-left",  label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom-in",     label: "Zoom In" },
  { value: "zoom-out",    label: "Zoom Out" },
  { value: "wipe",        label: "Wipe" },
  { value: "push",        label: "Push" },
];

export const CONCAT_MODES: { value: ConcatMode; label: string; sub: string }[] = [
  { value: "sequential", label: "Sequential", sub: "Order matches script flow" },
  { value: "random",     label: "Random",     sub: "Shuffle for variety" },
];

// ── LLM providers (mirrors MoneyPrinterTurbo config.toml) ──────────────────
export const LLM_PROVIDERS: LLMProviderConfig[] = [
  { id: "openai",       label: "OpenAI",       recommended: true,  defaultModel: "gpt-4o-mini",        baseUrl: "https://api.openai.com/v1" },
  { id: "gemini",       label: "Google Gemini", recommended: true, defaultModel: "gemini-1.5-pro" },
  { id: "groq",         label: "Groq",         recommended: true,  defaultModel: "llama-3.1-70b-versatile", baseUrl: "https://api.groq.com/openai/v1" },
  { id: "moonshot",     label: "Moonshot",     defaultModel: "moonshot-v1-8k" },
  { id: "deepseek",     label: "DeepSeek",     defaultModel: "deepseek-chat" },
  { id: "qwen",         label: "Qwen",         defaultModel: "qwen-max" },
  { id: "anthropic",    label: "Anthropic",    defaultModel: "claude-3-5-sonnet" },
  { id: "azure-openai", label: "Azure OpenAI" },
  { id: "ollama",       label: "Ollama (Local)", baseUrl: "http://localhost:11434/v1" },
  { id: "openrouter",   label: "OpenRouter",   baseUrl: "https://openrouter.ai/api/v1" },
  { id: "g4f",          label: "GPT4Free" },
  { id: "oneapi",       label: "OneAPI" },
  { id: "cloudflare",   label: "Cloudflare AI" },
  { id: "ernie",        label: "ERNIE (Baidu)" },
  { id: "pollinations", label: "Pollinations" },
  { id: "siliconflow",  label: "SiliconFlow" },
];

// ── Languages (selector) ───────────────────────────────────────────────────
export const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", label: "Spanish",      flag: "🇪🇸" },
  { code: "fr-FR", label: "French",       flag: "🇫🇷" },
  { code: "de-DE", label: "German",       flag: "🇩🇪" },
  { code: "ja-JP", label: "Japanese",     flag: "🇯🇵" },
  { code: "zh-CN", label: "Chinese",      flag: "🇨🇳" },
  { code: "ar-SA", label: "Arabic",       flag: "🇸🇦" },
];

// ── Defaults (used to bootstrap state) ─────────────────────────────────────
export const DEFAULT_VIDEO_SETTINGS = {
  source: "pexels" as const,
  concatMode: "sequential" as const,
  transition: "fade" as const,
  aspectRatio: "9:16" as const,
  maxClipDurationSec: 5,
  clipCount: 8,
  encoder: "h264-nvenc" as const,
  resolution: "1080p" as const,
  fps: 30 as const,
};

export const DEFAULT_AUDIO_SETTINGS = {
  volume: 1,
  speed: 1,
  bgmMode: "preset" as const,
  bgmVolume: 0.2,
  bgmFadeIn: true,
  bgmFadeOut: true,
  bgmLoop: true,
};

export const DEFAULT_SUBTITLE_SETTINGS = {
  enabled: true,
  fontFamily: "Plus Jakarta Sans",
  fontSize: 56,
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1.15,
  textCase: "as-typed" as const,
  bold: true,
  italic: false,
  underline: false,
  color: "#FFFFFF",
  position: "bottom-center" as const,
  stroke: "medium" as const,
  strokeColor: "#000000",
  strokeWidth: 3,
  background: "none" as const,
  backgroundColor: "#000000",
  backgroundOpacity: 0.6,
  backgroundRadius: 12,
  backgroundPaddingX: 16,
  backgroundPaddingY: 10,
  backgroundMargin: 24,
  shadow: false,
  karaokeMode: "off" as const,
};
