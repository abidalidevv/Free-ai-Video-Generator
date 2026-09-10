import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppShell, PageHeader, SectionCard, Field, Input, Textarea, Select, Toggle,
  PrimaryButton, GhostButton, Pill, Slider, Card,
} from "@/components/app-shell";
import {
  Wand2, Sparkles, Save, Copy, RefreshCw, ChevronRight, ChevronDown, Star,
  Search, Languages as LangIcon, Clock, FileText, AlignLeft, Hash, Type,
  Maximize2, Minimize2, Undo2, Redo2, Trash2, Upload, Download, Plus, X,
  GripVertical, Eye, Loader2, CheckCircle2, Circle, ArrowRight, Lightbulb,
  Music2, Subtitles as SubsIcon, Palette, Mic2, Film, Layers, Zap, Play,
  Brain, ListChecks, Wand, Smile, Briefcase, Scissors, Maximize, Globe,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Script Studio — VideoForge AI" }, { name: "description", content: "Generate scripts and keywords for your AI video." }] }),
  component: CreatePage,
});

/* ------------- data ------------- */

const LANGUAGES = [
  { code: "auto", name: "Auto Detect", flag: "🌐" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
];

const RECENT = ["en-US", "es", "ar"];
const FAVORITES = ["en-US", "fr"];

const SUBJECT_EXAMPLES = ["History of AI", "Water Park", "Python Tutorial", "Healthy Food"];

const TONE_PRESETS = [
  { label: "More emotional", icon: Smile },
  { label: "Funny tone", icon: Smile },
  { label: "TikTok style", icon: Zap },
  { label: "Educational", icon: Brain },
  { label: "Professional", icon: Briefcase },
  { label: "Storytelling", icon: FileText },
  { label: "Documentary", icon: Film },
];

const PIPELINE_STEPS = [
  { key: "subject", label: "Subject", icon: Lightbulb },
  { key: "thinking", label: "AI Thinking", icon: Brain },
  { key: "script", label: "Script Generation", icon: FileText },
  { key: "keywords", label: "Keyword Generation", icon: ListChecks },
  { key: "done", label: "Completed", icon: CheckCircle2 },
] as const;

type StepStatus = "idle" | "running" | "done" | "failed";

const DEFAULT_SCRIPT = `The first artificial intelligence wasn't built in Silicon Valley — it was sketched on a chalkboard in 1956.

A handful of mathematicians at Dartmouth College believed a machine could one day "think". They were ridiculed for decades.

Then came the data, the GPUs, and the breakthrough nobody saw coming…`;

const DEFAULT_KEYWORDS = [
  "dartmouth college 1956", "vintage chalkboard math", "vacuum tube computer",
  "alan turing portrait", "neural network animation", "modern gpu cluster",
  "data center cinematic", "scientist working night", "abstract circuit board",
];

/* ------------- page ------------- */

function CreatePage() {
  const [subject, setSubject] = useState("History of AI");
  const [language, setLanguage] = useState("auto");
  const [paragraphs, setParagraphs] = useState(4);
  const [customReq, setCustomReq] = useState("");
  const [useSystemPrompt, setUseSystemPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are a viral short-form scriptwriter. Write punchy, hook-first scripts.");

  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [history, setHistory] = useState<string[]>([DEFAULT_SCRIPT]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Record<string, StepStatus>>({
    subject: "done", thinking: "idle", script: "idle", keywords: "idle", done: "idle",
  });
  const [elapsed, setElapsed] = useState(0);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date());

  /* auto save */
  useEffect(() => {
    const t = setTimeout(() => setSavedAt(new Date()), 800);
    return () => clearTimeout(t);
  }, [script, keywords, subject]);

  /* elapsed timer */
  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => setElapsed(e => e + 0.1), 100);
    return () => clearInterval(t);
  }, [generating]);

  const pushHistory = (next: string) => {
    const cut = history.slice(0, historyIdx + 1);
    const nh = [...cut, next].slice(-50);
    setHistory(nh);
    setHistoryIdx(nh.length - 1);
    setScript(next);
  };
  const undo = () => { if (historyIdx > 0) { setHistoryIdx(historyIdx - 1); setScript(history[historyIdx - 1]); } };
  const redo = () => { if (historyIdx < history.length - 1) { setHistoryIdx(historyIdx + 1); setScript(history[historyIdx + 1]); } };

  const startGenerate = async (keywordsOnly = false) => {
    setGenerating(true); setElapsed(0);
    const seq = keywordsOnly ? ["keywords", "done"] : ["thinking", "script", "keywords", "done"];
    setSteps({ subject: "done", thinking: "idle", script: "idle", keywords: "idle", done: "idle" });
    for (const k of seq) {
      setSteps(s => ({ ...s, [k]: "running" }));
      await new Promise(r => setTimeout(r, k === "done" ? 200 : 900));
      setSteps(s => ({ ...s, [k]: "done" }));
    }
    setGenerating(false);
  };

  /* analytics */
  const analytics = useMemo(() => {
    const words = script.trim().split(/\s+/).filter(Boolean).length;
    const chars = script.length;
    const paras = script.split(/\n\s*\n/).filter(Boolean).length;
    const sentences = (script.match(/[.!?]+/g) || []).length;
    const seconds = Math.round((words / 150) * 60);
    return {
      words, chars, paras, sentences,
      duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
      reading: `${Math.max(1, Math.round(words / 200))} min`,
      difficulty: words > 200 ? "Medium" : "Easy",
      quality: Math.min(98, 72 + Math.floor(words / 12)),
    };
  }, [script]);

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Create Video", "Script Studio"]}
        title="Script Studio"
        subtitle="Step 1 of the pipeline — write the subject, generate the script and keywords, then continue to Video Settings."
        actions={<>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary/60 border border-border">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {savedAt ? `Draft saved · ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Saving…"}
          </span>
          <GhostButton><Save className="w-4 h-4" /> Save Draft</GhostButton>
          <PrimaryButton>Continue to Video Settings <ArrowRight className="w-4 h-4" /></PrimaryButton>
        </>}
      />

      <Stepper current={1} />

      <div className="grid grid-cols-12 gap-5 mt-5">
        {/* MAIN */}
        <div className="col-span-12 xl:col-span-8 space-y-5">

          {/* 1. SUBJECT */}
          <SectionCard
            title="Video Subject"
            subtitle="What is your video about?"
            right={<Pill tone="primary">Step 1</Pill>}
          >
            <div className="pt-4 space-y-4">
              <Field label="Subject" hint="A clear sentence works best — the AI uses this to draft the script.">
                <div className="relative">
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder='e.g. "History of AI"'
                  />
                  {subject.trim().length < 3 && (
                    <div className="mt-1.5 text-[11.5px] text-amber-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> Add at least a few words for a better script.
                    </div>
                  )}
                </div>
              </Field>

              <div>
                <div className="text-[11px] font-semibold text-muted-foreground mb-2">EXAMPLES</div>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setSubject(ex)}
                      className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-border hover:border-primary/40 hover:bg-accent/50 text-[12px] font-medium transition"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Language" hint="Detected automatically from your subject by default.">
                <LanguagePicker value={language} onChange={setLanguage} />
              </Field>
            </div>
          </SectionCard>

          {/* 2. GENERATE */}
          <SectionCard title="Script Generation" subtitle="Choose how the AI should write your script" right={<Pill tone="primary">AI</Pill>}>
            <div className="pt-4 grid grid-cols-2 gap-3">
              <button
                disabled={generating}
                onClick={() => startGenerate(false)}
                className="group relative h-[88px] rounded-2xl bg-brand-gradient text-white px-5 text-left overflow-hidden shadow-brand hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.5), transparent 50%)" }} />
                <div className="relative flex items-center gap-3">
                  {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                  <div>
                    <div className="font-display font-bold text-[15px]">Generate Script + Keywords</div>
                    <div className="text-[11.5px] opacity-85">Full pipeline · ~ 8 sec</div>
                  </div>
                </div>
              </button>
              <button
                disabled={generating}
                onClick={() => startGenerate(true)}
                className="group h-[88px] rounded-2xl border-2 border-border hover:border-primary/40 bg-card px-5 text-left transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {generating ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Sparkles className="w-6 h-6 text-primary" />}
                  <div>
                    <div className="font-display font-bold text-[15px]">Generate Keywords Only</div>
                    <div className="text-[11.5px] text-muted-foreground">Reuse current script · ~ 3 sec</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Workflow */}
            <div className="mt-5">
              <Workflow steps={steps} elapsed={elapsed} active={generating} />
            </div>
          </SectionCard>

          {/* ADVANCED */}
          <SectionCard title="Advanced Script Settings" defaultOpen={false}>
            <div className="pt-4 space-y-4">
              <Field label={`Paragraph Count — ${paragraphs}`} hint="Number of paragraphs in the generated script (1–10)">
                <Slider value={paragraphs * 10} onChange={v => setParagraphs(Math.max(1, Math.min(10, Math.round(v / 10))))} />
                <div className="flex justify-between text-[10.5px] text-muted-foreground mt-1 px-0.5">
                  {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i + 1}</span>)}
                </div>
              </Field>

              <Field label="Custom Requirements" hint="Free-form instructions appended to the prompt.">
                <Textarea
                  rows={3}
                  value={customReq}
                  onChange={e => setCustomReq(e.target.value)}
                  placeholder="e.g. Keep it under 60 seconds, mention 3 surprising facts, end with a question."
                />
              </Field>

              <div>
                <div className="text-[11px] font-semibold text-muted-foreground mb-2">QUICK PRESETS</div>
                <div className="flex flex-wrap gap-2">
                  {TONE_PRESETS.map(p => {
                    const I = p.icon;
                    const active = customReq.toLowerCase().includes(p.label.toLowerCase());
                    return (
                      <button
                        key={p.label}
                        onClick={() => setCustomReq(c => active ? c.replace(new RegExp(p.label, "i"), "").trim() : `${c}${c ? " · " : ""}${p.label}`)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${active ? "border-primary bg-accent/60 text-primary" : "border-border hover:border-primary/40 bg-secondary/40"}`}
                      >
                        <I className="w-3.5 h-3.5" /> {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Row label="Use Custom System Prompt">
                <Toggle checked={useSystemPrompt} onChange={setUseSystemPrompt} />
              </Row>
              {useSystemPrompt && (
                <Field label="System Prompt">
                  <Textarea rows={4} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="font-mono text-[12.5px]" />
                </Field>
              )}
            </div>
          </SectionCard>

          {/* SCRIPT EDITOR */}
          <SectionCard
            title="Script Editor"
            subtitle="Edit freely — changes are saved automatically"
            right={<div className="flex items-center gap-1.5">
              <Pill tone="success">Auto-save</Pill>
            </div>}
          >
            <ScriptEditor
              script={script}
              onChange={pushHistory}
              onUndo={undo}
              onRedo={redo}
              canUndo={historyIdx > 0}
              canRedo={historyIdx < history.length - 1}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen(f => !f)}
            />

            {/* Analytics */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              <Stat icon={Clock} label="Duration" value={analytics.duration} />
              <Stat icon={FileText} label="Reading" value={analytics.reading} />
              <Stat icon={Type} label="Words" value={String(analytics.words)} />
              <Stat icon={Hash} label="Characters" value={String(analytics.chars)} />
              <Stat icon={AlignLeft} label="Paragraphs" value={String(analytics.paras)} />
              <Stat icon={AlignLeft} label="Sentences" value={String(analytics.sentences)} />
              <Stat icon={Brain} label="Difficulty" value={analytics.difficulty} />
              <Stat icon={Star} label="Quality" value={`${analytics.quality}/100`} tone="primary" />
            </div>

            {/* Script actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "Copy", icon: Copy },
                { label: "Regenerate", icon: RefreshCw },
                { label: "Improve with AI", icon: Sparkles, primary: true },
                { label: "Rewrite", icon: Wand },
                { label: "Shorter", icon: Minimize2 },
                { label: "Longer", icon: Maximize2 },
                { label: "More Emotional", icon: Smile },
                { label: "More Professional", icon: Briefcase },
                { label: "Simplify", icon: Scissors },
                { label: "Translate", icon: Globe },
              ].map(a => {
                const I = a.icon;
                return (
                  <button
                    key={a.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition ${a.primary ? "bg-brand-gradient text-white border-transparent hover:opacity-90 shadow-brand" : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"}`}
                  >
                    <I className="w-3.5 h-3.5" /> {a.label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* KEYWORDS */}
          <SectionCard
            title="Keywords Manager"
            subtitle="Drives the b-roll search per scene"
            right={<Pill tone="primary">{keywords.length} keywords</Pill>}
          >
            <KeywordsManager keywords={keywords} setKeywords={setKeywords} />
          </SectionCard>

          {/* Footer continue */}
          <div className="flex items-center justify-between pt-2">
            <Link to="/" className="text-[12.5px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Dashboard
            </Link>
            <PrimaryButton className="!h-12 !px-7 !text-[14px]">
              Continue to Video Settings <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
          </div>
        </div>

        {/* SIDE */}
        <div className="col-span-12 xl:col-span-4 space-y-5">
          <div className="xl:sticky xl:top-[88px] space-y-5">
            <LivePreview subject={subject} language={language} script={script} keywords={keywords} duration={analytics.duration} paragraphs={analytics.paras} />
            <AIAssistant duration={analytics.duration} words={analytics.words} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ------------- helpers ------------- */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[12.5px] font-medium">{label}</span>
      {children}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  const items = ["Subject & Script", "Video Settings", "Voice & Subtitles", "Render"];
  return (
    <div className="mt-1 mb-5">
      <div className="flex items-center gap-2 p-2 rounded-2xl border border-border bg-card/70 overflow-x-auto">
        {items.map((it, i) => {
          const done = i < current;
          const active = i === current - 1;
          return (
            <div key={it} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold ${active ? "bg-accent/70 text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] ${active ? "bg-brand-gradient text-white" : done ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </span>
                {it}
              </div>
              {i < items.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LanguagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const selected = LANGUAGES.find(l => l.code === value) || LANGUAGES[0];
  const filtered = LANGUAGES.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));
  const recent = RECENT.map(c => LANGUAGES.find(l => l.code === c)!).filter(Boolean);
  const favs = FAVORITES.map(c => LANGUAGES.find(l => l.code === c)!).filter(Boolean);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3 rounded-lg border border-border bg-card flex items-center justify-between text-[13px] hover:border-primary/40 transition"
      >
        <span className="flex items-center gap-2"><span className="text-base">{selected.flag}</span>{selected.name}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search languages…"
                className="w-full h-8 pl-8 pr-2 rounded-md bg-secondary/60 text-[12.5px] outline-none border border-transparent focus:border-primary/40"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {!q && favs.length > 0 && <Group title="Favorites" items={favs} value={value} onPick={(c) => { onChange(c); setOpen(false); }} starred />}
            {!q && recent.length > 0 && <Group title="Recent" items={recent} value={value} onPick={(c) => { onChange(c); setOpen(false); }} />}
            <Group title="All Languages" items={filtered} value={value} onPick={(c) => { onChange(c); setOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ title, items, value, onPick, starred }: { title: string; items: typeof LANGUAGES; value: string; onPick: (c: string) => void; starred?: boolean }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground">{title.toUpperCase()}</div>
      {items.map(l => (
        <button
          key={l.code + title}
          onClick={() => onPick(l.code)}
          className={`w-full px-3 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-accent/50 ${value === l.code ? "bg-accent/60 text-primary font-semibold" : ""}`}
        >
          <span className="text-base">{l.flag}</span>
          <span className="flex-1 text-left">{l.name}</span>
          {starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
          {value === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
        </button>
      ))}
    </div>
  );
}

function Workflow({ steps, elapsed, active }: { steps: Record<string, StepStatus>; elapsed: number; active: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold tracking-wider text-muted-foreground">PIPELINE</div>
        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-3">
          <span>Est. ~ 8.0s</span>
          <span className={active ? "text-primary font-semibold" : ""}>Elapsed {elapsed.toFixed(1)}s</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {PIPELINE_STEPS.map((s, i) => {
          const st = steps[s.key];
          const I = s.icon;
          const tone =
            st === "done" ? "bg-emerald-500 text-white border-emerald-500"
            : st === "running" ? "bg-brand-gradient text-white border-transparent"
            : st === "failed" ? "bg-red-500 text-white border-red-500"
            : "bg-card text-muted-foreground border-border";
          return (
            <div key={s.key} className="flex-1 flex items-center gap-2 min-w-0">
              <div className={`shrink-0 w-9 h-9 rounded-full border-2 grid place-items-center transition ${tone}`}>
                {st === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> : st === "done" ? <CheckCircle2 className="w-4 h-4" /> : <I className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-[11.5px] font-semibold truncate">{s.label}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{st === "idle" ? "Pending" : st}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] rounded-full ${st === "done" ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScriptEditor(props: {
  script: string;
  onChange: (s: string) => void;
  onUndo: () => void; onRedo: () => void;
  canUndo: boolean; canRedo: boolean;
  fullscreen: boolean; onToggleFullscreen: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const tools = [
    { label: "Undo", icon: Undo2, on: props.onUndo, disabled: !props.canUndo },
    { label: "Redo", icon: Redo2, on: props.onRedo, disabled: !props.canRedo },
    { label: "Copy", icon: Copy, on: () => navigator.clipboard?.writeText(props.script) },
    { label: "Paste", icon: ListChecks, on: async () => { try { props.onChange((await navigator.clipboard.readText()) || props.script); } catch {} } },
    { label: "Clear", icon: Trash2, on: () => props.onChange("") },
    { label: "Import TXT", icon: Upload, on: () => fileRef.current?.click() },
    { label: "Export TXT", icon: Download, on: () => {
        const blob = new Blob([props.script], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "script.txt"; a.click(); URL.revokeObjectURL(url);
      } },
    { label: props.fullscreen ? "Collapse" : "Fullscreen", icon: props.fullscreen ? Minimize2 : Maximize, on: props.onToggleFullscreen },
  ];

  return (
    <div className={`mt-4 ${props.fullscreen ? "fixed inset-4 z-50 bg-card border border-border rounded-3xl shadow-2xl p-5 flex flex-col" : ""}`}>
      <div className="flex flex-wrap items-center gap-1 mb-2">
        {tools.map(t => {
          const I = t.icon;
          return (
            <button
              key={t.label}
              onClick={t.on}
              disabled={t.disabled}
              title={t.label}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11.5px] font-medium hover:bg-accent/60 text-muted-foreground hover:text-foreground transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <I className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
        <input ref={fileRef} type="file" accept=".txt" className="hidden"
          onChange={async e => { const f = e.target.files?.[0]; if (f) props.onChange(await f.text()); }} />
      </div>
      <Textarea
        rows={props.fullscreen ? 24 : 10}
        value={props.script}
        onChange={e => props.onChange(e.target.value)}
        className={`font-mono text-[12.5px] leading-relaxed ${props.fullscreen ? "flex-1 !min-h-0" : ""}`}
      />
    </div>
  );
}

function Stat({ icon: I, label, value, tone }: { icon: any; label: string; value: string; tone?: "primary" }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === "primary" ? "border-primary/30 bg-accent/30" : "border-border bg-secondary/30"}`}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-muted-foreground">
        <I className="w-3 h-3" /> {label.toUpperCase()}
      </div>
      <div className={`mt-1 font-display font-bold text-[15px] ${tone === "primary" ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function KeywordsManager({ keywords, setKeywords }: { keywords: string[]; setKeywords: (k: string[]) => void }) {
  const [adding, setAdding] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState("");
  const dragIdx = useRef<number | null>(null);

  const add = () => {
    const v = adding.trim();
    if (!v) return;
    setKeywords([...keywords, ...v.split(",").map(s => s.trim()).filter(Boolean)]);
    setAdding("");
  };

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDrop = (i: number) => {
    const from = dragIdx.current;
    if (from === null || from === i) return;
    const next = [...keywords];
    const [m] = next.splice(from, 1);
    next.splice(i, 0, m);
    setKeywords(next);
    dragIdx.current = null;
  };

  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={adding}
            onChange={e => setAdding(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Type a keyword and press Enter (comma to add multiple)…"
          />
        </div>
        <GhostButton onClick={add}><Plus className="w-4 h-4" /> Add</GhostButton>
        <GhostButton onClick={() => navigator.clipboard?.writeText(keywords.join(", "))}><Copy className="w-4 h-4" /> Copy All</GhostButton>
        <GhostButton onClick={() => setKeywords([])}><Trash2 className="w-4 h-4" /> Clear</GhostButton>
        <PrimaryButton><RefreshCw className="w-4 h-4" /> Regenerate</PrimaryButton>
      </div>

      {keywords.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
          <ListChecks className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <div className="font-display font-semibold text-[14px]">No keywords yet</div>
          <div className="text-[12px] text-muted-foreground">Generate keywords or add your own to drive b-roll search.</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-border bg-secondary/20 min-h-[80px]">
          {keywords.map((k, i) => (
            <div
              key={`${k}-${i}`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="group inline-flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-lg bg-card border border-border hover:border-primary/40 text-[12px] font-medium transition cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground/60" />
              {editingIdx === i ? (
                <input
                  autoFocus
                  value={editingVal}
                  onChange={e => setEditingVal(e.target.value)}
                  onBlur={() => { const n = [...keywords]; n[i] = editingVal.trim() || k; setKeywords(n); setEditingIdx(null); }}
                  onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  className="bg-transparent outline-none text-[12px] w-[120px]"
                />
              ) : (
                <button onClick={() => { setEditingIdx(i); setEditingVal(k); }} className="text-primary">{k}</button>
              )}
              <a
                href={`https://www.pexels.com/search/videos/${encodeURIComponent(k)}/`}
                target="_blank" rel="noreferrer"
                title="Search preview"
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-3 h-3" />
              </a>
              <button
                onClick={() => setKeywords(keywords.filter((_, j) => j !== i))}
                className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11.5px] text-muted-foreground flex items-center gap-3">
        <span>{keywords.length} keywords</span>
        <span>·</span>
        <span>Tip: drag to reorder, click to edit, eye icon to preview b-roll on Pexels.</span>
      </div>
    </div>
  );
}

function LivePreview({ subject, language, script, keywords, duration, paragraphs }: {
  subject: string; language: string; script: string; keywords: string[]; duration: string; paragraphs: number;
}) {
  const lang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  return (
    <Card className="!rounded-3xl">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[15px]">Live Preview</h3>
          <Pill tone="primary"><Eye className="w-3 h-3" /> Instant</Pill>
        </div>
        <div className="relative aspect-[9/16] rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_60%)]" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/90 text-[10px] font-semibold">
            <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded-md">{lang.flag} {lang.name}</span>
            <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded-md">{duration}</span>
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 text-center">
            <div className="text-white/70 text-[10px] font-semibold tracking-widest mb-2">SUBJECT</div>
            <div className="text-white font-display font-extrabold text-[18px] leading-tight line-clamp-3">{subject || "Untitled video"}</div>
          </div>
          <div className="absolute bottom-4 left-3 right-3">
            <div className="rounded-lg bg-black/45 backdrop-blur p-2.5 text-white text-[11px] leading-snug line-clamp-3">
              {script.slice(0, 160) || "Your script preview will appear here."}…
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11.5px]">
          <Mini label="Paragraphs" value={String(paragraphs)} />
          <Mini label="Duration" value={duration} />
          <Mini label="Language" value={lang.name.split(" ")[0]} />
          <Mini label="Keywords" value={String(keywords.length)} />
        </div>

        <div className="mt-3">
          <div className="text-[10.5px] font-semibold tracking-wider text-muted-foreground mb-1.5">CURRENT KEYWORDS</div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.slice(0, 8).map(k => (
              <span key={k} className="px-2 py-0.5 rounded-md bg-accent/50 text-primary text-[10.5px] font-medium">{k}</span>
            ))}
            {keywords.length > 8 && <span className="text-[10.5px] text-muted-foreground">+{keywords.length - 8} more</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 border border-border px-2.5 py-1.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-[13px]">{value}</div>
    </div>
  );
}

function AIAssistant({ duration, words }: { duration: string; words: number }) {
  const items = [
    { icon: Clock, label: "Script Length", value: `${words} words` },
    { icon: Play, label: "Shorts Duration", value: duration },
    { icon: Mic2, label: "Suggested Voice", value: "Adam — Narrator (M)" },
    { icon: SubsIcon, label: "Subtitle Style", value: "Bold Center · Highlight" },
    { icon: Film, label: "Video Style", value: "Cinematic" },
    { icon: Music2, label: "Background Music", value: "Cinematic Ambient — Glow" },
    { icon: Layers, label: "Overlay", value: "Film Grain · Light Leak" },
    { icon: Palette, label: "Color Theme", value: "Forest · Emerald" },
    { icon: Zap, label: "Transition", value: "Smart cuts" },
    { icon: SubsIcon, label: "Caption Preset", value: "Viral Shorts v2" },
  ];
  return (
    <Card className="!rounded-3xl">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[15px] flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Assistant</h3>
          <Pill tone="primary">Suggestions</Pill>
        </div>
        <div className="text-[11.5px] text-muted-foreground mb-3">Recommendations based on your subject and script.</div>
        <div className="space-y-1.5">
          {items.map(it => {
            const I = it.icon;
            return (
              <div key={it.label} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/40 transition">
                <div className="w-7 h-7 rounded-lg bg-accent/60 grid place-items-center shrink-0">
                  <I className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] text-muted-foreground">{it.label}</div>
                  <div className="text-[12.5px] font-semibold truncate">{it.value}</div>
                </div>
                <Circle className="w-3 h-3 text-muted-foreground/40" />
              </div>
            );
          })}
        </div>
        <button className="mt-3 w-full h-9 rounded-lg border border-border text-[12px] font-semibold hover:border-primary/40 hover:bg-accent/40 transition inline-flex items-center justify-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5" /> Apply all suggestions
        </button>
      </div>
    </Card>
  );
}
