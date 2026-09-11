import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AppShell, PageHeader, SectionCard, Field, Input, Slider, Toggle, GhostButton, PrimaryButton, Pill,
} from "@/components/app-shell";
import {
  Type, Sparkles, Save, Download, Search, Star, Clock, Bold, Italic, Underline,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Move,
  Copy, ClipboardPaste, Undo2, Redo2, RotateCcw, Eye, EyeOff, Check, Palette, Wand2,
  CheckCircle2, Accessibility, Gauge, Sliders, LayoutTemplate, Zap, Mic2, Brush, FolderHeart,
} from "lucide-react";
import {
  TemplateGallerySection, AnimationStudioSection, KaraokeHighlightSection,
  ColorThemesSection, BrandKitSection, AIStyleRecommendationSection,
} from "@/components/subtitle-templates";

type Tab = "style" | "templates" | "animations" | "karaoke" | "themes" | "brand";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "style", label: "Manual Style", icon: Sliders },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "animations", label: "Animations", icon: Zap },
  { id: "karaoke", label: "Karaoke", icon: Mic2 },
  { id: "themes", label: "Color Themes", icon: Brush },
  { id: "brand", label: "Brand Kit", icon: FolderHeart },
];

export const Route = createFileRoute("/subtitle-studio")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } =>
    typeof search.tab === "string" ? { tab: search.tab } : {},
  head: () => ({ meta: [{ title: "Subtitle Studio — VideoForge AI" }] }),
  component: SubtitleStudioPage,
});

// legacy /effects deep-link maps onto the Animations tab
function resolveTab(param?: string): Tab | undefined {
  if (!param) return undefined;
  const alias = param === "effects" ? "animations" : param;
  return TABS.some(t => t.id === alias) ? (alias as Tab) : undefined;
}

type FontCategory = "All" | "Sans" | "Serif" | "Modern" | "Bold" | "Gaming" | "Luxury" | "Minimal" | "Tech" | "Movie" | "Handwriting";

type FontDef = {
  name: string;
  family: string;
  category: Exclude<FontCategory, "All">;
  langs: string[];
  recommended?: boolean;
  recent?: boolean;
};

const FONTS: FontDef[] = [
  { name: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif", category: "Sans", langs: ["Latin", "Cyrillic"], recommended: true, recent: true },
  { name: "Inter", family: "Inter, sans-serif", category: "Sans", langs: ["Latin", "Cyrillic", "Greek"], recommended: true, recent: true },
  { name: "Montserrat", family: "Montserrat, sans-serif", category: "Modern", langs: ["Latin", "Cyrillic"], recommended: true },
  { name: "Poppins", family: "Poppins, sans-serif", category: "Modern", langs: ["Latin"], recent: true },
  { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "Bold", langs: ["Latin"], recommended: true },
  { name: "Oswald", family: "Oswald, sans-serif", category: "Bold", langs: ["Latin"] },
  { name: "Anton", family: "Anton, sans-serif", category: "Bold", langs: ["Latin"], recommended: true },
  { name: "Archivo Black", family: "'Archivo Black', sans-serif", category: "Bold", langs: ["Latin"] },
  { name: "Roboto", family: "Roboto, sans-serif", category: "Sans", langs: ["Latin", "Cyrillic"] },
  { name: "Open Sans", family: "'Open Sans', sans-serif", category: "Sans", langs: ["Latin", "Cyrillic", "Greek"] },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "Serif", langs: ["Latin"], recommended: true },
  { name: "Merriweather", family: "Merriweather, serif", category: "Serif", langs: ["Latin", "Cyrillic"] },
  { name: "Lora", family: "Lora, serif", category: "Serif", langs: ["Latin", "Cyrillic"] },
  { name: "Cormorant Garamond", family: "'Cormorant Garamond', serif", category: "Luxury", langs: ["Latin"], recommended: true },
  { name: "Cinzel", family: "Cinzel, serif", category: "Luxury", langs: ["Latin"] },
  { name: "Italiana", family: "Italiana, serif", category: "Luxury", langs: ["Latin"] },
  { name: "Press Start 2P", family: "'Press Start 2P', monospace", category: "Gaming", langs: ["Latin"] },
  { name: "Orbitron", family: "Orbitron, sans-serif", category: "Gaming", langs: ["Latin"], recommended: true },
  { name: "Audiowide", family: "Audiowide, sans-serif", category: "Gaming", langs: ["Latin"] },
  { name: "Russo One", family: "'Russo One', sans-serif", category: "Gaming", langs: ["Latin", "Cyrillic"] },
  { name: "Space Mono", family: "'Space Mono', monospace", category: "Tech", langs: ["Latin"] },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "Tech", langs: ["Latin", "Cyrillic"], recent: true },
  { name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", category: "Tech", langs: ["Latin"] },
  { name: "Share Tech Mono", family: "'Share Tech Mono', monospace", category: "Tech", langs: ["Latin"] },
  { name: "Bangers", family: "Bangers, cursive", category: "Movie", langs: ["Latin"], recommended: true },
  { name: "Permanent Marker", family: "'Permanent Marker', cursive", category: "Movie", langs: ["Latin"] },
  { name: "Special Elite", family: "'Special Elite', cursive", category: "Movie", langs: ["Latin"] },
  { name: "Limelight", family: "Limelight, cursive", category: "Movie", langs: ["Latin"] },
  { name: "Caveat", family: "Caveat, cursive", category: "Handwriting", langs: ["Latin", "Cyrillic"] },
  { name: "Pacifico", family: "Pacifico, cursive", category: "Handwriting", langs: ["Latin"] },
  { name: "Dancing Script", family: "'Dancing Script', cursive", category: "Handwriting", langs: ["Latin"] },
  { name: "Shadows Into Light", family: "'Shadows Into Light', cursive", category: "Handwriting", langs: ["Latin"] },
  { name: "Work Sans", family: "'Work Sans', sans-serif", category: "Minimal", langs: ["Latin"] },
  { name: "Manrope", family: "Manrope, sans-serif", category: "Minimal", langs: ["Latin"], recommended: true },
  { name: "DM Sans", family: "'DM Sans', sans-serif", category: "Minimal", langs: ["Latin"] },
];

