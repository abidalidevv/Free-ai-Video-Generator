import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AppShell, PageHeader, SectionCard, Field, Select, Toggle, Slider, Pill,
  PrimaryButton, GhostButton, Card,
} from "@/components/app-shell";
import {
  Film, Shuffle, Wand2, Sparkles, Star, Clock, Hash, Cpu, Gauge, Layers,
  Image as ImageIcon, Search, ArrowRight, Play, Check, X, Info, Save,
  Smartphone, Monitor, Square, ChevronRight, Brain, Filter, Repeat, Zap,
  Tv, Activity, FileVideo, Settings2, Eye, Plus, ListChecks, AlertCircle,
  Lock, CloudUpload, Crown, BadgeCheck, Maximize2, FileText,
} from "lucide-react";

export const Route = createFileRoute("/video-settings")({
  head: () => ({
    meta: [
      { title: "Video Settings — VideoForge AI" },
      { name: "description", content: "Configure stock video sources, transitions, format, encoder and rendering quality." },
    ],
  }),
  component: VideoSettingsPage,
});

/* ============ Data ============ */

type ProviderStatus = "connected" | "available" | "soon";
const PROVIDERS: {
  id: string; name: string; logo: string; tint: string; status: ProviderStatus;
  quality: string; recommended?: boolean; future?: boolean;
}[] = [
  { id: "pexels",   name: "Pexels",        logo: "Px", tint: "from-teal-500/15 to-emerald-500/15 text-teal-700",     status: "connected", quality: "4K · HDR", recommended: true },
  { id: "pixabay",  name: "Pixabay",       logo: "Pb", tint: "from-lime-500/15 to-green-500/15 text-green-700",      status: "connected", quality: "1080p" },
  { id: "coverr",   name: "Coverr",        logo: "Co", tint: "from-violet-500/15 to-fuchsia-500/15 text-violet-700", status: "available", quality: "1080p" },
  { id: "local",    name: "Local Files",   logo: "Lo", tint: "from-slate-500/15 to-zinc-500/15 text-slate-700",      status: "available", quality: "Any" },
  { id: "tiktok",   name: "TikTok",        logo: "Tk", tint: "from-pink-500/15 to-rose-500/15 text-rose-700",        status: "soon", quality: "1080p" },
  { id: "bilibili", name: "Bilibili",      logo: "Bi", tint: "from-sky-500/15 to-cyan-500/15 text-sky-700",          status: "soon", quality: "1080p" },
  { id: "xhs",      name: "Xiaohongshu",   logo: "Xh", tint: "from-red-500/15 to-rose-500/15 text-red-700",          status: "soon", quality: "1080p" },
  { id: "mixkit",   name: "Mixkit",        logo: "Mx", tint: "from-yellow-500/15 to-amber-500/15 text-amber-700",    status: "soon", quality: "4K", future: true },
  { id: "unsplash", name: "Unsplash Video",logo: "Un", tint: "from-neutral-500/15 to-stone-500/15 text-neutral-700", status: "soon", quality: "4K", future: true },
  { id: "videvo",   name: "Videvo",        logo: "Vv", tint: "from-blue-500/15 to-indigo-500/15 text-blue-700",      status: "soon", quality: "4K", future: true },
  { id: "freepik",  name: "Freepik Video", logo: "Fp", tint: "from-cyan-500/15 to-sky-500/15 text-cyan-700",         status: "soon", quality: "4K", future: true },
  { id: "story",    name: "Storyblocks",   logo: "Sb", tint: "from-purple-500/15 to-violet-500/15 text-purple-700",  status: "soon", quality: "4K", future: true },
  { id: "motion",   name: "Motion Array",  logo: "Ma", tint: "from-orange-500/15 to-amber-500/15 text-orange-700",   status: "soon", quality: "4K", future: true },
];

