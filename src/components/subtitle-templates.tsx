import { useMemo, useState } from "react";
import {
  Search, Star, Clock, Check, Sparkles, Grid3x3, List, LayoutGrid, Heart,
  ArrowDownRight, ArrowUpRight, Repeat, Wand2, Volume2, Palette, Image,
  Save, Copy, Trash2, Download, Upload, Edit3, FolderHeart, Building2,
  Type, PlayCircle, Crown,
} from "lucide-react";
import { SectionCard, Field, Input, Slider, Toggle, Pill, GhostButton, PrimaryButton } from "@/components/app-shell";

/* ============================================================ */
/* TEMPLATES                                                    */
/* ============================================================ */

const TEMPLATE_CATEGORIES = [
  "All", "Classic", "Minimal", "Modern", "TikTok", "YouTube Shorts", "Instagram",
  "Gaming", "Podcast", "Movie", "Netflix", "Education", "History", "Business",
  "Luxury", "Cyberpunk", "Travel", "Sports", "Food", "AI", "Coding", "News",
  "Documentary", "Neon", "Vintage",
];

type TemplateCat = typeof TEMPLATE_CATEGORIES[number];

type Template = {
  id: string;
  name: string;
  category: TemplateCat;
  font: string;
  bg: string;
  text: string;
  stroke?: string;
  shadow?: string;
  recommended?: boolean;
  recent?: boolean;
  pro?: boolean;
};

const NAME_POOLS: Record<string, string[]> = {
  Classic: ["Classic Bold", "Classic Center", "Studio Caption", "Newsroom", "Plain Bold"],
  Minimal: ["Whisper", "Silk", "Linen", "Pure Sans", "Quiet"],
  Modern: ["Bold Stack", "Atelier", "Sharp Edge", "Neo Caption", "Modern Drop"],
  TikTok: ["TikTok Pop", "Viral Hook", "Trend Bold", "ForYou Pop", "Karaoke Pop"],
  "YouTube Shorts": ["Shorts Bold", "Creator Caption", "MrBeast Style", "Boxed Caption", "YT Bright"],
  Instagram: ["Reel Bold", "IG Story", "Gradient Reel", "Pastel Reel", "Glass Reel"],
  Gaming: ["Esports", "Twitch Stream", "Arcade", "Pixel Boss", "Loot Drop"],
  Podcast: ["Mic Drop", "Studio Voice", "Talk Show", "Interview", "Spoken Word"],
  Movie: ["Cinematic", "Director's Cut", "Trailer Bold", "Indie Film", "Letterbox"],
  Netflix: ["Streaming Red", "Documentary Bar", "Series Caption", "Episode Title"],
  Education: ["Lecture", "Course Caption", "Textbook", "Khan Style"],
  History: ["Archive", "Vintage Doc", "Old World", "Sepia Tale"],
  Business: ["Boardroom", "Pitch Deck", "Quarterly", "Suit & Tie"],
  Luxury: ["Champagne", "Velvet", "Gilded", "Couture", "Diamond"],
  Cyberpunk: ["Neo Tokyo", "Glitch Wave", "Synth Grid", "Hacker", "Matrix"],
  Travel: ["Wanderlust", "Postcard", "Itinerary", "Globe Trotter"],
  Sports: ["Stadium", "Scoreboard", "Highlight Reel", "Playoff"],
  Food: ["Tasty Bold", "Recipe Card", "Foodie Pop", "Plated"],
  AI: ["Neural Net", "Prompt Caption", "GPT Style", "Model Card"],
  Coding: ["Terminal", "Snippet", "Stack Trace", "Commit"],
  News: ["Breaking", "Ticker Tape", "Anchor Desk", "Bulletin"],
  Documentary: ["Field Notes", "Voice Over", "Archive Roll"],
  Neon: ["Neon Sign", "Vegas Glow", "Electric Pink", "Laser"],
  Vintage: ["70s Disco", "VHS", "Polaroid", "Retro 80s"],
};

