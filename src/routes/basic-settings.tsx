import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell, PageHeader, SectionCard, Field, Input, Select, Toggle, Pill,
  PrimaryButton, GhostButton,
} from "@/components/app-shell";
import {
  KeyRound, Eye, EyeOff, Copy, ClipboardPaste, X, Check, Search, Star,
  RefreshCw, Save, RotateCcw, Plug, Download, Upload, DatabaseBackup,
  History, Plus, Trash2, Pencil, Sparkles, ShieldCheck, Activity, Gauge,
  Video, Mic2, Subtitles, Film, CircleCheck, CircleAlert, CircleDashed,
  Wifi, Clock, Zap, Info, ExternalLink, GripVertical, Lock, ArrowUpDown,
  Image as ImageIcon, Bot, Globe, FlaskConical, Power, PowerOff,
} from "lucide-react";
import {
  ApiSummaryCards,
  ApiGroupSection,
  TTS_APIS,
  FUTURE_APIS,
} from "@/components/api-manager-shared";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/basic-settings")({
  head: () => ({ meta: [{ title: "Basic Settings — VideoForge AI" }] }),
  component: BasicSettingsPage,
});

/* ---------------------------------- data ---------------------------------- */

type Provider = {
  id: string;
  name: string;
  initials: string;
  tint: string;
  baseUrl: string;
  endpoint: string;
  badge?: "Recommended" | "Popular" | "New" | "Beta";
  models: string[];
};