type TransitionItem = { id: string; name: string; duration: string; direction: string; soon?: boolean; current?: boolean };
const TRANSITIONS: TransitionItem[] = [
  { id: "none",    name: "None",      duration: "0.0s", direction: "—",     current: true },
  { id: "shuffle", name: "Shuffle",   duration: "0.5s", direction: "Random",current: true },
  { id: "fadein",  name: "Fade In",   duration: "0.5s", direction: "In",    current: true },
  { id: "fadeout", name: "Fade Out",  duration: "0.5s", direction: "Out",   current: true },
  { id: "slidein", name: "Slide In",  duration: "0.4s", direction: "→",     current: true },
  { id: "slideout",name: "Slide Out", duration: "0.4s", direction: "←",     current: true },
  { id: "cross",   name: "Cross Fade",duration: "0.6s", direction: "Both",  soon: true },
  { id: "zoom",    name: "Zoom",      duration: "0.5s", direction: "In/Out",soon: true },
  { id: "flash",   name: "Flash",     duration: "0.2s", direction: "Pulse", soon: true },
  { id: "push",    name: "Push",      duration: "0.5s", direction: "→",     soon: true },
  { id: "whip",    name: "Whip",      duration: "0.3s", direction: "Pan",   soon: true },
  { id: "spin",    name: "Spin",      duration: "0.6s", direction: "360°",  soon: true },
  { id: "blur",    name: "Blur",      duration: "0.5s", direction: "Soft",  soon: true },
  { id: "filmburn",name: "Film Burn", duration: "0.8s", direction: "Warm",  soon: true },
  { id: "motion",  name: "Motion Blur",duration: "0.4s",direction: "Move",  soon: true },
  { id: "rgb",     name: "RGB Split", duration: "0.4s", direction: "Chroma",soon: true },
  { id: "light",   name: "Light Leak",duration: "0.7s", direction: "Warm",  soon: true },
  { id: "glitch",  name: "Glitch",    duration: "0.3s", direction: "Digital",soon: true },
  { id: "stretch", name: "Stretch",   duration: "0.5s", direction: "Scale", soon: true },
];

const ASPECTS = [
  { id: "9:16", title: "Portrait", sub: "9:16",  use: "Reels · TikTok · Shorts", w: 60,  h: 106, icon: Smartphone, recommended: true },
  { id: "16:9", title: "Landscape", sub: "16:9", use: "YouTube · Vimeo",         w: 142, h: 80,  icon: Monitor },
  { id: "1:1",  title: "Square",    sub: "1:1",  use: "Instagram Feed",          w: 96,  h: 96,  icon: Square, soon: true },
];

const ENCODERS = [
  { id: "libx264",  name: "libx264 (CPU)",       sub: "Most compatible",        status: "available", tone: "default" },
  { id: "nvenc",    name: "NVIDIA NVENC",        sub: "RTX 4070 detected",      status: "ready",     tone: "success" },
  { id: "qsv",      name: "Intel Quick Sync",    sub: "Not detected",           status: "missing",   tone: "danger" },
  { id: "amf",      name: "AMD AMF",             sub: "Not detected",           status: "missing",   tone: "danger" },
  { id: "auto",     name: "Auto Detect",         sub: "Pick best at render",    status: "smart",     tone: "primary" },
];

const VIDEO_EFFECTS = [
  "Cinematic","HDR","Vintage","Dream","Noir","Warm","Cold","Anime","Cyberpunk","Film","Luxury","Golden Hour","Black & White",
];

const VIDEO_LENGTHS = ["30 sec","45 sec","60 sec","90 sec","2 min","3 min","5 min","10 min"];

/* ============ Page ============ */