const GRADIENTS = [
  "from-emerald-700 to-emerald-950",
  "from-pink-600 to-rose-900",
  "from-stone-700 to-stone-950",
  "from-violet-700 to-indigo-950",
  "from-slate-600 to-slate-900",
  "from-fuchsia-600 to-purple-900",
  "from-zinc-700 to-zinc-950",
  "from-yellow-500 to-orange-700",
  "from-cyan-600 to-blue-900",
  "from-red-600 to-red-950",
  "from-amber-500 to-yellow-700",
  "from-teal-600 to-emerald-900",
];

const FONT_POOL = [
  "'Plus Jakarta Sans', sans-serif", "Inter, sans-serif", "'Bebas Neue', sans-serif",
  "Montserrat, sans-serif", "Oswald, sans-serif", "Anton, sans-serif",
  "'Playfair Display', serif", "'Cormorant Garamond', serif", "Cinzel, serif",
  "Orbitron, sans-serif", "Audiowide, sans-serif", "'Press Start 2P', monospace",
  "'JetBrains Mono', monospace", "'Space Mono', monospace",
  "Bangers, cursive", "'Permanent Marker', cursive", "Caveat, cursive", "Pacifico, cursive",
];

const TEXT_COLORS = ["#ffffff", "#fbbf24", "#22d3ee", "#a3e635", "#f43f5e", "#facc15", "#ec4899", "#34d399"];

function generateTemplates(): Template[] {
  const out: Template[] = [];
  let i = 0;
  for (const cat of TEMPLATE_CATEGORIES.slice(1)) {
    const names = NAME_POOLS[cat] || [cat];
    const count = Math.max(5, names.length + 1);
    for (let n = 0; n < count; n++) {
      out.push({
        id: `${cat}-${n}`,
        name: names[n % names.length] + (n >= names.length ? ` ${Math.floor(n / names.length) + 1}` : ""),
        category: cat,
        font: FONT_POOL[i % FONT_POOL.length],
        bg: GRADIENTS[i % GRADIENTS.length],
        text: TEXT_COLORS[i % TEXT_COLORS.length],
        stroke: i % 3 === 0 ? "#000000" : undefined,
        recommended: i % 7 === 0,
        recent: i % 11 === 0,
        pro: i % 9 === 0,
      });
      i++;
    }
  }
  return out;
}

const ALL_TEMPLATES = generateTemplates();

