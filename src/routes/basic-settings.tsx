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
  Wifi, Clock, Zap, Info,
} from "lucide-react";
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
  { id: "gemini", name: "Gemini", initials: "GM", tint: "from-sky-500 to-blue-600", baseUrl: "https://generativelanguage.googleapis.com/v1beta", endpoint: "/models/{model}:generateContent", badge: "Popular", models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.0-pro"] },
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

type VideoProv = {
  id: string; name: string; tint: string; initials: string; soon?: boolean;
  desc: string; usage?: string;
};
const VIDEO_PROVIDERS: VideoProv[] = [
  { id: "pexels", name: "Pexels", initials: "PX", tint: "from-emerald-500 to-teal-700", desc: "Free curated stock footage at up to 4K.", usage: "184 / 200 hr" },
  { id: "pixabay", name: "Pixabay", initials: "PB", tint: "from-lime-500 to-green-700", desc: "Royalty-free clips and B-roll, no attribution.", usage: "4.6k / 5k day" },
  { id: "coverr", name: "Coverr", initials: "CR", tint: "from-sky-500 to-blue-700", desc: "Cinematic background loops for hero scenes.", usage: "—" },
  { id: "unsplash", name: "Unsplash Video", initials: "UN", tint: "from-zinc-600 to-slate-800", desc: "High-quality vertical reels and stills.", soon: true },
  { id: "mixkit", name: "Mixkit", initials: "MX", tint: "from-rose-500 to-pink-700", desc: "Curated motion clips for marketing.", soon: true },
  { id: "videvo", name: "Videvo", initials: "VD", tint: "from-indigo-500 to-violet-700", desc: "Large catalog of 4K stock & motion graphics.", soon: true },
  { id: "freepik", name: "Freepik Video", initials: "FP", tint: "from-amber-500 to-orange-700", desc: "AI-generated and licensed creator footage.", soon: true },
];

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
          <SectionCard
            title="Video Source APIs"
            subtitle="Stock footage providers used to assemble your B-roll."
            right={<Pill tone="success">{VIDEO_PROVIDERS.filter(v => !v.soon).length} active</Pill>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
              {VIDEO_PROVIDERS.map(v => <VideoProviderCard key={v.id} v={v} />)}
            </div>
          </SectionCard>

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

function VideoProviderCard({ v }: { v: VideoProv }) {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(v.soon ? "" : "•••• •••• •••• 8jL2");
  const connected = !v.soon && key.length > 0;
  return (
    <div className={`p-4 rounded-2xl border bg-card transition ${v.soon ? "border-dashed border-border opacity-75" : "border-border hover:border-primary/20"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.tint} grid place-items-center text-white font-display font-extrabold text-[11px] shrink-0`}>
          {v.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display font-bold text-[14px]">{v.name}</div>
            {v.soon
              ? <Pill tone="default">Coming Soon</Pill>
              : connected ? <Pill tone="success"><Check className="w-3 h-3" /> Connected</Pill>
              : <Pill tone="warning">Not Connected</Pill>}
          </div>
          <div className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{v.desc}</div>
        </div>
        {!v.soon && <Toggle checked={connected} />}
      </div>

      {!v.soon && (
        <>
          <div className="relative mb-2">
            <Input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Paste API key"
              className="!h-9 !pr-16 !text-[12px] font-mono"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
              <IconBtn onClick={() => setShow(s => !s)} title={show ? "Hide" : "Show"}>
                {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </IconBtn>
              <IconBtn onClick={() => navigator.clipboard.writeText(key)} title="Copy"><Copy className="w-3 h-3" /></IconBtn>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] text-muted-foreground">
              Usage: <span className="font-mono font-semibold text-foreground">{v.usage}</span>
            </div>
            <button className="h-8 px-3 rounded-lg border border-border text-[11px] font-bold hover:bg-secondary flex items-center gap-1">
              <Plug className="w-3 h-3" /> Test
            </button>
          </div>
        </>
      )}

      {v.soon && (
        <div className="text-[11px] text-muted-foreground italic">
          Integration in progress — join the early access list to get notified.
        </div>
      )}
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