const CATEGORIES: FontCategory[] = ["All", "Sans", "Serif", "Modern", "Bold", "Gaming", "Luxury", "Minimal", "Tech", "Movie", "Handwriting"];

const PRESET_COLORS = ["#ffffff", "#000000", "#fbbf24", "#22d3ee", "#f43f5e", "#a3e635", "#227850", "#1e293b", "#f97316", "#a855f7", "#ec4899", "#facc15"];

type StrokePreset = "None" | "Thin" | "Medium" | "Thick" | "Custom";
type Position = "Top" | "Center" | "Bottom" | "Custom";
type TextCase = "Normal" | "UPPERCASE" | "lowercase" | "Sentence";

function SubtitleStudioPage() {
  // Enable
  const [enabled, setEnabled] = useState(true);
  const { tab: tabParam } = Route.useSearch();
  const [tab, setTab] = useState<Tab>(resolveTab(tabParam) ?? "style");
  useEffect(() => {
    const resolved = resolveTab(tabParam);
    if (resolved) setTab(resolved);
  }, [tabParam]);

  // Font
  const [fontQuery, setFontQuery] = useState("");
  const [fontCategory, setFontCategory] = useState<FontCategory>("All");
  const [fontFamily, setFontFamily] = useState(FONTS[0].family);
  const [fontName, setFontName] = useState(FONTS[0].name);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ "Bebas Neue": true, Inter: true });

  // Position
  const [position, setPosition] = useState<Position>("Bottom");
  const [customY, setCustomY] = useState(82);

  // Text style
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(56);
  const [fontWeight, setFontWeight] = useState(800);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(110);
  const [textCase, setTextCase] = useState<TextCase>("Normal");
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  // Stroke
  const [strokePreset, setStrokePreset] = useState<StrokePreset>("Medium");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Background
  const [bgEnabled, setBgEnabled] = useState(true);
  const [bgColor, setBgColor] = useState("#000000");
  const [bgOpacity, setBgOpacity] = useState(45);
  const [bgRadius, setBgRadius] = useState(14);
  const [bgPaddingX, setBgPaddingX] = useState(20);
  const [bgPaddingY, setBgPaddingY] = useState(12);
  const [bgMargin, setBgMargin] = useState(24);
  const [bgShadow, setBgShadow] = useState(40);

  const filteredFonts = useMemo(() => {
    return FONTS.filter(f => (fontCategory === "All" || f.category === fontCategory) &&
      f.name.toLowerCase().includes(fontQuery.toLowerCase()));
  }, [fontQuery, fontCategory]);

  const previewText = "Most CEOs don't owe success to luck.";
  const transformedText = textCase === "UPPERCASE" ? previewText.toUpperCase()
    : textCase === "lowercase" ? previewText.toLowerCase()
    : textCase === "Sentence" ? previewText.charAt(0).toUpperCase() + previewText.slice(1).toLowerCase()
    : previewText;

  const effectiveStrokeWidth = strokePreset === "Thin" ? 1.5 : strokePreset === "Medium" ? 3 : strokePreset === "Thick" ? 5 : strokePreset === "None" ? 0 : strokeWidth;

  const positionStyle: React.CSSProperties =
    position === "Top" ? { alignItems: "flex-start", paddingTop: "8%" }
    : position === "Center" ? { alignItems: "center" }
    : position === "Bottom" ? { alignItems: "flex-end", paddingBottom: "10%" }
    : { alignItems: "flex-start", paddingTop: `${customY}%` };

  const disabledCls = enabled ? "" : "opacity-50 pointer-events-none select-none";

  const toggleFav = (name: string) => setFavorites(p => ({ ...p, [name]: !p[name] }));

  const renderPreviewSubtitle = (size = 1) => (
    <div
      className="inline-block font-display"
      style={{
        fontFamily,
        color: textColor,
        fontSize: `${fontSize * size}px`,
        fontWeight,
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline ? "underline" : "none",
        letterSpacing: `${letterSpacing / 10}px`,
        lineHeight: `${lineHeight}%`,
        background: bgEnabled ? `${bgColor}${Math.round(bgOpacity * 2.55).toString(16).padStart(2, "0")}` : "transparent",
        padding: bgEnabled ? `${bgPaddingY * size}px ${bgPaddingX * size}px` : 0,
        borderRadius: bgEnabled ? `${bgRadius}px` : 0,
        WebkitTextStroke: effectiveStrokeWidth > 0 ? `${effectiveStrokeWidth * size}px ${strokeColor}` : undefined,
        textShadow: bgShadow > 0 ? `0 ${4 * size}px ${(bgShadow / 2) * size}px rgba(0,0,0,.${Math.round(bgShadow).toString().padStart(2, "0")})` : undefined,
        maxWidth: "85%",
      }}
    >
      {transformedText}
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Subtitle Studio"]}
        title="Subtitle Studio"
        subtitle="Design captions that pop. Every change is live-previewed instantly."
        actions={
          <>
            <GhostButton><Undo2 className="w-4 h-4" /> Undo</GhostButton>
            <GhostButton><Redo2 className="w-4 h-4" /> Redo</GhostButton>
            <GhostButton><Copy className="w-4 h-4" /> Copy Style</GhostButton>
            <GhostButton><ClipboardPaste className="w-4 h-4" /> Paste</GhostButton>
            <GhostButton><RotateCcw className="w-4 h-4" /> Reset</GhostButton>
            <GhostButton><Save className="w-4 h-4" /> Save Preset</GhostButton>
            <PrimaryButton><Download className="w-4 h-4" /> Apply</PrimaryButton>
          </>
        }
      />

      <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1 mb-5 w-fit shadow-card">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 h-10 rounded-xl text-[12.5px] font-semibold transition ${active ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          {tab !== "style" && (
            <>
              {tab === "templates" && <TemplateGallerySection />}
              {tab === "animations" && <AnimationStudioSection />}
              {tab === "karaoke" && <KaraokeHighlightSection />}
              {tab === "themes" && <ColorThemesSection />}
              {tab === "brand" && <BrandKitSection />}
            </>
          )}
          {tab === "style" && (
          <>
          {/* ENABLE */}
          <SectionCard
            title="Subtitle Engine"
            subtitle="Master switch for the entire subtitle pipeline"
            right={<Pill tone={enabled ? "primary" : "default"}>{enabled ? <><CheckCircle2 className="w-3 h-3" /> Enabled</> : <><EyeOff className="w-3 h-3" /> Disabled</>}</Pill>}
          >
            <div className="flex items-center justify-between gap-6 pt-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl grid place-items-center ${enabled ? "bg-brand-gradient" : "bg-secondary"}`}>
                  {enabled ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-display font-bold text-[14px]">Render subtitles on the final video</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Autosaves on every change. Compatible with MoneyPrinterTurbo subtitle.engine.</div>
                </div>
              </div>
              <Toggle checked={enabled} onChange={setEnabled} />
            </div>
          </SectionCard>

          <div className={`space-y-5 transition ${disabledCls}`}>
            {/* FONT */}
            <SectionCard
              title="Font Library"
              subtitle="Searchable browser with live previews"
              right={<Pill tone="primary">{filteredFonts.length} fonts</Pill>}
            >
              <div className="pt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={fontQuery} onChange={e => setFontQuery(e.target.value)} placeholder="Search 35+ fonts..." className="!pl-9" />
                  </div>
                  <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 overflow-x-auto max-w-[60%]">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setFontCategory(c)}
                        className={`px-3 h-8 rounded-lg text-[11.5px] font-semibold whitespace-nowrap transition ${fontCategory === c ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredFonts.map(f => {
                    const selected = fontFamily === f.family;
                    return (
                      <button
                        key={f.name}
                        onClick={() => { setFontFamily(f.family); setFontName(f.name); }}
                        className={`group relative text-left p-3.5 rounded-xl border transition ${selected ? "border-primary ring-2 ring-primary/20 bg-accent/30" : "border-border hover:border-primary/30"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5">
                              {f.name}
                              {f.recommended && <span className="px-1.5 py-px rounded bg-primary/15 text-primary text-[9px] font-bold">REC</span>}
                              {f.recent && <Clock className="w-2.5 h-2.5" />}
                            </div>
                            <div className="mt-1.5 text-[22px] leading-tight truncate" style={{ fontFamily: f.family }}>
                              Aa Bb Cc 123
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground">{f.category} · {f.langs.join(", ")}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFav(f.name); }}
                              className="p-1 rounded hover:bg-secondary"
                            >
                              <Star className={`w-3.5 h-3.5 ${favorites[f.name] ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            </button>
                            {selected && <Check className="w-3.5 h-3.5 text-primary" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* POSITION */}
            <SectionCard title="Position" subtitle="Where subtitles appear on the canvas">
              <div className="pt-4 grid grid-cols-4 gap-3">
                {([
                  { v: "Top" as Position, icon: AlignVerticalJustifyStart, label: "Top" },
                  { v: "Center" as Position, icon: AlignVerticalJustifyCenter, label: "Center" },
                  { v: "Bottom" as Position, icon: AlignVerticalJustifyEnd, label: "Bottom" },
                  { v: "Custom" as Position, icon: Move, label: "Custom" },
                ]).map(p => {
                  const active = position === p.v;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.v}
                      onClick={() => setPosition(p.v)}
                      className={`p-4 rounded-xl border transition ${active ? "border-primary bg-accent/30 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}
                    >
                      <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 mb-2 grid relative overflow-hidden">
                        <div className={`absolute left-1/2 -translate-x-1/2 h-1.5 w-10 rounded bg-white/90 ${
                          p.v === "Top" ? "top-1.5" : p.v === "Center" ? "top-1/2 -translate-y-1/2" : p.v === "Bottom" ? "bottom-1.5" : "top-1/3"
                        }`} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold">
                        <Icon className="w-3.5 h-3.5" />
                        {p.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              {position === "Custom" && (
                <div className="pt-5">
                  <Field label={`Vertical position · ${customY}%`}>
                    <Slider value={customY} onChange={setCustomY} />
                  </Field>
                </div>
              )}
            </SectionCard>

            {/* TEXT STYLE */}
            <SectionCard title="Text Style" subtitle="Typography, color and case">
              <div className="pt-4 grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <Field label="Text color">
                    <div className="flex items-center gap-2">
                      <Input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="!p-1 !h-10 !w-14" />
                      <Input value={textColor} onChange={e => setTextColor(e.target.value)} className="font-mono" />
                    </div>
                  </Field>
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Palette className="w-3 h-3" /> Preset colors</div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setTextColor(c)}
                          style={{ background: c }}
                          className={`aspect-square rounded-lg border transition hover:scale-110 ${textColor === c ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <Field label="Text case">
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["Normal", "UPPERCASE", "lowercase", "Sentence"] as TextCase[]).map(c => (
                        <button
                          key={c}
                          onClick={() => setTextCase(c)}
                          className={`h-9 rounded-lg text-[11px] font-semibold border transition ${textCase === c ? "border-primary bg-accent/30" : "border-border hover:border-primary/30"}`}
                        >
                          {c === "Normal" ? "Aa" : c === "UPPERCASE" ? "AA" : c === "lowercase" ? "aa" : "Aa."}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Format">
                    <div className="flex gap-1.5">
                      <StyleBtn active={bold} onClick={() => setBold(!bold)}><Bold className="w-3.5 h-3.5" /></StyleBtn>
                      <StyleBtn active={italic} onClick={() => setItalic(!italic)}><Italic className="w-3.5 h-3.5" /></StyleBtn>
                      <StyleBtn active={underline} onClick={() => setUnderline(!underline)}><Underline className="w-3.5 h-3.5" /></StyleBtn>
                    </div>
                  </Field>
                </div>
                <div className="space-y-3">
                  <Field label={`Font size · ${fontSize}px`}><Slider value={fontSize} min={16} max={140} onChange={setFontSize} /></Field>
                  <Field label={`Font weight · ${fontWeight}`}><Slider value={fontWeight} min={100} max={900} onChange={(v) => setFontWeight(Math.round(v/100)*100)} /></Field>
                  <Field label={`Letter spacing · ${letterSpacing / 10}px`}><Slider value={letterSpacing} min={-20} max={80} onChange={setLetterSpacing} /></Field>
                  <Field label={`Line height · ${lineHeight}%`}><Slider value={lineHeight} min={80} max={200} onChange={setLineHeight} /></Field>
                </div>
              </div>
            </SectionCard>

            {/* STROKE */}
            <SectionCard title="Stroke" subtitle="Outline to keep text readable on any footage">
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {(["None", "Thin", "Medium", "Thick", "Custom"] as StrokePreset[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setStrokePreset(p)}
                      className={`h-12 rounded-xl border text-[12px] font-semibold transition ${strokePreset === p ? "border-primary bg-accent/30 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Stroke color">
                    <div className="flex items-center gap-2">
                      <Input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="!p-1 !h-10 !w-14" />
                      <Input value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="font-mono" />
                    </div>
                  </Field>
                  <Field label={`Custom width · ${strokeWidth}px`}>
                    <Slider value={strokeWidth} min={0} max={12} onChange={setStrokeWidth} />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {["Glow Stroke", "Soft Stroke", "Double Stroke"].map(s => (
                    <div key={s} className="h-12 rounded-xl border border-dashed border-border grid place-items-center text-[11px] font-semibold text-muted-foreground">
                      {s} <span className="ml-2 text-[9px] font-bold text-muted-foreground">SOON</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* BACKGROUND */}
            <SectionCard
              title="Subtitle Background"
              subtitle="Caption pill behind text"
              right={<Toggle checked={bgEnabled} onChange={setBgEnabled} />}
            >
              <div className={`pt-4 grid grid-cols-2 gap-5 ${bgEnabled ? "" : "opacity-50 pointer-events-none"}`}>
                <div className="space-y-3">
                  <Field label="Background color">
                    <div className="flex items-center gap-2">
                      <Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="!p-1 !h-10 !w-14" />
                      <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono" />
                    </div>
                  </Field>
                  <Field label={`Opacity · ${bgOpacity}%`}><Slider value={bgOpacity} onChange={setBgOpacity} /></Field>
                  <Field label={`Corner radius · ${bgRadius}px`}><Slider value={bgRadius} min={0} max={40} onChange={setBgRadius} /></Field>
                  <Field label={`Shadow · ${bgShadow}`}><Slider value={bgShadow} onChange={setBgShadow} /></Field>
                </div>
                <div className="space-y-3">
                  <Field label={`Padding X · ${bgPaddingX}px`}><Slider value={bgPaddingX} min={0} max={60} onChange={setBgPaddingX} /></Field>
                  <Field label={`Padding Y · ${bgPaddingY}px`}><Slider value={bgPaddingY} min={0} max={40} onChange={setBgPaddingY} /></Field>
                  <Field label={`Outer margin · ${bgMargin}px`}><Slider value={bgMargin} min={0} max={80} onChange={setBgMargin} /></Field>
                  <div className="grid grid-cols-3 gap-2">
                    {["Blur", "Glass", "Gradient"].map(s => (
                      <div key={s} className="h-10 rounded-lg border border-dashed border-border grid place-items-center text-[10.5px] font-semibold text-muted-foreground">
                        {s} · Soon
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
          </>
          )}
        </div>

        {/* RIGHT RAIL: Preview + AI */}
        <div className="col-span-4">
          <div className="sticky top-[88px] space-y-5">
            <div className="rounded-3xl bg-card border border-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-[15px]">Live Preview</h3>
                <Pill tone="primary"><Type className="w-3 h-3" /> {fontName}</Pill>
              </div>
              <div className="relative aspect-[9/16] rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-900 to-emerald-950 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.2),transparent_60%)]" />
                <div className="absolute inset-0 flex justify-center px-4" style={positionStyle}>
                  <div className="text-center" style={{ marginBottom: position === "Bottom" ? bgMargin : 0, marginTop: position === "Top" ? bgMargin : 0 }}>
                    {renderPreviewSubtitle(0.5)}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {(["Hook", "Body", "CTA"] as const).map((t, i) => (
                  <button key={t} className={`py-2 rounded-lg text-[11.5px] font-bold ${i === 0 ? "bg-brand-gradient text-white" : "bg-secondary text-muted-foreground"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-card border border-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-gradient grid place-items-center"><Sparkles className="w-4 h-4 text-white" /></div>
                  <h3 className="font-display font-bold text-[15px]">AI Suggestions</h3>
                </div>
                <Pill tone="primary">Beta</Pill>
              </div>

              <div className="space-y-2.5">
                {[
                  { icon: Type, label: "Best Font", value: "Bebas Neue", reason: "High impact for hooks" },
                  { icon: Gauge, label: "Best Size", value: "64px", reason: "Optimal for 9:16" },
                  { icon: Wand2, label: "Best Stroke", value: "Medium · #000", reason: "Readable on any clip" },
                  { icon: Palette, label: "Best Background", value: "Black @ 45%", reason: "Max contrast" },
                  { icon: AlignVerticalJustifyEnd, label: "Best Position", value: "Bottom", reason: "TikTok standard" },
                  { icon: CheckCircle2, label: "Best Contrast", value: "AAA", reason: "WCAG passed" },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <button key={s.label} className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/20 transition text-left">
                      <div className="w-8 h-8 rounded-lg bg-secondary grid place-items-center shrink-0"><Icon className="w-4 h-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] text-muted-foreground">{s.label}</div>
                        <div className="text-[12.5px] font-semibold truncate">{s.value}</div>
                      </div>
                      <span className="text-[10.5px] text-muted-foreground hidden xl:block">{s.reason}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <ScoreRing label="Readability" score={94} icon={Eye} />
                <ScoreRing label="Accessibility" score={88} icon={Accessibility} />
              </div>

              <button className="mt-4 w-full h-10 rounded-xl bg-brand-gradient text-white text-[12.5px] font-bold shadow-brand flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Apply AI Auto-Style
              </button>
            </div>

            <AIStyleRecommendationSection />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StyleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg border grid place-items-center transition ${active ? "border-primary bg-accent/40 text-primary" : "border-border hover:border-primary/30"}`}
    >
      {children}
    </button>
  );
}

function ScoreRing({ label, score, icon: Icon }: { label: string; score: number; icon: React.ComponentType<{ className?: string }> }) {
  const color = score >= 90 ? "#227850" : score >= 75 ? "#fbbf24" : "#f43f5e";
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${(score / 100) * 94.2} 94.2`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 grid place-items-center"><Icon className="w-4 h-4" /></div>
      </div>
      <div>
        <div className="text-[10.5px] text-muted-foreground">{label}</div>
        <div className="text-[14px] font-display font-extrabold">{score}<span className="text-[10px] text-muted-foreground">/100</span></div>
      </div>
    </div>
  );
}