export function TemplateGallerySection() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<TemplateCat>("All");
  const [view, setView] = useState<"grid" | "list" | "large">("grid");
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string>(ALL_TEMPLATES[0].id);

  const filtered = useMemo(() => ALL_TEMPLATES.filter(t =>
    (cat === "All" || t.category === cat) && t.name.toLowerCase().includes(query.toLowerCase())
  ), [query, cat]);

  return (
    <SectionCard
      title="Caption Template Gallery"
      subtitle={`${ALL_TEMPLATES.length}+ professional one-click subtitle styles`}
      right={<Pill tone="primary"><LayoutGrid className="w-3 h-3" /> {filtered.length}</Pill>}
    >
      <div className="pt-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search templates by name or vibe..." className="!pl-9" />
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
            {([["grid", Grid3x3], ["list", List], ["large", LayoutGrid]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} className={`w-9 h-8 rounded-lg grid place-items-center transition ${view === v ? "bg-card shadow-card" : "text-muted-foreground"}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TEMPLATE_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 h-8 rounded-lg text-[11.5px] font-semibold whitespace-nowrap transition ${cat === c ? "bg-brand-gradient text-white shadow-brand" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>

        <div className={view === "list" ? "space-y-2" : view === "large" ? "grid grid-cols-2 gap-3" : "grid grid-cols-4 gap-3"}>
          {filtered.slice(0, view === "large" ? 16 : 60).map(t => {
            const isSelected = selected === t.id;
            const isFav = favs[t.id];
            if (view === "list") {
              return (
                <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition ${isSelected ? "border-primary bg-accent/30" : "border-border hover:border-primary/30"}`}>
                  <div className={`w-20 h-12 rounded-lg bg-gradient-to-br ${t.bg} grid place-items-center shrink-0`}>
                    <span className="text-white text-[10px] font-extrabold" style={{ fontFamily: t.font }}>Aa</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[12.5px] font-semibold truncate flex items-center gap-1.5">
                      {t.name}
                      {t.recommended && <Pill tone="primary">REC</Pill>}
                      {t.pro && <Crown className="w-3 h-3 text-amber-500" />}
                    </div>
                    <div className="text-[10.5px] text-muted-foreground">{t.category}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFavs(p => ({ ...p, [t.id]: !p[t.id] })); }} className="p-1.5">
                    <Star className={`w-3.5 h-3.5 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </button>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            }
            return (
              <button key={t.id} onClick={() => setSelected(t.id)} className={`group relative rounded-xl border overflow-hidden transition hover:-translate-y-0.5 ${isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/30"}`}>
                <div className={`relative aspect-[4/5] bg-gradient-to-br ${t.bg} grid place-items-center p-3`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_60%)]" />
                  <div className="relative text-center">
                    <span
                      className="inline-block px-2.5 py-1.5 rounded-md leading-tight font-extrabold"
                      style={{
                        fontFamily: t.font,
                        color: t.text,
                        background: t.stroke ? "rgba(0,0,0,.4)" : "transparent",
                        WebkitTextStroke: t.stroke ? `1.5px ${t.stroke}` : undefined,
                        fontSize: view === "large" ? 28 : 18,
                        textShadow: "0 2px 8px rgba(0,0,0,.4)",
                      }}
                    >
                      Most CEOs<br />don't owe<br />success to luck
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1">
                    {t.recommended && <Pill tone="primary">REC</Pill>}
                    {t.recent && <Pill tone="default"><Clock className="w-2.5 h-2.5" /></Pill>}
                    {t.pro && <span className="px-1.5 h-5 rounded bg-amber-500/90 text-white text-[9px] font-bold grid place-items-center"><Crown className="w-2.5 h-2.5" /></span>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFavs(p => ({ ...p, [t.id]: !p[t.id] })); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur grid place-items-center">
                    <Star className={`w-3 h-3 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
                  </button>
                  {isSelected && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-primary grid place-items-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-2 bg-card">
                  <div className="text-[11.5px] font-semibold truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

/* ============================================================ */
/* ANIMATIONS                                                   */
/* ============================================================ */

const IN_ANIMS = ["Fade", "Slide", "Pop", "Bounce", "Zoom", "Scale", "Blur", "Rotate", "Elastic"];
const OUT_ANIMS = ["Fade Out", "Slide Down", "Shrink", "Rotate Out", "Blur Out"];
const LOOP_ANIMS = ["Pulse", "Floating", "Heartbeat", "Shake", "Breathing", "Wave", "Typing"];

export function AnimationStudioSection() {
  const [selected, setSelected] = useState("Pop");
  const [duration, setDuration] = useState(40);
  const [speed, setSpeed] = useState(60);
  const [delay, setDelay] = useState(10);
  const [intensity, setIntensity] = useState(70);
  const [curve, setCurve] = useState("Ease Out");
  const [direction, setDirection] = useState("Up");
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  const renderGroup = (title: string, icon: React.ReactNode, anims: string[]) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-secondary grid place-items-center">{icon}</div>
        <h4 className="font-display font-bold text-[13px]">{title}</h4>
        <Pill tone="default">{anims.length}</Pill>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {anims.map(a => {
          const isSelected = selected === a;
          return (
            <button key={a} onClick={() => setSelected(a)} className={`group relative rounded-xl border p-3 text-left transition ${isSelected ? "border-primary bg-accent/30 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}>
              <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-950 grid place-items-center mb-2 overflow-hidden">
                <span className="text-white font-extrabold text-[14px] animate-fade-in" style={{ animationDuration: "1.6s", animationIterationCount: "infinite" }}>Aa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold">{a}</span>
                <button onClick={(e) => { e.stopPropagation(); setFavs(p => ({ ...p, [a]: !p[a] })); }}>
                  <Star className={`w-3 h-3 ${favs[a] ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <SectionCard title="Animation Studio" subtitle="Bring captions to life with motion presets">
      <div className="pt-4 space-y-6">
        {renderGroup("IN Animations", <ArrowDownRight className="w-3.5 h-3.5 text-primary" />, IN_ANIMS)}
        {renderGroup("OUT Animations", <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />, OUT_ANIMS)}
        {renderGroup("LOOP Animations", <Repeat className="w-3.5 h-3.5 text-violet-500" />, LOOP_ANIMS)}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display font-bold text-[13px]">Tuning · {selected}</h4>
            <Pill tone="primary"><PlayCircle className="w-3 h-3" /> Preview</Pill>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            <Field label={`Duration · ${duration / 100}s`}><Slider value={duration} onChange={setDuration} /></Field>
            <Field label={`Speed · ${speed}%`}><Slider value={speed} onChange={setSpeed} /></Field>
            <Field label={`Delay · ${delay / 100}s`}><Slider value={delay} onChange={setDelay} /></Field>
            <Field label={`Intensity · ${intensity}%`}><Slider value={intensity} onChange={setIntensity} /></Field>
            <Field label="Curve">
              <div className="grid grid-cols-4 gap-1.5">
                {["Linear", "Ease In", "Ease Out", "Spring"].map(c => (
                  <button key={c} onClick={() => setCurve(c)} className={`h-9 rounded-lg text-[10.5px] font-semibold border transition ${curve === c ? "border-primary bg-accent/30" : "border-border hover:border-primary/30"}`}>{c}</button>
                ))}
              </div>
            </Field>
            <Field label="Direction">
              <div className="grid grid-cols-4 gap-1.5">
                {["Up", "Down", "Left", "Right"].map(d => (
                  <button key={d} onClick={() => setDirection(d)} className={`h-9 rounded-lg text-[10.5px] font-semibold border transition ${direction === d ? "border-primary bg-accent/30" : "border-border hover:border-primary/30"}`}>{d}</button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ============================================================ */
/* KARAOKE / HIGHLIGHT                                          */
/* ============================================================ */

export function KaraokeHighlightSection() {
  const [mode, setMode] = useState("Word Highlight");
  const [color, setColor] = useState("#fbbf24");
  const [anim, setAnim] = useState("Pop");
  const [enabled, setEnabled] = useState(true);

  const modes = [
    { name: "Word Highlight", desc: "One word at a time" },
    { name: "Current Line", desc: "Active subtitle line" },
    { name: "Current Sentence", desc: "Whole sentence pulse" },
    { name: "Karaoke Style", desc: "Color fills with audio" },
    { name: "Progress Highlight", desc: "Word-by-word progress bar" },
  ];

  return (
    <SectionCard
      title="Karaoke & Highlight"
      subtitle="Sync captions with the voiceover"
      right={<Toggle checked={enabled} onChange={setEnabled} />}
    >
      <div className={`pt-4 space-y-4 ${enabled ? "" : "opacity-50 pointer-events-none"}`}>
        <div className="grid grid-cols-5 gap-2">
          {modes.map(m => (
            <button key={m.name} onClick={() => setMode(m.name)} className={`p-3 rounded-xl border text-left transition ${mode === m.name ? "border-primary bg-accent/30 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}>
              <div className="text-[11.5px] font-bold">{m.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-6 grid place-items-center">
          <div className="font-display font-extrabold text-[26px] text-white leading-tight text-center">
            Most <span style={{ color }}>CEOs</span> don't<br />owe success to luck.
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <Field label="Highlight color">
            <div className="flex items-center gap-2">
              <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="!p-1 !h-10 !w-14" />
              <Input value={color} onChange={e => setColor(e.target.value)} className="font-mono" />
            </div>
          </Field>
          <Field label="Highlight animation">
            <div className="grid grid-cols-3 gap-1.5">
              {["Pop", "Bounce", "Glow", "Scale", "Flip", "Wave"].map(a => (
                <button key={a} onClick={() => setAnim(a)} className={`h-9 rounded-lg text-[10.5px] font-semibold border transition ${anim === a ? "border-primary bg-accent/30" : "border-border hover:border-primary/30"}`}>{a}</button>
              ))}
            </div>
          </Field>
          <Field label="Speed sync">
            <Slider value={70} />
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}

/* ============================================================ */
/* COLOR THEMES                                                 */
/* ============================================================ */

const THEMES: { name: string; colors: string[]; text: string }[] = [
  { name: "White", colors: ["#ffffff", "#000000"], text: "#ffffff" },
  { name: "Yellow", colors: ["#fbbf24", "#78350f"], text: "#fbbf24" },
  { name: "Gold", colors: ["#facc15", "#713f12"], text: "#facc15" },
  { name: "Orange", colors: ["#f97316", "#7c2d12"], text: "#f97316" },
  { name: "Red", colors: ["#f43f5e", "#881337"], text: "#f43f5e" },
  { name: "Blue", colors: ["#22d3ee", "#0c4a6e"], text: "#22d3ee" },
  { name: "Purple", colors: ["#a855f7", "#581c87"], text: "#c084fc" },
  { name: "Pink", colors: ["#ec4899", "#831843"], text: "#ec4899" },
  { name: "Green", colors: ["#a3e635", "#365314"], text: "#a3e635" },
  { name: "Neon", colors: ["#22d3ee", "#a3e635"], text: "#a3e635" },
  { name: "TikTok", colors: ["#ff0050", "#00f2ea"], text: "#ffffff" },
  { name: "Netflix", colors: ["#e50914", "#000000"], text: "#e50914" },
  { name: "Instagram", colors: ["#fd1d1d", "#833ab4"], text: "#ffffff" },
  { name: "CapCut", colors: ["#000000", "#ffffff"], text: "#ffffff" },
  { name: "Cyberpunk", colors: ["#ff007a", "#00f7ff"], text: "#00f7ff" },
  { name: "Luxury", colors: ["#d4af37", "#1a1a1a"], text: "#d4af37" },
  { name: "Minimal", colors: ["#fafafa", "#171717"], text: "#fafafa" },
  { name: "Movie", colors: ["#fbbf24", "#1c1917"], text: "#fbbf24" },
  { name: "Business", colors: ["#0ea5e9", "#0f172a"], text: "#e0f2fe" },
];

export function ColorThemesSection() {
  const [selected, setSelected] = useState("White");
  return (
    <SectionCard
      title="Color Themes"
      subtitle="One-click palettes that update the whole subtitle"
      right={<Pill tone="primary">{THEMES.length} themes</Pill>}
    >
      <div className="pt-4 grid grid-cols-5 gap-3">
        {THEMES.map(t => {
          const isSelected = selected === t.name;
          return (
            <button key={t.name} onClick={() => setSelected(t.name)} className={`group relative rounded-xl border overflow-hidden transition hover:-translate-y-0.5 ${isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/30"}`}>
              <div className="aspect-[4/3] grid place-items-center p-3" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
                <span className="font-display font-extrabold text-[18px]" style={{ color: t.text, textShadow: "0 2px 6px rgba(0,0,0,.4)" }}>Aa</span>
                {isSelected && <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary grid place-items-center"><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>}
              </div>
              <div className="px-2 py-1.5 bg-card flex items-center justify-between">
                <span className="text-[11px] font-semibold truncate">{t.name}</span>
                <div className="flex gap-0.5">
                  {t.colors.map(c => <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ============================================================ */
/* BRAND KIT                                                    */
/* ============================================================ */

export function BrandKitSection() {
  const [tab, setTab] = useState<"my" | "recent" | "fav" | "brand">("my");
  const presets = [
    { name: "Viral Hook v2", note: "TikTok · Bebas Neue", color: "from-pink-500 to-rose-700" },
    { name: "Cinematic Caption", note: "Movie · Playfair", color: "from-stone-600 to-stone-900" },
    { name: "Tech Talk", note: "Coding · JetBrains", color: "from-cyan-600 to-blue-900" },
    { name: "Lux Story", note: "Luxury · Cinzel", color: "from-amber-500 to-amber-800" },
    { name: "Acme Brand", note: "Brand kit · Inter", color: "from-emerald-600 to-emerald-900" },
    { name: "Podcast Pop", note: "Podcast · Manrope", color: "from-violet-600 to-indigo-900" },
  ];
  return (
    <SectionCard
      title="Brand Kit & Presets"
      subtitle="Save, organize and reuse subtitle styles"
      right={
        <div className="flex items-center gap-1.5">
          <GhostButton><Upload className="w-3.5 h-3.5" /> Import</GhostButton>
          <GhostButton><Download className="w-3.5 h-3.5" /> Export</GhostButton>
          <PrimaryButton><Save className="w-3.5 h-3.5" /> Save Preset</PrimaryButton>
        </div>
      }
    >
      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 w-fit">
          {([
            ["my", "My Templates", FolderHeart],
            ["recent", "Recent", Clock],
            ["fav", "Favorites", Heart],
            ["brand", "Company Brand Kit", Building2],
          ] as const).map(([v, label, Icon]) => (
            <button key={v} onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11.5px] font-semibold transition ${tab === v ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {presets.map(p => (
            <div key={p.name} className="rounded-xl border border-border bg-card overflow-hidden group">
              <div className={`aspect-[16/9] bg-gradient-to-br ${p.color} grid place-items-center relative`}>
                <span className="font-display font-extrabold text-white text-[22px]" style={{ textShadow: "0 2px 8px rgba(0,0,0,.4)" }}>Aa Bb Cc</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition grid place-items-center opacity-0 group-hover:opacity-100">
                  <PrimaryButton><Wand2 className="w-3.5 h-3.5" /> Apply</PrimaryButton>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold truncate">{p.name}</div>
                  <div className="text-[10.5px] text-muted-foreground truncate">{p.note}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button className="w-7 h-7 rounded-lg hover:bg-secondary grid place-items-center"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button className="w-7 h-7 rounded-lg hover:bg-secondary grid place-items-center"><Copy className="w-3.5 h-3.5" /></button>
                  <button className="w-7 h-7 rounded-lg hover:bg-secondary grid place-items-center text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

/* ============================================================ */
/* AI STYLE RECOMMENDATION (right rail extra card)              */
/* ============================================================ */

const TOPIC_RECS = [
  { topic: "Programming", template: "Tech Template", theme: "Blue", font: "JetBrains Mono", anim: "Typewriter" },
  { topic: "History", template: "Documentary", theme: "Brown", font: "Merriweather", anim: "Slow Fade" },
  { topic: "Travel", template: "Cinematic", theme: "Warm", font: "Playfair", anim: "Slide" },
  { topic: "Food", template: "Bold Pop", theme: "Yellow", font: "Bangers", anim: "Pop" },
  { topic: "Gaming", template: "Esports", theme: "Cyberpunk", font: "Orbitron", anim: "Glitch" },
  { topic: "Business", template: "Boardroom", theme: "Business", font: "Inter", anim: "Fade" },
];

export function AIStyleRecommendationSection() {
  const [topic, setTopic] = useState("Programming");
  const rec = TOPIC_RECS.find(r => r.topic === topic)!;

  const lines: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Subtitle Template", value: rec.template, icon: Type },
    { label: "Animation", value: rec.anim, icon: Sparkles },
    { label: "Color Theme", value: rec.theme, icon: Palette },
    { label: "Stroke Style", value: "Medium · Black", icon: Wand2 },
    { label: "Background Style", value: "Glass · 35%", icon: Image },
    { label: "Overlay Suggestion", value: "Subtle Vignette", icon: Image },
    { label: "Voice Suggestion", value: "Deep Confident M", icon: Volume2 },
  ];

  return (
    <SectionCard
      title="AI Style Recommendation"
      subtitle="Get matching styles based on your topic"
      right={<Pill tone="primary"><Sparkles className="w-3 h-3" /> AI</Pill>}
    >
      <div className="pt-4 space-y-4">
        <Field label="Video topic">
          <div className="grid grid-cols-3 gap-1.5">
            {TOPIC_RECS.map(t => (
              <button key={t.topic} onClick={() => setTopic(t.topic)} className={`h-9 rounded-lg text-[11px] font-semibold border transition ${topic === t.topic ? "border-primary bg-accent/30" : "border-border hover:border-primary/30"}`}>{t.topic}</button>
            ))}
          </div>
        </Field>

        <div className="space-y-2">
          {lines.map(l => {
            const Icon = l.icon;
            return (
              <div key={l.label} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/40">
                <div className="w-8 h-8 rounded-lg bg-card border border-border grid place-items-center"><Icon className="w-3.5 h-3.5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] text-muted-foreground">{l.label}</div>
                  <div className="text-[12.5px] font-semibold truncate">{l.value}</div>
                </div>
                <button className="text-[10.5px] font-semibold text-primary">Apply</button>
              </div>
            );
          })}
        </div>

        <button className="w-full h-11 rounded-xl bg-brand-gradient text-white text-[12.5px] font-bold shadow-brand flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> Apply Full AI Recipe
        </button>
      </div>
    </SectionCard>
  );
}