function VideoSettingsPage() {
  const [source, setSource] = useState("pexels");
  const [concat, setConcat] = useState<"sequential" | "random">("random");
  const [aspect, setAspect] = useState("9:16");
  const [transition, setTransition] = useState("fadein");
  const [favorites, setFavorites] = useState<string[]>(["fadein", "slidein"]);
  const [clipDuration, setClipDuration] = useState(5);
  const [videoLength, setVideoLength] = useState("60 sec");
  const [videosCount, setVideosCount] = useState(1);
  const [matchOrder, setMatchOrder] = useState(true);
  const [encoder, setEncoder] = useState("nvenc");
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("30");
  const [bitrate, setBitrate] = useState("Auto");
  const [enableOverlay, setEnableOverlay] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");
  const [transitionFilter, setTransitionFilter] = useState<"all" | "current" | "favorites">("all");

  const lengthSeconds = useMemo(() => {
    const v = videoLength.includes("min") ? parseInt(videoLength) * 60 : parseInt(videoLength);
    return v;
  }, [videoLength]);
  const clipCount = Math.max(1, Math.round(lengthSeconds / clipDuration));
  const renderMinutes = Math.max(1, Math.round((clipCount * (resolution === "1080p" ? 1.6 : 1) * videosCount) / 6));
  const outputSizeMb = Math.round(lengthSeconds * (resolution === "1080p" ? 4.5 : 9) * videosCount);
  const estCost = (videosCount * (lengthSeconds / 60) * 0.18).toFixed(2);

  const filteredProviders = PROVIDERS.filter(p =>
    p.name.toLowerCase().includes(providerSearch.toLowerCase()),
  );
  const filteredTransitions = TRANSITIONS.filter(t => {
    if (transitionFilter === "current") return t.current;
    if (transitionFilter === "favorites") return favorites.includes(t.id);
    return true;
  });

  const toggleFav = (id: string) =>
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const selectedProvider = PROVIDERS.find(p => p.id === source);
  const selectedTransition = TRANSITIONS.find(t => t.id === transition);
  const selectedAspect = ASPECTS.find(a => a.id === aspect);

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Create Video", "Video Settings"]}
        title="Video Settings"
        subtitle="Control how AI selects, downloads and renders stock videos for your script."
        actions={
          <>
            <div className="hidden md:flex items-center gap-2 text-[11.5px] text-muted-foreground px-3 py-2 rounded-xl bg-card border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="font-semibold text-foreground">Draft saved</span>
              <span>· just now</span>
            </div>
            <GhostButton><Eye className="w-4 h-4" /> Preview</GhostButton>
            <PrimaryButton><Save className="w-4 h-4" /> Save settings</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* MAIN COLUMN */}
        <div className="col-span-12 xl:col-span-8 space-y-6">

          {/* SECTION 1 — Source */}
          <SectionCard
            title="Video Source"
            subtitle="Where AI fetches stock footage to match your script."
            right={
              <>
                <Pill tone="primary"><Film className="w-3 h-3" /> {selectedProvider?.name}</Pill>
                <Pill tone="success"><Check className="w-3 h-3" /> Connected</Pill>
              </>
            }
          >
            <div className="flex items-center gap-3 mt-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={providerSearch}
                  onChange={e => setProviderSearch(e.target.value)}
                  placeholder="Search providers…"
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                />
              </div>
              <Select value={source} onChange={e => setSource(e.target.value)} className="w-[220px]">
                {PROVIDERS.filter(p => p.status !== "soon").map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.recommended ? " (Default)" : ""}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProviders.map(p => {
                const isSelected = source === p.id;
                const disabled = p.status === "soon";
                return (
                  <button
                    key={p.id}
                    disabled={disabled}
                    onClick={() => setSource(p.id)}
                    className={`group relative text-left p-4 rounded-2xl border transition-all
                      ${isSelected ? "border-primary/40 bg-accent/40 shadow-brand" : "border-border bg-card hover:border-primary/20 hover:shadow-card-lg hover:-translate-y-0.5"}
                      ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.tint} grid place-items-center font-display font-extrabold text-[14px] shrink-0`}>
                        {p.logo}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <div className="font-display font-bold text-[13.5px] truncate">{p.name}</div>
                          {p.recommended && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground mt-0.5 font-mono">{p.quality}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-gradient grid place-items-center shrink-0">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {p.status === "connected" && <Pill tone="success"><Check className="w-3 h-3" /> API Connected</Pill>}
                      {p.status === "available" && <Pill tone="primary">Available</Pill>}
                      {p.status === "soon" && <Pill tone="warning"><Clock className="w-3 h-3" /> Soon</Pill>}
                      {p.recommended && <Pill tone="primary"><Star className="w-3 h-3" /> Recommended</Pill>}
                      {p.future && <Pill tone="default">Future</Pill>}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* SECTION 2 — Assembly */}
          <SectionCard title="Video Assembly" subtitle="How clips are sequenced into the final timeline.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {[
                { id: "sequential", name: "Sequential Concatenation", desc: "Clips appear in the exact order returned by the source. Predictable & easy to debug.", icon: ListChecks, viz: [1,2,3,4] },
                { id: "random", name: "Random Concatenation", desc: "Clips are shuffled for a livelier, more natural-feeling montage. Best for short-form.", icon: Shuffle, viz: [3,1,4,2], recommended: true },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setConcat(opt.id as "sequential" | "random")}
                  className={`text-left p-5 rounded-2xl border transition
                    ${concat === opt.id ? "border-primary/40 bg-accent/40 shadow-brand" : "border-border bg-card hover:border-primary/20"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white grid place-items-center shrink-0">
                      <opt.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-display font-bold text-[14px]">{opt.name}</div>
                        {opt.recommended && <Pill tone="primary"><Star className="w-3 h-3" /> Recommended</Pill>}
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{opt.desc}</div>
                      <div className="flex items-center gap-1.5 mt-3">
                        {opt.viz.map((n, i) => (
                          <div key={i} className="flex-1 h-7 rounded-md bg-secondary border border-border text-[10px] font-bold grid place-items-center text-muted-foreground">
                            Clip {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 3 — Transitions */}
          <SectionCard
            title="Video Transitions"
            subtitle="Pick the transition applied between every clip."
            right={
              <div className="flex items-center gap-1.5">
                {(["all","current","favorites"] as const).map(f => (
                  <button
                    key={f}
                    onClick={(e) => { e.stopPropagation(); setTransitionFilter(f); }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition capitalize
                      ${transitionFilter === f ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >{f}</button>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              {filteredTransitions.map(t => {
                const sel = transition === t.id;
                const fav = favorites.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`group relative rounded-2xl overflow-hidden border transition cursor-pointer
                      ${sel ? "border-primary/40 shadow-brand" : "border-border hover:border-primary/20 hover:shadow-card-lg"}
                      ${t.soon ? "opacity-80" : ""}`}
                    onClick={() => !t.soon && setTransition(t.id)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 via-secondary to-accent/40 grid place-items-center overflow-hidden">
                      <div className="absolute inset-0 opacity-60">
                        <div className="absolute inset-y-2 left-2 w-[40%] rounded-md bg-brand-gradient/80" />
                        <div className="absolute inset-y-2 right-2 w-[40%] rounded-md bg-foreground/15 backdrop-blur-sm" />
                      </div>
                      <div className="relative w-9 h-9 rounded-full bg-white/90 grid place-items-center shadow-card-lg group-hover:scale-110 transition">
                        <Play className="w-3.5 h-3.5 text-primary ml-0.5" fill="currentColor" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFav(t.id); }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-lg grid place-items-center transition
                          ${fav ? "bg-amber-400 text-white" : "bg-card/80 text-muted-foreground hover:text-amber-500"}`}
                      >
                        <Star className="w-3.5 h-3.5" fill={fav ? "currentColor" : "none"} />
                      </button>
                      {t.soon && (
                        <div className="absolute top-2 left-2">
                          <Pill tone="warning"><Lock className="w-3 h-3" /> Soon</Pill>
                        </div>
                      )}
                      {sel && (
                        <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-brand-gradient grid place-items-center">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-card">
                      <div className="font-display font-bold text-[12.5px] flex items-center justify-between">
                        {t.name}
                        {t.id === "shuffle" && <Repeat className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10.5px] text-muted-foreground font-mono">
                        <span>{t.duration}</span>
                        <span>{t.direction}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* SECTION 4 — Format */}
          <SectionCard title="Video Format" subtitle="Aspect ratio of the final exported video.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {ASPECTS.map(a => {
                const sel = aspect === a.id;
                return (
                  <button
                    key={a.id}
                    disabled={a.soon}
                    onClick={() => setAspect(a.id)}
                    className={`relative p-5 rounded-2xl border transition text-left
                      ${sel ? "border-primary/40 bg-accent/40 shadow-brand" : "border-border bg-card hover:border-primary/20"}
                      ${a.soon ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-center h-[120px]">
                      <div
                        style={{ width: a.w, height: a.h }}
                        className={`rounded-lg border-2 grid place-items-center bg-gradient-to-br
                          ${sel ? "border-primary bg-brand-gradient text-white" : "border-border bg-secondary"}`}
                      >
                        <a.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="font-display font-bold text-[13.5px]">{a.title}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono">{a.sub} · {a.use}</div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {a.recommended && <Pill tone="primary"><Star className="w-3 h-3" /> Default</Pill>}
                        {a.soon && <Pill tone="warning"><Lock className="w-3 h-3" /> Soon</Pill>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* SECTION 5 — Clip Settings */}
          <SectionCard title="Clip Settings" subtitle="Length, duration and quantity of generated videos.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              <div className="md:col-span-3">
                <Field label="Maximum Clip Duration" hint={`Each scene caps at this length · ~${clipCount} clips estimated`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider value={clipDuration} min={1} max={10} onChange={setClipDuration} />
                      <div className="flex justify-between text-[10.5px] text-muted-foreground font-mono mt-1.5">
                        <span>1s</span><span>5s</span><span>10s</span>
                      </div>
                    </div>
                    <div className="w-20 h-12 rounded-xl bg-brand-gradient text-white grid place-items-center font-display font-extrabold text-[18px] shadow-brand">
                      {clipDuration}s
                    </div>
                  </div>
                </Field>
              </div>

              <Field label="Video Length" hint={`Est. render ~${renderMinutes} min`}>
                <Select value={videoLength} onChange={e => setVideoLength(e.target.value)}>
                  {VIDEO_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>

              <Field label="Number of Videos" hint={`Estimated cost · $${estCost}`}>
                <Select value={String(videosCount)} onChange={e => setVideosCount(+e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} video{n>1?"s":""}</option>)}
                </Select>
              </Field>

              <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 text-[11.5px] font-semibold text-foreground">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Estimated output
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px]">
                  <div><span className="text-muted-foreground">Clips</span> <span className="font-bold ml-1">{clipCount}</span></div>
                  <div><span className="text-muted-foreground">Size</span> <span className="font-bold ml-1">{outputSizeMb} MB</span></div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 6 — Advanced */}
          <SectionCard title="Advanced Video Settings" subtitle="Encoder and matching strategy." defaultOpen={false}>
            <div className="space-y-5 mt-4">
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                <div>
                  <div className="font-display font-bold text-[13.5px] flex items-center gap-2">
                    Match Materials to Script Order
                    <Pill tone="primary"><Star className="w-3 h-3" /> Smart</Pill>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground mt-1">Keep the order of scenes aligned with the script timeline for consistent narration.</div>
                </div>
                <Toggle checked={matchOrder} onChange={setMatchOrder} />
              </div>

              <Field label="Video Encoder" hint="Choose based on your hardware. Auto Detect picks the fastest path.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ENCODERS.map(e => {
                    const sel = encoder === e.id;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setEncoder(e.id)}
                        className={`text-left p-3.5 rounded-xl border transition
                          ${sel ? "border-primary/40 bg-accent/40" : "border-border bg-card hover:border-primary/20"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5 text-primary" />
                            <span className="font-display font-bold text-[12.5px]">{e.name}</span>
                          </div>
                          {sel && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground mt-1">{e.sub}</div>
                        <div className="mt-2">
                          <Pill tone={e.tone as "default" | "success" | "primary" | "danger"}>
                            {e.status === "ready" && <BadgeCheck className="w-3 h-3" />}
                            {e.status === "missing" && <X className="w-3 h-3" />}
                            {e.status === "smart" && <Zap className="w-3 h-3" />}
                            {e.status === "available" && <Check className="w-3 h-3" />}
                            <span className="capitalize">{e.status}</span>
                          </Pill>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* SMART VIDEO MATCHING */}
          <SectionCard
            title="Smart Video Matching"
            subtitle="AI-powered scene understanding instead of basic keyword matching."
            right={<Pill tone="primary"><Crown className="w-3 h-3" /> Premium</Pill>}
          >
            <div className="mt-4 rounded-2xl bg-brand-gradient-radial p-6 text-white">
              <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wider opacity-80">
                <Brain className="w-3.5 h-3.5" /> Pipeline preview
              </div>
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { icon: FileText, label: "Script" },
                  { icon: Filter, label: "Split Scenes" },
                  { icon: Hash, label: "Scene Keywords" },
                  { icon: Search, label: "Search Videos" },
                  { icon: Brain, label: "Semantic Rank" },
                  { icon: Layers, label: "Timeline" },
                  { icon: Film, label: "Render" },
                ].map((s, i, arr) => (
                  <div key={s.label} className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-2 min-w-[88px]">
                      <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur grid place-items-center border border-white/20">
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div className="text-[10.5px] font-semibold text-center">{s.label}</div>
                    </div>
                    {i < arr.length - 1 && <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* VIDEO QUALITY */}
          <SectionCard title="Video Quality" subtitle="Resolution, frame rate and bitrate for the final export.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              <Field label="Resolution">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "720p", soon: false },
                    { id: "1080p", soon: false },
                    { id: "2K", soon: true },
                    { id: "4K", soon: true },
                  ].map(r => (
                    <button
                      key={r.id}
                      disabled={r.soon}
                      onClick={() => setResolution(r.id)}
                      className={`h-11 rounded-xl border text-[12.5px] font-bold flex flex-col items-center justify-center transition
                        ${resolution === r.id ? "border-primary/40 bg-accent text-primary" : "border-border bg-card hover:border-primary/20"}
                        ${r.soon ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {r.id}
                      {r.soon && <span className="text-[9px] text-muted-foreground font-medium">Soon</span>}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Frame Rate">
                <div className="grid grid-cols-3 gap-2">
                  {["24","30","60"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFps(f)}
                      className={`h-11 rounded-xl border text-[12.5px] font-bold transition
                        ${fps === f ? "border-primary/40 bg-accent text-primary" : "border-border bg-card hover:border-primary/20"}`}
                    >{f} FPS</button>
                  ))}
                </div>
              </Field>
              <Field label="Bitrate">
                <Select value={bitrate} onChange={e => setBitrate(e.target.value)}>
                  {["Auto","Low","Medium","High","Ultra"].map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* OVERLAY PLACEHOLDER */}
          <SectionCard
            title="Overlay Effects"
            subtitle="Composite overlays on top of every clip."
            right={<Pill tone="warning"><Clock className="w-3 h-3" /> Coming in Phase 9</Pill>}
            defaultOpen={false}
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-70 pointer-events-none">
              <Field label="Enable Overlay"><Toggle checked={enableOverlay} onChange={setEnableOverlay} /></Field>
              <Field label="Overlay Library"><Select disabled><option>Choose overlay…</option></Select></Field>
              <Field label="Blend Mode"><Select disabled><option>Normal</option></Select></Field>
              <Field label="Opacity"><Slider value={70} /></Field>
              <Field label="Layer Order"><Select disabled><option>Top</option></Select></Field>
              <Field label="Position"><Select disabled><option>Center</option></Select></Field>
              <Field label="Loop"><Toggle /></Field>
            </div>
          </SectionCard>

          {/* VIDEO EFFECTS PLACEHOLDER */}
          <SectionCard
            title="Video Effects"
            subtitle="Cinematic looks and color grading presets."
            right={<Pill tone="warning"><Lock className="w-3 h-3" /> Reserved</Pill>}
            defaultOpen={false}
          >
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {VIDEO_EFFECTS.map(eff => (
                <div key={eff} className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-secondary via-accent/30 to-secondary grid place-items-center text-center p-2 opacity-80">
                  <div className="absolute inset-0 bg-brand-gradient opacity-10" />
                  <div className="relative">
                    <Sparkles className="w-4 h-4 mx-auto text-primary/70" />
                    <div className="text-[11px] font-bold mt-1.5">{eff}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">Soon</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3">
            <Link to="/create" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground">
              ← Back to Script Studio
            </Link>
            <div className="flex items-center gap-2.5">
              <GhostButton><Save className="w-4 h-4" /> Save as draft</GhostButton>
              <PrimaryButton>Continue <ArrowRight className="w-4 h-4" /></PrimaryButton>
            </div>
          </div>
        </div>

        {/* SIDEBAR — Live Summary */}
        <aside className="col-span-12 xl:col-span-4">
          <div className="sticky top-[88px] space-y-4">
            <Card className="overflow-hidden p-0">
              <div className="p-5 bg-brand-gradient text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider font-semibold opacity-80">Live Summary</div>
                    <div className="font-display font-extrabold text-[18px] mt-1">Render Plan</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="opacity-90">Auto-saving · all changes synced</span>
                </div>
              </div>

              {/* Preview frame */}
              <div className="p-5 border-b border-border">
                <div className="mx-auto bg-foreground rounded-2xl overflow-hidden shadow-card-lg relative grid place-items-center text-white/60"
                     style={{
                       width: aspect === "9:16" ? 168 : aspect === "16:9" ? 280 : 200,
                       height: aspect === "9:16" ? 298 : aspect === "16:9" ? 158 : 200,
                     }}>
                  <div className="absolute inset-3 rounded-xl border border-white/15 grid place-items-center">
                    <div className="text-center">
                      <Play className="w-7 h-7 mx-auto opacity-60" fill="currentColor" />
                      <div className="text-[10px] mt-2 uppercase tracking-wider">{selectedAspect?.sub} · {resolution}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="divide-y divide-border">
                {[
                  { label: "Selected Source",     value: selectedProvider?.name, icon: Film },
                  { label: "Aspect Ratio",        value: `${selectedAspect?.title} · ${selectedAspect?.sub}`, icon: Maximize2 },
                  { label: "Video Length",        value: videoLength, icon: Clock },
                  { label: "Estimated Clips",     value: `${clipCount} clips · ${clipDuration}s each`, icon: Layers },
                  { label: "Transition",          value: selectedTransition?.name, icon: Shuffle },
                  { label: "Resolution",          value: `${resolution} · ${fps} FPS`, icon: Tv },
                  { label: "Encoder",             value: ENCODERS.find(e => e.id === encoder)?.name, icon: Cpu },
                  { label: "Bitrate",             value: bitrate, icon: Gauge },
                ].map((s, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground">
                      <s.icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </div>
                    <div className="text-[12px] font-bold text-right truncate">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="p-5 bg-secondary/40 grid grid-cols-2 gap-3 border-t border-border">
                <div className="rounded-xl bg-card border border-border p-3">
                  <div className="text-[10.5px] text-muted-foreground uppercase tracking-wider">Est. Render</div>
                  <div className="font-display font-extrabold text-[18px] mt-1">{renderMinutes}m</div>
                </div>
                <div className="rounded-xl bg-card border border-border p-3">
                  <div className="text-[10.5px] text-muted-foreground uppercase tracking-wider">Output Size</div>
                  <div className="font-display font-extrabold text-[18px] mt-1">{outputSizeMb} MB</div>
                </div>
              </div>

              <div className="p-4">
                <PrimaryButton className="w-full"><Play className="w-4 h-4" /> Render preview</PrimaryButton>
              </div>
            </Card>

            <Card className="!p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent text-primary grid place-items-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div className="text-[12px] text-muted-foreground leading-relaxed">
                  Settings are <span className="font-semibold text-foreground">compatible with MoneyPrinterTurbo</span>. Field names map 1:1 with the existing backend config.
                </div>
              </div>
            </Card>

            <Card className="!p-4">
              <div className="flex items-center gap-2 text-[11.5px] font-semibold mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-warning" /> Inline checks
              </div>
              <div className="space-y-2 text-[11.5px]">
                {[
                  { ok: true,  msg: "Source connected · API healthy" },
                  { ok: true,  msg: "Encoder ready · NVENC detected" },
                  { ok: clipCount <= 30, msg: `Clip plan reasonable (${clipCount} clips)` },
                  { ok: true,  msg: "Aspect ratio matches template" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {c.ok
                      ? <Check className="w-3.5 h-3.5 text-success" />
                      : <AlertCircle className="w-3.5 h-3.5 text-warning" />}
                    <span className={c.ok ? "text-muted-foreground" : "text-foreground font-medium"}>{c.msg}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