const PROVIDERS: Provider[] = [
  { id: "openai", name: "OpenAI", initials: "AI", tint: "from-emerald-500 to-teal-600", baseUrl: "https://api.openai.com/v1", endpoint: "/chat/completions", badge: "Recommended", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"] },
  { id: "anthropic", name: "Anthropic Claude", initials: "AN", tint: "from-amber-500 to-orange-700", baseUrl: "https://api.anthropic.com/v1", endpoint: "/messages", badge: "Recommended", models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"] },
  { id: "gemini", name: "Google Gemini", initials: "GM", tint: "from-sky-500 to-blue-600", baseUrl: "https://generativelanguage.googleapis.com/v1beta", endpoint: "/models/{model}:generateContent", badge: "Popular", models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.0-pro"] },
  { id: "ollama", name: "Local Ollama", initials: "OL", tint: "from-stone-600 to-zinc-800", baseUrl: "http://localhost:11434/v1", endpoint: "/chat/completions", badge: "New", models: ["llama3.1:8b", "llama3.1:70b", "llama3.2", "mistral", "qwen2.5", "phi3", "gemma2", "codellama"] },
  { id: "groq", name: "Groq", initials: "GQ", tint: "from-orange-500 to-rose-500", baseUrl: "https://api.groq.com/openai/v1", endpoint: "/chat/completions", badge: "New", models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"] },
  { id: "deepseek", name: "DeepSeek", initials: "DS", tint: "from-indigo-500 to-violet-600", baseUrl: "https://api.deepseek.com/v1", endpoint: "/chat/completions", models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"] },
  { id: "qwen", name: "Qwen", initials: "QW", tint: "from-purple-500 to-fuchsia-600", baseUrl: "https://dashscope.aliyuncs.com/api/v1", endpoint: "/services/aigc/text-generation/generation", models: ["qwen-max", "qwen-plus", "qwen-turbo", "qwen2.5-72b"] },
  { id: "azure", name: "Azure OpenAI", initials: "AZ", tint: "from-cyan-500 to-sky-700", baseUrl: "https://{resource}.openai.azure.com", endpoint: "/openai/deployments/{deploy}/chat/completions", models: ["gpt-4o", "gpt-4-turbo", "gpt-35-turbo"] },
  { id: "moonshot", name: "Moonshot", initials: "MS", tint: "from-slate-600 to-zinc-800", baseUrl: "https://api.moonshot.cn/v1", endpoint: "/chat/completions", models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"] },
  { id: "ernie", name: "ERNIE", initials: "ER", tint: "from-blue-600 to-indigo-700", baseUrl: "https://aip.baidubce.com/rpc/2.0/ai_custom", endpoint: "/v1/wenxinworkshop/chat", models: ["ernie-4.0-turbo", "ernie-3.5", "ernie-speed"] },
  { id: "openrouter", name: "OpenRouter", initials: "OR", tint: "from-pink-500 to-rose-600", baseUrl: "https://openrouter.ai/api/v1", endpoint: "/chat/completions", badge: "Popular", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.1-405b", "google/gemini-pro-1.5"] },
  { id: "minimax", name: "MiniMax", initials: "MM", tint: "from-amber-500 to-orange-600", baseUrl: "https://api.minimax.chat/v1", endpoint: "/text/chatcompletion_v2", models: ["abab6.5s-chat", "abab6.5-chat", "abab5.5-chat"] },
  { id: "modelscope", name: "ModelScope", initials: "MK", tint: "from-teal-500 to-emerald-700", baseUrl: "https://api-inference.modelscope.cn/v1", endpoint: "/chat/completions", models: ["qwen2.5-72b-instruct", "llama-3.1-405b-instruct"] },
  { id: "cloudflare", name: "Cloudflare", initials: "CF", tint: "from-orange-400 to-amber-600", baseUrl: "https://api.cloudflare.com/client/v4/accounts/{id}/ai", endpoint: "/run/{model}", models: ["@cf/meta/llama-3.1-70b-instruct", "@cf/mistral/mistral-7b-instruct"] },
  { id: "litellm", name: "LiteLLM", initials: "LL", tint: "from-lime-500 to-green-600", baseUrl: "http://localhost:4000", endpoint: "/chat/completions", models: ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"] },
  { id: "aimlapi", name: "AIML API", initials: "AM", tint: "from-rose-500 to-pink-600", baseUrl: "https://api.aimlapi.com/v1", endpoint: "/chat/completions", models: ["gpt-4o", "claude-3-opus", "llama-3.1-405b"] },
  { id: "aihubmix", name: "AIHubMix", initials: "AH", tint: "from-violet-500 to-purple-700", baseUrl: "https://aihubmix.com/v1", endpoint: "/chat/completions", models: ["gpt-4o-mini", "claude-3.5-sonnet"] },
  { id: "evolinkai", name: "EvoLinkAI", initials: "EV", tint: "from-emerald-600 to-cyan-700", baseUrl: "https://api.evolinkai.com/v1", endpoint: "/chat/completions", models: ["evo-pro", "evo-fast"] },
  { id: "pollinations", name: "Pollinations", initials: "PL", tint: "from-fuchsia-500 to-pink-700", baseUrl: "https://text.pollinations.ai", endpoint: "/openai", badge: "Beta", models: ["openai", "mistral", "llama"] },
  { id: "custom", name: "Custom OpenAI Compatible", initials: "CO", tint: "from-zinc-600 to-slate-800", baseUrl: "https://your-endpoint.example.com/v1", endpoint: "/chat/completions", models: [] },
];

type ProviderKind = "video" | "image" | "both";
type ProviderCat = "free" | "ai" | "future";
type VideoProv = {
  id: string; name: string; tint: string; initials: string; soon?: boolean;
  desc: string; usage?: string;
  cat: ProviderCat;
  kind: ProviderKind;
  free?: boolean;
  popularity?: number;       // 0..100
  quality?: 1 | 2 | 3 | 4 | 5;
  addedAt?: string;          // ISO date for "Recently Added"
  docUrl?: string;
  apiVersion?: string;
  dailyLimit?: string;
  remaining?: string;
  monthly?: string;
  latencyMs?: number;
  lastChecked?: string;
  notes?: string;
};

const VIDEO_PROVIDERS: VideoProv[] = [
  // ─── Already Active ───
  { id: "pexels",   name: "Pexels",          initials: "PX", tint: "from-emerald-500 to-teal-700", desc: "Free curated stock footage at up to 4K.",              cat: "free", kind: "both",  free: true, popularity: 96, quality: 5, addedAt: "2024-04-01", docUrl: "https://www.pexels.com/api/", apiVersion: "v1",   dailyLimit: "200/hr",  remaining: "184",  monthly: "12.4k", latencyMs: 92,  lastChecked: "just now",  notes: "Default provider for vertical reels.", usage: "184 / 200 hr" },
  { id: "pixabay",  name: "Pixabay",         initials: "PB", tint: "from-lime-500 to-green-700",   desc: "Royalty-free clips and B-roll, no attribution.",      cat: "free", kind: "both",  free: true, popularity: 92, quality: 4, addedAt: "2024-04-01", docUrl: "https://pixabay.com/api/docs/",            apiVersion: "v2",   dailyLimit: "5k/day",  remaining: "4.6k", monthly: "78k",   latencyMs: 108, lastChecked: "1m ago",    notes: "Great fallback when Pexels is rate-limited.", usage: "4.6k / 5k day" },
  { id: "coverr",   name: "Coverr",          initials: "CR", tint: "from-sky-500 to-blue-700",     desc: "Cinematic background loops for hero scenes.",         cat: "free", kind: "video", free: true, popularity: 78, quality: 5, addedAt: "2024-05-12", docUrl: "https://coverr.co/",                       apiVersion: "v1",   dailyLimit: "—",       remaining: "—",    monthly: "—",     latencyMs: 0,   lastChecked: "—", usage: "—" },

  // ─── Free / Large Catalog ───
  { id: "unsplash-img",   name: "Unsplash Images",       initials: "UI", tint: "from-zinc-700 to-slate-900",      desc: "World-class photography library with a free API.",                cat: "free", kind: "image", free: true, popularity: 94, quality: 5, addedAt: "2024-06-02", docUrl: "https://unsplash.com/developers", apiVersion: "v1", dailyLimit: "50/hr",   remaining: "50",  monthly: "—", latencyMs: 132, lastChecked: "—" },
  { id: "unsplash-vid",   name: "Unsplash Video",        initials: "UV", tint: "from-zinc-600 to-slate-800",      desc: "High-quality vertical reels and motion stills.",                  cat: "free", kind: "video", free: true, popularity: 70, quality: 4, addedAt: "2025-01-10", soon: true, docUrl: "https://unsplash.com/developers" },
  { id: "mixkit",         name: "Mixkit",                 initials: "MX", tint: "from-rose-500 to-pink-700",       desc: "Curated motion clips for marketing & social.",                    cat: "free", kind: "video", free: true, popularity: 81, quality: 5, addedAt: "2024-07-04", docUrl: "https://mixkit.co/license/",      apiVersion: "—",  dailyLimit: "Unlimited", remaining: "—", monthly: "—", latencyMs: 144, lastChecked: "—" },
  { id: "videvo",         name: "Videvo",                 initials: "VD", tint: "from-indigo-500 to-violet-700",   desc: "Large catalog of 4K stock & motion graphics.",                    cat: "free", kind: "video", free: true, popularity: 74, quality: 4, addedAt: "2024-08-22", docUrl: "https://www.videvo.net/",         apiVersion: "v1", dailyLimit: "1k/day", remaining: "1k", monthly: "—", latencyMs: 188, lastChecked: "—" },
  { id: "freepik-vid",    name: "Freepik Video",          initials: "FP", tint: "from-amber-500 to-orange-700",    desc: "AI-generated and licensed creator footage.",                      cat: "free", kind: "video", free: false, popularity: 71, quality: 4, addedAt: "2024-09-15", docUrl: "https://www.freepik.com/api",     apiVersion: "v1" },
  { id: "adobe-stock",    name: "Adobe Stock",            initials: "AS", tint: "from-red-500 to-rose-700",        desc: "Premium stock with deep creative integrations.",                  cat: "free", kind: "both",  free: false, popularity: 90, quality: 5, addedAt: "2025-02-01", soon: true, docUrl: "https://developer.adobe.com/stock/" },
  { id: "storyblocks",    name: "Storyblocks",            initials: "SB", tint: "from-cyan-600 to-blue-800",       desc: "Subscription stock + sound effects library.",                     cat: "free", kind: "video", free: false, popularity: 76, quality: 4, addedAt: "2025-02-03", soon: true, docUrl: "https://www.storyblocks.com/" },
  { id: "motion-array",   name: "Motion Array",           initials: "MA", tint: "from-fuchsia-500 to-purple-700",  desc: "Templates, presets and stock for After Effects.",                 cat: "free", kind: "video", free: false, popularity: 68, quality: 4, addedAt: "2025-02-04", soon: true, docUrl: "https://motionarray.com/" },
  { id: "envato",         name: "Envato Elements",        initials: "EN", tint: "from-emerald-600 to-green-800",   desc: "Unlimited downloads across stock & templates.",                   cat: "free", kind: "both",  free: false, popularity: 84, quality: 5, addedAt: "2025-02-05", soon: true, docUrl: "https://elements.envato.com/" },
  { id: "pond5",          name: "Pond5",                  initials: "P5", tint: "from-slate-600 to-zinc-800",      desc: "Royalty-free marketplace for music & footage.",                   cat: "free", kind: "video", free: false, popularity: 66, quality: 4, addedAt: "2025-02-06", soon: true, docUrl: "https://www.pond5.com/" },
  { id: "shutterstock",   name: "Shutterstock",           initials: "SS", tint: "from-red-600 to-rose-800",        desc: "Enterprise-grade global stock library.",                          cat: "free", kind: "both",  free: false, popularity: 89, quality: 5, addedAt: "2025-02-07", soon: true, docUrl: "https://developers.shutterstock.com/" },
  { id: "istock",         name: "iStock",                 initials: "IS", tint: "from-stone-600 to-neutral-800",   desc: "Premium curated stock by Getty Images.",                          cat: "free", kind: "both",  free: false, popularity: 80, quality: 5, addedAt: "2025-02-08", soon: true, docUrl: "https://www.istockphoto.com/" },
  { id: "openverse",      name: "Openverse",              initials: "OV", tint: "from-teal-500 to-cyan-700",       desc: "Open-licensed media aggregator from WordPress.",                  cat: "free", kind: "both",  free: true, popularity: 60, quality: 3, addedAt: "2024-10-02", docUrl: "https://api.openverse.engineering/", apiVersion: "v1", dailyLimit: "Unlimited", remaining: "—", monthly: "—" },
  { id: "wikimedia",      name: "Wikimedia Commons",      initials: "WC", tint: "from-blue-500 to-indigo-700",     desc: "Free-licensed encyclopedic media collection.",                    cat: "free", kind: "both",  free: true, popularity: 58, quality: 3, addedAt: "2024-10-03", docUrl: "https://commons.wikimedia.org/wiki/Commons:API", apiVersion: "v1" },
  { id: "internet-archive", name: "Internet Archive",     initials: "IA", tint: "from-yellow-600 to-amber-800",    desc: "Public-domain video, audio and text archive.",                    cat: "free", kind: "both",  free: true, popularity: 55, quality: 3, addedAt: "2024-10-04", docUrl: "https://archive.org/help/aboutapi.php" },
  { id: "nasa",           name: "NASA Media Library",     initials: "NA", tint: "from-indigo-600 to-violet-800",   desc: "Public-domain space imagery, video and audio.",                   cat: "free", kind: "both",  free: true, popularity: 64, quality: 5, addedAt: "2024-11-01", docUrl: "https://images.nasa.gov/" },
  { id: "pixabay-img",    name: "Pixabay Images",         initials: "PI", tint: "from-lime-600 to-emerald-800",    desc: "Royalty-free image catalog companion to Pixabay video.",          cat: "free", kind: "image", free: true, popularity: 85, quality: 4, addedAt: "2024-04-01", docUrl: "https://pixabay.com/api/docs/" },
  { id: "pexels-img",     name: "Pexels Images",          initials: "PE", tint: "from-emerald-600 to-teal-800",    desc: "Curated free photography library by Pexels.",                     cat: "free", kind: "image", free: true, popularity: 91, quality: 5, addedAt: "2024-04-01", docUrl: "https://www.pexels.com/api/" },

  // ─── AI Generated Providers ───
  { id: "runway",   name: "Runway Assets",  initials: "RW", tint: "from-violet-500 to-fuchsia-700", desc: "Generative video clips from Runway Gen-3.",        cat: "ai", kind: "video", free: false, popularity: 88, quality: 5, addedAt: "2025-03-01", docUrl: "https://docs.runwayml.com/" },
  { id: "luma",     name: "Luma Assets",    initials: "LU", tint: "from-rose-500 to-red-700",       desc: "Cinematic AI scenes generated by Luma Dream Machine.", cat: "ai", kind: "video", free: false, popularity: 84, quality: 5, addedAt: "2025-03-02", docUrl: "https://lumalabs.ai/" },
  { id: "kling",    name: "Kling Assets",   initials: "KL", tint: "from-cyan-500 to-blue-700",      desc: "Long-form generative clips with realistic motion.",   cat: "ai", kind: "video", free: false, popularity: 75, quality: 4, addedAt: "2025-03-03", docUrl: "https://klingai.com/" },
  { id: "pika",     name: "Pika Assets",    initials: "PK", tint: "from-pink-500 to-rose-700",      desc: "AI-generated short clips with style controls.",       cat: "ai", kind: "video", free: false, popularity: 73, quality: 4, addedAt: "2025-03-04", docUrl: "https://pika.art/" },
  { id: "veo",      name: "Google Veo Assets", initials: "VE", tint: "from-blue-500 to-indigo-700", desc: "Google Veo high-fidelity generated footage.",          cat: "ai", kind: "video", free: false, popularity: 86, quality: 5, addedAt: "2025-03-05", docUrl: "https://deepmind.google/technologies/veo/" },
  { id: "leonardo", name: "Leonardo Assets",initials: "LE", tint: "from-amber-500 to-orange-700",   desc: "Leonardo.ai still & motion creative library.",         cat: "ai", kind: "both",  free: false, popularity: 70, quality: 4, addedAt: "2025-03-06", docUrl: "https://leonardo.ai/" },

  // ─── Future / Social Providers ───
  { id: "tiktok",     name: "TikTok",        initials: "TT", tint: "from-zinc-900 to-neutral-700",  desc: "Pull trending vertical clips & sounds.",            cat: "future", kind: "video", popularity: 95, quality: 4, addedAt: "2025-04-01", soon: true, docUrl: "https://developers.tiktok.com/" },
  { id: "instagram",  name: "Instagram",     initials: "IG", tint: "from-pink-500 to-orange-500",   desc: "Reels and feed media via Graph API.",               cat: "future", kind: "video", popularity: 93, quality: 4, addedAt: "2025-04-02", soon: true, docUrl: "https://developers.facebook.com/docs/instagram-api/" },
  { id: "youtube",    name: "YouTube",       initials: "YT", tint: "from-red-500 to-rose-700",      desc: "Shorts and long-form video sourcing.",              cat: "future", kind: "video", popularity: 98, quality: 5, addedAt: "2025-04-03", soon: true, docUrl: "https://developers.google.com/youtube/v3" },
  { id: "facebook",   name: "Facebook",      initials: "FB", tint: "from-blue-600 to-indigo-800",   desc: "Public video posts via Graph API.",                 cat: "future", kind: "video", popularity: 79, quality: 3, addedAt: "2025-04-04", soon: true, docUrl: "https://developers.facebook.com/" },
  { id: "x",          name: "X",             initials: "X",  tint: "from-zinc-900 to-black",        desc: "Pull video posts from X (formerly Twitter).",       cat: "future", kind: "video", popularity: 72, quality: 3, addedAt: "2025-04-05", soon: true, docUrl: "https://developer.x.com/" },
  { id: "bilibili",   name: "Bilibili",      initials: "BL", tint: "from-pink-400 to-cyan-500",     desc: "Trending Chinese-language video sourcing.",         cat: "future", kind: "video", popularity: 65, quality: 4, addedAt: "2025-04-06", soon: true, docUrl: "https://www.bilibili.com/" },
  { id: "xiaohongshu",name: "Xiaohongshu",   initials: "XH", tint: "from-red-500 to-rose-600",      desc: "Lifestyle & creator content from RedNote.",          cat: "future", kind: "video", popularity: 60, quality: 4, addedAt: "2025-04-07", soon: true, docUrl: "https://www.xiaohongshu.com/" },
  { id: "dailymotion",name: "Dailymotion",   initials: "DM", tint: "from-blue-500 to-cyan-600",     desc: "Global video catalog with rich metadata.",          cat: "future", kind: "video", popularity: 55, quality: 3, addedAt: "2025-04-08", soon: true, docUrl: "https://developers.dailymotion.com/" },
  { id: "vimeo",      name: "Vimeo",         initials: "VM", tint: "from-sky-500 to-blue-700",      desc: "Pro creator catalog with high-quality masters.",     cat: "future", kind: "video", popularity: 82, quality: 5, addedAt: "2025-04-09", soon: true, docUrl: "https://developer.vimeo.com/" },
];

const FALLBACK_DEFAULT = ["pexels", "pixabay", "coverr", "mixkit", "videvo"];

type FilterKey = "all" | "active" | "connected" | "video" | "image" | "ai" | "free";
type SortKey = "popularity" | "free" | "quality" | "recent";

/* --------------------------------- page ---------------------------------- */

function BasicSettingsPage() {
  const [providerId, setProviderId] = useState("openai");
  const provider = PROVIDERS.find(p => p.id === providerId)!;

  const [apiKey, setApiKey] = useState("sk-prod-aHb2k••••••••••3xN9q");
  const [showKey, setShowKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl);
  const [model, setModel] = useState(provider.models[0] ?? "");
  const [favorites, setFavorites] = useState<string[]>(["gpt-4o", "claude-3.5-sonnet"]);
  const [recents] = useState<string[]>(["gpt-4o-mini", "llama-3.1-70b-versatile"]);
  const [pinned, setPinned] = useState<string[]>(["gpt-4o"]);
  const [modelSearch, setModelSearch] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [testing, setTesting] = useState<"idle" | "loading" | "ok" | "err">("ok");
  const [copied, setCopied] = useState(false);

  // sync base URL & model when provider changes
  const pickProvider = (id: string) => {
    const p = PROVIDERS.find(x => x.id === id)!;
    setProviderId(id);
    setBaseUrl(p.baseUrl);
    setModel(p.models[0] ?? "");
  };

  const filteredModels = useMemo(
    () => provider.models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase())),
    [provider, modelSearch]
  );

  const toggleFav = (m: string) => setFavorites(f => f.includes(m) ? f.filter(x => x !== m) : [...f, m]);
  const togglePin = (m: string) => setPinned(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };
  const handlePaste = async () => {
    try { const t = await navigator.clipboard.readText(); if (t) setApiKey(t); } catch {}
  };

  const runTest = () => {
    setTesting("loading");
    setTimeout(() => setTesting(Math.random() > 0.15 ? "ok" : "err"), 1100);
  };

  return (
    <AppShell>
      <PageHeader
        crumb={["System", "Basic Settings"]}
        title="Basic Settings"
        subtitle="Configure the AI, video and connection providers powering every render."
        actions={
          <>
            <GhostButton><RotateCcw className="w-4 h-4" /> Reset</GhostButton>
            <PrimaryButton><Save className="w-4 h-4" /> Save Settings</PrimaryButton>
          </>
        }
      />

      <ApiSummaryCards />

      <div className="grid grid-cols-12 gap-5">
        {/* ============================== LEFT COLUMN ============================== */}
        <div className="col-span-12 xl:col-span-8 space-y-5">
          {/* AI CONFIGURATION */}
          <SectionCard
            title="AI Configuration"
            subtitle="Pick your language model provider and tune connection parameters."
            right={<Pill tone="primary"><Sparkles className="w-3 h-3" /> {provider.name}</Pill>}
          >
            <div className="pt-4 space-y-5">
              {/* PROVIDER GRID */}
              <Field label="LLM Provider" hint="Choose the engine that drafts scripts and captions.">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 mt-1">
                  {PROVIDERS.map(p => {
                    const active = p.id === providerId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => pickProvider(p.id)}
                        className={`group relative text-left p-3 rounded-xl border transition ${active ? "border-primary/40 bg-accent shadow-card" : "border-border bg-card hover:border-primary/20 hover:bg-secondary/40"}`}
                        title={p.name}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.tint} grid place-items-center text-white font-display font-extrabold text-[11px] shrink-0`}>
                            {p.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-bold truncate">{p.name}</div>
                            {p.badge && (
                              <div className={`mt-0.5 text-[9.5px] font-bold uppercase tracking-wider ${p.badge === "Recommended" ? "text-primary" : p.badge === "Beta" ? "text-amber-600" : "text-muted-foreground"}`}>
                                {p.badge}
                              </div>
                            )}
                          </div>
                        </div>
                        {active && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* API KEY */}
              <Field label="API Key" hint="Stored locally and encrypted before being sent to the backend.">
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="!pl-9 !pr-[180px] font-mono !text-[12.5px]"
                    placeholder="sk-…"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <IconBtn onClick={() => setShowKey(v => !v)} title={showKey ? "Hide" : "Show"}>
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </IconBtn>
                    <IconBtn onClick={handleCopy} title="Copy">
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </IconBtn>
                    <IconBtn onClick={handlePaste} title="Paste"><ClipboardPaste className="w-3.5 h-3.5" /></IconBtn>
                    <IconBtn onClick={() => setApiKey("")} title="Clear"><X className="w-3.5 h-3.5" /></IconBtn>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11.5px]">
                  {apiKey.length > 12 ? (
                    <span className="flex items-center gap-1.5 text-success font-semibold"><Check className="w-3 h-3" /> Format looks valid</span>
                  ) : apiKey.length === 0 ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Info className="w-3 h-3" /> Paste a key to begin</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-600 font-semibold"><CircleAlert className="w-3 h-3" /> Key seems too short</span>
                  )}
                </div>
              </Field>

              {/* BASE URL */}
              <Field label="Base URL" hint={`Example endpoint: ${provider.baseUrl}${provider.endpoint}`}>
                <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="font-mono !text-[12.5px]" />
              </Field>

              {/* MODEL */}
              <Field label="Model" hint="Models refresh automatically when you switch provider.">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      placeholder="Search models…"
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      className="flex-1 bg-transparent text-[12.5px] focus:outline-none placeholder:text-muted-foreground"
                    />
                    <button className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1" onClick={() => setModelSearch("")}>
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>

                  {pinned.length + recents.length > 0 && (
                    <div className="px-3 py-2 border-b border-border/60 bg-background/40">
                      {pinned.length > 0 && <Row label="Pinned" items={pinned} model={model} setModel={setModel} togglePin={togglePin} pinned={pinned} favorites={favorites} toggleFav={toggleFav} />}
                      {recents.length > 0 && <Row label="Recent" items={recents} model={model} setModel={setModel} togglePin={togglePin} pinned={pinned} favorites={favorites} toggleFav={toggleFav} />}
                    </div>
                  )}

                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredModels.length === 0 && (
                      <div className="p-6 text-center text-[12px] text-muted-foreground">
                        <CircleDashed className="w-5 h-5 mx-auto mb-2 opacity-60" />
                        No models available — use a custom name below.
                      </div>
                    )}
                    {filteredModels.map(m => {
                      const sel = m === model;
                      const fav = favorites.includes(m);
                      const pin = pinned.includes(m);
                      return (
                        <div key={m} className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border/30 last:border-0 transition ${sel ? "bg-accent" : "hover:bg-secondary/40"}`} onClick={() => setModel(m)}>
                          <div className={`w-3.5 h-3.5 rounded-full border-2 grid place-items-center ${sel ? "border-primary bg-primary" : "border-border"}`}>
                            {sel && <Check className="w-2 h-2 text-white" strokeWidth={4} />}
                          </div>
                          <span className="flex-1 text-[12.5px] font-mono">{m}</span>
                          <button onClick={e => { e.stopPropagation(); togglePin(m); }} title="Pin">
                            <CircleCheck className={`w-3.5 h-3.5 ${pin ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"}`} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); toggleFav(m); }} title="Favorite">
                            <Star className={`w-3.5 h-3.5 ${fav ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-muted-foreground"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-3 py-2.5 border-t border-border bg-secondary/30 flex items-center gap-2">
                    <Input
                      value={customModel}
                      onChange={e => setCustomModel(e.target.value)}
                      placeholder="Custom model name…"
                      className="!h-8 !text-[12px] font-mono"
                    />
                    <button
                      onClick={() => { if (customModel) { setModel(customModel); setCustomModel(""); } }}
                      className="h-8 px-3 rounded-lg bg-brand-gradient text-white text-[11.5px] font-bold shadow-brand flex items-center gap-1 whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" /> Use Custom
                    </button>
                  </div>
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* VIDEO SOURCE APIs */}
          <VideoSourceHub />


          {/* API MANAGEMENT */}
          <ApiManagementCard />
        </div>

        {/* ============================== RIGHT COLUMN ============================== */}
        <div className="col-span-12 xl:col-span-4 space-y-5">
          {/* CONNECTION CARD */}
          <SectionCard title="Connection" subtitle="Live status of the selected provider.">
            <div className="pt-4 space-y-3">
              <ConnRow icon={Plug} label="Provider Status" value={<Pill tone="success"><Check className="w-3 h-3" /> Online</Pill>} />
              <ConnRow icon={ShieldCheck} label="API Status" value={<Pill tone={testing === "err" ? "danger" : "success"}>{testing === "err" ? "Unauthorized" : "Authenticated"}</Pill>} />
              <ConnRow icon={Clock} label="Last Checked" value={<span className="text-[12px] font-medium">2 min ago</span>} />
              <ConnRow icon={Zap} label="Latency" value={<span className="text-[12px] font-mono font-semibold">182 ms</span>} />
              <ConnRow icon={Gauge} label="Quota" value={<span className="text-[12px] font-mono font-semibold">7.2M / 10M</span>} />
              <ConnRow icon={Wifi} label="Connection Quality" value={
                <div className="flex items-center gap-1">
                  {[1,2,3,4].map(i => <div key={i} className={`w-1 rounded-full ${i <= 4 ? "bg-success" : "bg-border"}`} style={{ height: 4 + i * 2 }} />)}
                  <span className="ml-1.5 text-[11.5px] font-semibold text-success">Excellent</span>
                </div>
              } />

              <div className="pt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={runTest}
                  disabled={testing === "loading"}
                  className={`h-10 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition ${testing === "loading" ? "bg-secondary text-muted-foreground" : "bg-brand-gradient text-white shadow-brand hover:opacity-95"}`}
                >
                  {testing === "loading" ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing…</> : <><Plug className="w-3.5 h-3.5" /> Test Connection</>}
                </button>
                <GhostButton className="!h-10 !text-[12px] justify-center"><RefreshCw className="w-3.5 h-3.5" /> Refresh Models</GhostButton>
              </div>

              {testing === "ok" && (
                <div className="rounded-xl bg-success/10 border border-success/20 p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                  <CircleCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <div className="text-[12px]">
                    <div className="font-semibold text-success">Connected successfully</div>
                    <div className="text-muted-foreground mt-0.5">Pinged {provider.name} · received 200 OK in 182 ms.</div>
                  </div>
                </div>
              )}
              {testing === "err" && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                  <CircleAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="text-[12px]">
                    <div className="font-semibold text-destructive">Connection failed</div>
                    <div className="text-muted-foreground mt-0.5">Check the API key and base URL, then try again.</div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* CONFIGURATION STATUS */}
          <SectionCard title="Configuration Status" subtitle="System readiness across every pipeline stage.">
            <div className="pt-4 space-y-2.5">
              <StatusCard icon={Sparkles} title="LLM Connected" desc={`${provider.name} · ${model}`} tone="success" />
              <StatusCard icon={Video} title="Video APIs Connected" desc="2 of 3 providers active" tone="success" />
              <StatusCard icon={Mic2} title="Voice Provider Ready" desc="ElevenLabs · 62.4k chars left" tone="success" />
              <StatusCard icon={Subtitles} title="Subtitle Engine Ready" desc="Whisper Large v3 (local)" tone="success" />
              <StatusCard icon={Film} title="Rendering Engine Ready" desc="FFmpeg 6.1 · NVENC GPU" tone="success" />
              <StatusCard icon={Activity} title="Pipeline Health" desc="All systems nominal" tone="primary" />
            </div>
          </SectionCard>

          {/* QUICK ACTIONS */}
          <SectionCard title="Quick Actions" subtitle="Backup, restore and migrate your configuration.">
            <div className="pt-4 grid grid-cols-2 gap-2">
              <QuickAction icon={Upload} label="Import" hint="Load .json config" />
              <QuickAction icon={Download} label="Export" hint="Save current setup" />
              <QuickAction icon={DatabaseBackup} label="Backup" hint="Snapshot to cloud" />
              <QuickAction icon={History} label="Restore" hint="Roll back changes" />
              <button className="col-span-2 h-11 rounded-xl bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 text-destructive text-[12.5px] font-bold flex items-center justify-center gap-2 transition">
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Settings
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <ApiGroupSection title="TTS APIs" sub="Voice synthesis" items={TTS_APIS} />
        <ApiGroupSection
          title="Future APIs"
          sub="Planned integrations — not yet enabled"
          items={FUTURE_APIS}
        />
      </div>
    </AppShell>
  );
}

/* ------------------------------ subcomponents ----------------------------- */

function IconBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-7 h-7 rounded-md grid place-items-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
    >
      {children}
    </button>
  );
}

function Row({ label, items, model, setModel, togglePin, pinned, favorites, toggleFav }: any) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[9.5px] font-bold tracking-[0.12em] text-muted-foreground uppercase mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((m: string) => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono border transition flex items-center gap-1.5 ${model === m ? "border-primary/40 bg-accent text-primary" : "border-border bg-card hover:bg-secondary"}`}
          >
            {favorites.includes(m) && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConnRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-secondary grid place-items-center">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="text-[12.5px] font-medium">{label}</span>
      </div>
      {value}
    </div>
  );
}

function StatusCard({ icon: Icon, title, desc, tone }: { icon: any; title: string; desc: string; tone: "success" | "primary" | "warning" }) {
  const tones: Record<string, string> = {
    success: "bg-success/10 border-success/20 text-success",
    primary: "bg-accent border-primary/15 text-primary",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
  };
  const dot: Record<string, string> = {
    success: "bg-success", primary: "bg-primary", warning: "bg-amber-500",
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition">
      <div className={`w-9 h-9 rounded-lg ${tones[tone]} grid place-items-center border`}>
        <Icon className="w-4 h-4" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold truncate flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dot[tone]}`} /> {title}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{desc}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, hint }: any) {
  return (
    <button className="p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-secondary/40 transition text-left group">
      <div className="w-8 h-8 rounded-lg bg-brand-gradient grid place-items-center text-white shadow-brand mb-2 group-hover:scale-105 transition">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="text-[12px] font-bold">{label}</div>
      <div className="text-[10.5px] text-muted-foreground">{hint}</div>
    </button>
  );
}

function VideoSourceHub() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("popularity");
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(VIDEO_PROVIDERS.map(p => [p.id, !p.soon && ["pexels","pixabay"].includes(p.id)]))
  );
  const [order, setOrder] = useState<string[]>(FALLBACK_DEFAULT);
  const [dragId, setDragId] = useState<string | null>(null);

  const activeCount = Object.values(enabled).filter(Boolean).length;
  const connectedCount = VIDEO_PROVIDERS.filter(p => !p.soon && enabled[p.id]).length;

  const list = useMemo(() => {
    let arr = VIDEO_PROVIDERS.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.desc.toLowerCase().includes(query.toLowerCase())) return false;
      switch (filter) {
        case "active":    return !p.soon;
        case "connected": return !p.soon && enabled[p.id];
        case "video":     return p.kind === "video" || p.kind === "both";
        case "image":     return p.kind === "image" || p.kind === "both";
        case "ai":        return p.cat === "ai";
        case "free":      return !!p.free;
        default:          return true;
      }
    });
    arr = [...arr].sort((a, b) => {
      switch (sort) {
        case "free":    return Number(!!b.free) - Number(!!a.free) || (b.popularity ?? 0) - (a.popularity ?? 0);
        case "quality": return (b.quality ?? 0) - (a.quality ?? 0);
        case "recent":  return (b.addedAt ?? "").localeCompare(a.addedAt ?? "");
        default:        return (b.popularity ?? 0) - (a.popularity ?? 0);
      }
    });
    return arr;
  }, [query, filter, sort, enabled]);

  const setAll = (on: boolean) =>
    setEnabled(prev => {
      const next = { ...prev };
      for (const p of VIDEO_PROVIDERS) if (!p.soon) next[p.id] = on;
      return next;
    });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder(o => {
      const a = [...o];
      const [it] = a.splice(from, 1);
      a.splice(to, 0, it);
      return a;
    });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = order.indexOf(dragId);
    const to = order.indexOf(targetId);
    if (from === -1 || to === -1) return;
    move(from, to);
    setDragId(null);
  };

  const filters: { key: FilterKey; label: string; icon: any }[] = [
    { key: "all",       label: "All",            icon: Globe },
    { key: "active",    label: "Only Active",    icon: Power },
    { key: "connected", label: "Only Connected", icon: ShieldCheck },
    { key: "video",     label: "Only Video",     icon: Video },
    { key: "image",     label: "Only Images",    icon: ImageIcon },
    { key: "ai",        label: "Only AI",        icon: Bot },
    { key: "free",      label: "Only Free",      icon: Sparkles },
  ];

  return (
    <SectionCard
      title="Video Source APIs"
      subtitle="Stock, AI and social providers used to assemble your B-roll."
      right={
        <div className="flex items-center gap-1.5">
          <Pill tone="success"><Power className="w-3 h-3" /> {connectedCount} connected</Pill>
          <Pill tone="primary">{activeCount} enabled</Pill>
          <Pill tone="default">{VIDEO_PROVIDERS.length} total</Pill>
        </div>
      }
    >
      <div className="pt-4 space-y-4">
        {/* SEARCH + SORT */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search providers (Pexels, Runway, NASA…)"
              className="!pl-9 !h-10 !text-[12.5px]"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 h-10 rounded-xl border border-border bg-card">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="bg-transparent text-[12px] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="popularity">Sort: Popularity</option>
              <option value="free">Sort: Free Quota</option>
              <option value="quality">Sort: Quality</option>
              <option value="recent">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map(f => {
            const active = filter === f.key;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-8 px-3 rounded-lg border text-[11.5px] font-bold flex items-center gap-1.5 transition ${active ? "border-primary/40 bg-accent text-primary" : "border-border bg-card hover:bg-secondary"}`}
              >
                <Icon className="w-3 h-3" /> {f.label}
              </button>
            );
          })}
        </div>

        {/* BULK ACTIONS */}
        <div className="rounded-xl border border-border bg-secondary/30 p-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10.5px] font-bold tracking-[0.12em] text-muted-foreground uppercase mr-1">Bulk</span>
          <BulkBtn icon={Power}     onClick={() => setAll(true)}>Enable All</BulkBtn>
          <BulkBtn icon={PowerOff}  onClick={() => setAll(false)}>Disable All</BulkBtn>
          <BulkBtn icon={Plug}>Test All</BulkBtn>
          <BulkBtn icon={RefreshCw}>Refresh Usage</BulkBtn>
          <BulkBtn icon={Upload}>Import Keys</BulkBtn>
          <BulkBtn icon={Download}>Export Keys</BulkBtn>
          <div className="ml-auto flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <Lock className="w-3 h-3" /> Keys masked & stored in encrypted vault
          </div>
        </div>

        {/* PROVIDER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map(v => <VideoProviderCard key={v.id} v={v} enabled={!!enabled[v.id]} onToggle={() => setEnabled(s => ({ ...s, [v.id]: !s[v.id] }))} />)}
          {list.length === 0 && (
            <div className="md:col-span-2 p-8 text-center rounded-xl border border-dashed border-border text-[12px] text-muted-foreground">
              <CircleDashed className="w-5 h-5 mx-auto mb-2 opacity-60" />
              No providers match these filters.
            </div>
          )}
        </div>

        {/* FALLBACK ORDER */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-display font-bold text-[13.5px] flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-primary" /> Fallback Priority
              </div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                Drag to reorder. If a provider returns no results, the backend automatically tries the next one.
              </div>
            </div>
            <button onClick={() => setOrder(FALLBACK_DEFAULT)} className="h-7 px-2.5 rounded-md border border-border text-[10.5px] font-bold hover:bg-secondary flex items-center gap-1 shrink-0">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="space-y-1.5">
            {order.map((id, i) => {
              const p = VIDEO_PROVIDERS.find(x => x.id === id);
              if (!p) return null;
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => setDragId(id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border bg-card hover:border-primary/30 transition cursor-grab active:cursor-grabbing ${dragId === id ? "border-primary/40 bg-accent" : "border-border"}`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  <div className="w-6 h-6 rounded-md bg-brand-gradient text-white text-[11px] font-display font-extrabold grid place-items-center shrink-0">{i + 1}</div>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.tint} grid place-items-center text-white font-display font-extrabold text-[9.5px] shrink-0`}>{p.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold truncate">{p.name}</div>
                    <div className="text-[10.5px] text-muted-foreground truncate">{p.desc}</div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <IconBtn onClick={() => move(i, i - 1)} title="Move up">↑</IconBtn>
                    <IconBtn onClick={() => move(i, i + 1)} title="Move down">↓</IconBtn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function BulkBtn({ icon: Icon, children, onClick }: { icon: any; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="h-8 px-2.5 rounded-lg border border-border bg-card text-[11.5px] font-bold hover:bg-secondary hover:border-primary/30 transition flex items-center gap-1.5">
      <Icon className="w-3 h-3" /> {children}
    </button>
  );
}

function VideoProviderCard({ v, enabled, onToggle }: { v: VideoProv; enabled: boolean; onToggle: () => void }) {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(v.soon ? "" : "•••• •••• •••• 8jL2");
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const connected = !v.soon && enabled && key.length > 0;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(key); setCopied(true); setTimeout(() => setCopied(false), 1100); } catch {}
  };
  const handleTest = () => {
    setTesting("loading");
    setTimeout(() => setTesting(Math.random() > 0.15 ? "ok" : "err"), 900);
  };

  const catLabel: Record<ProviderCat, string> = { free: "Free", ai: "AI", future: "Social" };
  const kindIcon = v.kind === "image" ? ImageIcon : v.kind === "both" ? Globe : Video;
  const KindIcon = kindIcon;

  return (
    <div className={`p-4 rounded-2xl border bg-card transition ${v.soon ? "border-dashed border-border opacity-80" : "border-border hover:border-primary/20"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.tint} grid place-items-center text-white font-display font-extrabold text-[11px] shrink-0`}>
          {v.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="font-display font-bold text-[14px]">{v.name}</div>
            {v.soon
              ? <Pill tone="default">Coming Soon</Pill>
              : connected ? <Pill tone="success"><ShieldCheck className="w-3 h-3" /> Verified</Pill>
              : <Pill tone="warning">Not Connected</Pill>}
            <Pill tone={v.cat === "ai" ? "primary" : v.cat === "future" ? "default" : "success"}>
              <KindIcon className="w-3 h-3" /> {catLabel[v.cat]}
            </Pill>
            {v.free && <Pill tone="success">Free</Pill>}
          </div>
          <div className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{v.desc}</div>
        </div>
        {!v.soon && <Toggle checked={connected} onChange={onToggle} />}
      </div>

      {!v.soon && (
        <>
          {/* API KEY */}
          <div className="relative mb-2">
            <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Paste API key"
              className="!h-9 !pl-9 !pr-20 !text-[12px] font-mono"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
              <IconBtn onClick={() => setShow(s => !s)} title={show ? "Hide key" : "Show key"}>
                {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </IconBtn>
              <IconBtn onClick={handleCopy} title="Copy key">
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </IconBtn>
            </div>
          </div>

          {/* HEALTH GRID */}
          <div className="grid grid-cols-4 gap-1.5 mb-2.5">
            <Meta label="Status" value={connected ? "Online" : "Idle"} tone={connected ? "success" : "muted"} />
            <Meta label="Latency" value={v.latencyMs ? `${v.latencyMs}ms` : "—"} />
            <Meta label="API" value={v.apiVersion ?? "—"} />
            <Meta label="Limit" value={v.dailyLimit ?? "—"} />
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            <Meta label="Remaining" value={v.remaining ?? "—"} tone="primary" />
            <Meta label="Monthly" value={v.monthly ?? "—"} />
            <Meta label="Checked" value={v.lastChecked ?? "—"} />
          </div>

          {/* NOTES */}
          <input
            defaultValue={v.notes ?? ""}
            placeholder="Add a note for this provider…"
            className="w-full bg-transparent text-[11px] placeholder:text-muted-foreground focus:outline-none border-b border-transparent focus:border-border py-1 mb-2"
          />

          {/* ACTIONS */}
          <div className="flex items-center justify-between gap-2">
            <a
              href={v.docUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Documentation
            </a>
            <button
              onClick={handleTest}
              disabled={testing === "loading"}
              className={`h-8 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                testing === "ok" ? "bg-success/10 text-success border border-success/20" :
                testing === "err" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                testing === "loading" ? "bg-secondary text-muted-foreground border border-border" :
                "border border-border hover:bg-secondary"
              }`}
            >
              {testing === "loading" ? <><RefreshCw className="w-3 h-3 animate-spin" /> Testing…</> :
               testing === "ok"      ? <><CircleCheck className="w-3 h-3" /> 200 OK</> :
               testing === "err"     ? <><CircleAlert className="w-3 h-3" /> Failed</> :
                                       <><Plug className="w-3 h-3" /> Test Connection</>}
            </button>
          </div>
        </>
      )}

      {v.soon && (
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-muted-foreground italic">
            Integration in progress — early access available.
          </div>
          {v.docUrl && (
            <a href={v.docUrl} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Docs
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, tone = "default" }: { label: string; value: React.ReactNode; tone?: "default" | "success" | "primary" | "muted" }) {
  const toneCls =
    tone === "success" ? "text-success" :
    tone === "primary" ? "text-primary" :
    tone === "muted"   ? "text-muted-foreground" : "text-foreground";
  return (
    <div className="px-2 py-1.5 rounded-lg bg-secondary/50 border border-border/40">
      <div className="text-[9px] font-bold tracking-[0.1em] text-muted-foreground uppercase">{label}</div>
      <div className={`text-[11px] font-mono font-bold mt-0.5 truncate ${toneCls}`}>{value}</div>
    </div>
  );
}

/* ---------------------------- API Management ---------------------------- */

type SavedKey = { id: string; name: string; key: string; notes: string; active: boolean; usage: string };

function ApiManagementCard() {
  const [keys, setKeys] = useState<SavedKey[]>([
    { id: "k1", name: "Production",    key: "sk-prod-aHb2k••••3xN9q",  notes: "Main account · billed monthly", active: true,  usage: "7.2M / 10M tokens" },
    { id: "k2", name: "Staging",       key: "sk-stage-LJ22••••mPq8",   notes: "Used by dev team for previews", active: false, usage: "240k / 1M tokens"  },
    { id: "k3", name: "Personal Test", key: "sk-test-A2vB••••9zX1",    notes: "Sandbox key, no spending cap",  active: false, usage: "12k / 100k tokens" },
  ]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const setActive = (id: string) => setKeys(ks => ks.map(k => ({ ...k, active: k.id === id })));
  const remove = (id: string) => setKeys(ks => ks.filter(k => k.id !== id));
  const add = () => {
    if (!newName || !newKey) return;
    setKeys(ks => [...ks, { id: crypto.randomUUID(), name: newName, key: newKey, notes: "", active: false, usage: "—" }]);
    setNewName(""); setNewKey(""); setAdding(false);
  };
  const saveRename = (id: string) => {
    setKeys(ks => ks.map(k => k.id === id ? { ...k, name: editName || k.name } : k));
    setEditing(null);
  };

  return (
    <SectionCard
      title="API Key Management"
      subtitle="Add multiple keys, label them and switch the active one without redeploying."
      right={
        <button onClick={() => setAdding(s => !s)} className="h-8 px-3 rounded-lg bg-brand-gradient text-white text-[11.5px] font-bold shadow-brand flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> Add Key
        </button>
      }
    >
      <div className="pt-4 space-y-2">
        {adding && (
          <div className="p-3 rounded-xl border border-dashed border-primary/40 bg-accent/30 space-y-2 animate-in slide-in-from-top-1">
            <div className="grid grid-cols-2 gap-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Label (e.g. Production)" className="!h-9 !text-[12px]" />
              <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="sk-…" className="!h-9 !text-[12px] font-mono" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="h-8 px-3 rounded-lg text-[11.5px] font-semibold text-muted-foreground hover:bg-secondary">Cancel</button>
              <button onClick={add} className="h-8 px-3 rounded-lg bg-brand-gradient text-white text-[11.5px] font-bold shadow-brand">Save key</button>
            </div>
          </div>
        )}

        {keys.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-border">
            <KeyRound className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <div className="text-[13px] font-semibold">No keys saved yet</div>
            <div className="text-[11.5px] text-muted-foreground mt-0.5">Add your first API key to begin using this provider.</div>
          </div>
        )}

        {keys.map(k => (
          <div key={k.id} className={`p-3.5 rounded-xl border transition ${k.active ? "border-primary/40 bg-accent/30" : "border-border bg-card hover:border-primary/20"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${k.active ? "bg-brand-gradient text-white shadow-brand" : "bg-secondary text-muted-foreground"}`}>
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {editing === k.id ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => saveRename(k.id)}
                      onKeyDown={e => e.key === "Enter" && saveRename(k.id)}
                      autoFocus
                      className="text-[13px] font-bold px-2 py-0.5 rounded-md border border-primary/40 bg-card focus:outline-none"
                    />
                  ) : (
                    <span className="text-[13px] font-bold">{k.name}</span>
                  )}
                  {k.active && <Pill tone="primary"><Check className="w-3 h-3" /> Active</Pill>}
                </div>
                <div className="text-[11.5px] text-muted-foreground font-mono mt-0.5 truncate">{k.key}</div>
                <input
                  defaultValue={k.notes}
                  placeholder="Add a note…"
                  className="mt-1.5 w-full bg-transparent text-[11.5px] placeholder:text-muted-foreground focus:outline-none border-b border-transparent focus:border-border py-0.5"
                />
                <div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {k.usage}</span>
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Last used 4h ago</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {!k.active && (
                  <button onClick={() => setActive(k.id)} className="h-7 px-2.5 rounded-md bg-brand-gradient text-white text-[10.5px] font-bold shadow-brand">
                    Set Active
                  </button>
                )}
                <div className="flex items-center gap-0.5">
                  <IconBtn onClick={() => navigator.clipboard.writeText(k.key)} title="Copy"><Copy className="w-3 h-3" /></IconBtn>
                  <IconBtn onClick={() => { setEditing(k.id); setEditName(k.name); }} title="Rename"><Pencil className="w-3 h-3" /></IconBtn>
                  <IconBtn onClick={() => remove(k.id)} title="Delete"><Trash2 className="w-3 h-3 text-destructive" /></IconBtn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
