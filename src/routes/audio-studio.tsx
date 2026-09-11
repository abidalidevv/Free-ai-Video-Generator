import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell, PageHeader, SectionCard, Field, Input, Select, Slider, Pill,
  PrimaryButton, GhostButton, Toggle,
} from "@/components/app-shell";
import {
  Mic2, Search, Heart, Play, Pause, RotateCcw, Star, Sparkles, Crown,
  Upload, FileAudio, Trash2, Replace, Music2, Volume2, Wand2, Info,
  CheckCircle2, Clock, Zap, DollarSign, Save, AlertCircle, Plus, Lock,
  Headphones, Repeat, ArrowDownToLine, ArrowUpFromLine, Scissors, Globe2,
  Waves, MessageSquare, Mic, BookOpen, Code2, Volume1, Users,
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { subtitleService } from "@/services/subtitle.service";
import { useAppState } from "@/store/app-state";

export const Route = createFileRoute("/audio-studio")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } =>
    typeof search.tab === "string" ? { tab: search.tab } : {},
  head: () => ({ meta: [{ title: "Audio Studio — VideoForge AI" }] }),
  component: AudioStudioPage,
});

const SECTION_ANCHORS: Record<string, string> = {
  voices: "audio-voices",
  music: "audio-music",
};

/* ───────────────────────── data ───────────────────────── */

const providers = [
  { id: "azure-v1", name: "Azure TTS V1", tag: "MS", langs: 140, voices: "400+", quality: "Ultra HD", rating: 4.8, status: "connected", recommended: true, default: true, tint: "from-sky-500 to-blue-700" },
  { id: "azure-v2", name: "Azure TTS V2", tag: "MS", langs: 80, voices: "200+", quality: "Neural", rating: 4.9, status: "connected", premium: true, tint: "from-blue-500 to-indigo-700" },
  { id: "eleven", name: "ElevenLabs", tag: "11", langs: 32, voices: "1000+", quality: "Studio", rating: 5.0, status: "connected", premium: true, recommended: true, tint: "from-violet-500 to-purple-700" },
  { id: "gemini", name: "Gemini TTS", tag: "G", langs: 40, voices: "120+", quality: "Neural", rating: 4.7, status: "connected", tint: "from-fuchsia-500 to-pink-700" },
  { id: "openai", name: "OpenAI TTS", tag: "AI", langs: 57, voices: "6", quality: "HD", rating: 4.6, status: "connected", tint: "from-emerald-500 to-teal-700" },
  { id: "edge", name: "Edge TTS", tag: "E", langs: 110, voices: "300+", quality: "Standard", rating: 4.2, status: "connected", free: true, tint: "from-cyan-500 to-sky-700" },
  { id: "silicon", name: "SiliconFlow", tag: "SF", langs: 18, voices: "80", quality: "HD", rating: 4.4, status: "idle", tint: "from-amber-500 to-orange-700" },
  { id: "mimo", name: "MiMo TTS", tag: "Mi", langs: 12, voices: "40", quality: "HD", rating: 4.3, status: "idle", soon: true, tint: "from-rose-500 to-red-700" },
  { id: "custom", name: "Custom Provider", tag: "+", langs: 0, voices: "—", quality: "Custom", rating: 0, status: "idle", custom: true, tint: "from-slate-500 to-zinc-700" },
];

const voices = [
  { name: "Aria", lang: "English (US)", accent: "Neutral", gender: "F", quality: 5, natural: "Ultra Natural", premium: true, fav: true, selected: true, tint: "from-emerald-600 to-emerald-900" },
  { name: "Adam", lang: "English (US)", accent: "American", gender: "M", quality: 5, natural: "Ultra Natural", premium: true, recent: true, tint: "from-blue-600 to-indigo-900" },
  { name: "Charlotte", lang: "English (UK)", accent: "British", gender: "F", quality: 5, natural: "Studio", premium: true, tint: "from-rose-600 to-pink-900" },
  { name: "Daniel", lang: "English (UK)", accent: "British", gender: "M", quality: 4, natural: "Natural", recommended: true, tint: "from-violet-600 to-purple-900" },
  { name: "Sofia", lang: "Spanish (ES)", accent: "Castilian", gender: "F", quality: 4, natural: "Natural", recent: true, tint: "from-amber-600 to-orange-900" },
  { name: "Mateo", lang: "Spanish (MX)", accent: "Mexican", gender: "M", quality: 4, natural: "Natural", tint: "from-orange-600 to-red-900" },
  { name: "Hiroshi", lang: "Japanese", accent: "Tokyo", gender: "M", quality: 5, natural: "Ultra Natural", premium: true, tint: "from-fuchsia-600 to-pink-900" },
  { name: "Amira", lang: "Arabic", accent: "Cairo", gender: "F", quality: 4, natural: "Natural", fav: true, tint: "from-cyan-600 to-teal-900" },
  { name: "Luca", lang: "Italian", accent: "Roman", gender: "M", quality: 5, natural: "Studio", premium: true, tint: "from-red-600 to-rose-900" },
  { name: "Mei", lang: "Chinese", accent: "Mandarin", gender: "F", quality: 4, natural: "Natural", recommended: true, tint: "from-pink-600 to-fuchsia-900" },
  { name: "Nora", lang: "English (US)", accent: "Neutral", gender: "F", quality: 4, natural: "Natural", tint: "from-stone-600 to-stone-900" },
  { name: "Marcus", lang: "English (US)", accent: "American", gender: "M", quality: 5, natural: "Trailer", premium: true, tint: "from-zinc-700 to-zinc-900" },
];

/* ───────────────────────── page ───────────────────────── */

function AudioStudioPage() {
  const { state, dispatch } = useAppState();
  const [provider, setProvider] = useState("azure-v1");
  const [voice, setVoice] = useState(state.selectedVoice?.name || "Aria");
  const [filter, setFilter] = useState("All");
  const [gender, setGender] = useState("All");
  const [lang, setLang] = useState("All Languages");
  const [accent, setAccent] = useState("All Accents");
  const [musicType, setMusicType] = useState(state.audioSettings?.bgmMode === "none" ? "No Music" : state.audioSettings?.bgmTrackId ? "Custom Music" : "Random");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(state.audioSettings?.bgmTrackId ? String(state.audioSettings.bgmTrackId) : null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tab: tabParam } = Route.useSearch();

  // Query live background music tracks from MPT backend
  const { data: bgmFiles, isLoading: isBgmLoading, refetch: refetchBgm } = useQuery({
    queryKey: ["bgm", "list"],
    queryFn: ({ signal }) => subtitleService.bgm(signal),
  });

  const handleSelectVoice = (v: (typeof voices)[0]) => {
    setVoice(v.name);
    dispatch({
      type: "SET_VOICE",
      payload: {
        id: v.name,
        name: v.name,
        language: v.lang,
        gender: v.gender === "M" ? "male" : "female",
        provider: "edge",
        quality: "ultra-hd",
        previewUrl: "",
      },
    });
    dispatch({
      type: "PATCH_AUDIO",
      payload: { voiceId: v.name },
    });
  };

  const handleSelectBgm = (trackId: string) => {
    setSelectedTrack(trackId);
    setMusicType("Custom Music");
    dispatch({
      type: "PATCH_AUDIO",
      payload: {
        bgmMode: "custom",
        bgmTrackId: trackId,
      },
    });
  };

  const handleMusicTypeChange = (type: string) => {
    setMusicType(type);
    if (type === "No Music") {
      setSelectedTrack(null);
      dispatch({
        type: "PATCH_AUDIO",
        payload: { bgmMode: "none", bgmTrackId: undefined },
      });
    } else if (type === "Random") {
      setSelectedTrack(null);
      dispatch({
        type: "PATCH_AUDIO",
        payload: { bgmMode: "preset", bgmTrackId: undefined },
      });
    }
  };

  const handleUploadBgm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const res = await subtitleService.uploadBgm(file);
      if (res?.file) {
        setUploadSuccess(res.file);
        handleSelectBgm(res.file);
        refetchBgm();
      }
    } catch (err: any) {
      console.error("Failed to upload BGM:", err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const anchor = tabParam ? SECTION_ANCHORS[tabParam] : undefined;
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tabParam]);

  const selectedVoice = voices.find(v => v.name === voice) ?? voices[0];

  const filtered = voices.filter(v => {
    if (filter === "Favorites" && !v.fav) return false;
    if (filter === "Recent" && !v.recent) return false;
    if (filter === "Recommended" && !v.recommended) return false;
    if (filter === "Premium" && !v.premium) return false;
    if (gender !== "All" && v.gender !== (gender === "Male" ? "M" : "F")) return false;
    if (lang !== "All Languages" && !v.lang.includes(lang)) return false;
    return true;
  });

  return (
    <AppShell>
      <PageHeader
        crumb={["Create Video", "Audio Studio"]}
        title="Audio Studio"
        subtitle="Voices, speech, music & sound — everything that gives your video a voice."
        actions={
          <>
            <div className="hidden lg:flex items-center gap-2 px-3 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-semibold">
              <Save className="w-3.5 h-3.5" /> Draft saved · 12s ago
            </div>
            <GhostButton><RotateCcw className="w-4 h-4" /> Reset</GhostButton>
            <PrimaryButton><Wand2 className="w-4 h-4" /> Generate Audio</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-9 space-y-6">

          {/* 1 — TTS PROVIDER */}
          <SectionCard
            title="TTS Provider"
            subtitle="Choose the engine that powers speech generation."
            right={<Pill tone="primary">9 providers</Pill>}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {providers.map(p => (
                <ProviderCard key={p.id} p={p} active={provider === p.id} onClick={() => !p.soon && setProvider(p.id)} />
              ))}
            </div>
          </SectionCard>

          {/* 2 — VOICE LIBRARY */}
          <div id="audio-voices" className="scroll-mt-28">
          <SectionCard
            title="Voice Library"
            subtitle="Browse, preview and pin the perfect voice."
            right={<Pill tone="success">{filtered.length} voices</Pill>}
          >
            <div className="grid grid-cols-12 gap-3 mb-4">
              <div className="col-span-12 lg:col-span-5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search voices, accents, styles…" className="pl-9" />
                </div>
              </div>
              <div className="col-span-6 lg:col-span-3">
                <Select value={lang} onChange={e => setLang(e.target.value)}>
                  <option>All Languages</option>
                  <option>English</option><option>Spanish</option><option>French</option>
                  <option>Arabic</option><option>Japanese</option><option>Chinese</option>
                </Select>
              </div>
              <div className="col-span-6 lg:col-span-2">
                <Select value={gender} onChange={e => setGender(e.target.value)}>
                  <option>All</option><option>Male</option><option>Female</option>
                </Select>
              </div>
              <div className="col-span-12 lg:col-span-2">
                <Select value={accent} onChange={e => setAccent(e.target.value)}>
                  <option>All Accents</option><option>American</option><option>British</option>
                  <option>Australian</option><option>Indian</option>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {["All", "Recommended", "Favorites", "Recent", "Premium"].map(t => (
                <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
                  {t === "Favorites" && <Heart className="w-3 h-3" />}
                  {t === "Premium" && <Crown className="w-3 h-3" />}
                  {t === "Recommended" && <Sparkles className="w-3 h-3" />}
                  {t === "Recent" && <Clock className="w-3 h-3" />}
                  {t}
                </Chip>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(v => (
                <VoiceCard key={v.name} v={v} selected={voice === v.name} onSelect={() => setVoice(v.name)} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                  <Mic className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No voices match your filters.
                </div>
              )}
            </div>
          </SectionCard>
          </div>

          {/* 3 — VOICE CONTROLS */}
          <SectionCard title="Voice Controls" subtitle="Fine-tune the delivery.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <SliderRow label="Speech Volume" icon={Volume2} value={100} min={50} max={300} suffix="%" />
              <SliderRow label="Speech Speed" icon={Zap} value={100} min={50} max={300} suffix="%" />
              <PlaceholderField label="Pitch" icon={Waves} />
              <PlaceholderField label="Emotion" icon={Sparkles} />
              <PlaceholderField label="Style" icon={Wand2} />
              <PlaceholderField label="Pause Length" icon={Clock} />
            </div>
          </SectionCard>

          {/* 4 — VOICE PREVIEW */}
          <SectionCard title="Voice Preview" subtitle="Listen before you generate.">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white p-5">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedVoice.tint} grid place-items-center text-white font-display font-extrabold text-2xl shadow-brand`}>
                  {selectedVoice.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-bold text-[17px]">{selectedVoice.name}</div>
                    <Pill tone="primary">{selectedVoice.natural}</Pill>
                    {selectedVoice.premium && <Pill tone="warning">PRO</Pill>}
                  </div>
                  <div className="text-[12.5px] text-muted-foreground mt-1">
                    {selectedVoice.lang} · {selectedVoice.accent} · {selectedVoice.gender === "F" ? "Female" : "Male"}
                  </div>
                  <div className="mt-3 rounded-lg bg-white border border-border p-3 text-[13px] leading-relaxed text-foreground/80 italic">
                    "Welcome to VideoForge AI — where every story finds its perfect voice. Let's make something unforgettable."
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="w-12 h-12 rounded-full bg-brand-gradient grid place-items-center text-white shadow-brand hover:scale-105 transition"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-border grid place-items-center hover:bg-muted transition">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="flex-1 mx-2">
                  <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full w-[34%] bg-brand-gradient rounded-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                    <span>0:04</span><span>0:12</span>
                  </div>
                </div>
                <GhostButton><Headphones className="w-4 h-4" /> Sample</GhostButton>
              </div>
            </div>
          </SectionCard>

          {/* 5 — CUSTOM AUDIO */}
          <SectionCard title="Custom Audio" subtitle="Upload your own voiceover or narration.">
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/40 transition cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-brand-gradient grid place-items-center mx-auto mb-3 shadow-brand">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div className="font-display font-bold text-[15px]">Drop your audio file here</div>
              <div className="text-[12.5px] text-muted-foreground mt-1">
                MP3 · WAV · AAC · M4A · FLAC · OGG · up to 200 MB
              </div>
              <PrimaryButton className="mt-4 mx-auto">Choose File</PrimaryButton>
            </div>

            {/* example uploaded file */}
            <div className="mt-4 rounded-xl border border-border bg-white p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] truncate">narration_v3_final.mp3</div>
                <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground mt-0.5">
                  <span>00:47</span><span>·</span><span>4.2 MB</span><span>·</span><span>MP3 · 44.1 kHz</span>
                </div>
                <div className="mt-2 h-7 rounded bg-emerald-50 flex items-end gap-[2px] px-2 py-1 overflow-hidden">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400"
                      style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 70}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <IconBtn title="Play"><Play className="w-4 h-4" /></IconBtn>
                <IconBtn title="Replace"><Replace className="w-4 h-4" /></IconBtn>
                <IconBtn title="Delete" danger><Trash2 className="w-4 h-4" /></IconBtn>
              </div>
            </div>
          </SectionCard>

          {/* 6 — BACKGROUND MUSIC */}
          <div id="audio-music" className="scroll-mt-28">
          <SectionCard title="Background Music" subtitle="Set the mood with a soundtrack.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {[
                { id: "Random", icon: Sparkles, desc: "Smart pick per scene" },
                { id: "No Music", icon: Volume1, desc: "Voice only" },
                { id: "Custom Music", icon: Upload, desc: "Upload your track" },
              ].map(o => (
                <button
                  key={o.id}
                  onClick={() => handleMusicTypeChange(o.id)}
                  className={`text-left rounded-xl border p-4 transition ${
                    musicType === o.id
                      ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                      : "border-border bg-white hover:border-emerald-300"
                  }`}
                >
                  <o.icon className="w-5 h-5 text-emerald-700 mb-2" />
                  <div className="font-display font-bold text-[14px]">{o.id}</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">{o.desc}</div>
                </button>
              ))}
            </div>

            <Field label="Music Library (Live MoneyPrinterTurbo BGM)">
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadBgm}
                  accept=".mp3,.wav,.m4a,.aac,.flac,.ogg"
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Available MPT Tracks: {bgmFiles?.length || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? "Uploading..." : "Upload Custom BGM"}
                  </button>
                </div>

                {uploadSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Uploaded & Selected: <strong>{uploadSuccess}</strong></span>
                  </div>
                )}

                {isBgmLoading ? (
                  <div className="rounded-xl border border-border p-6 text-center text-xs text-muted-foreground">
                    Loading MPT audio tracks...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {bgmFiles && bgmFiles.length > 0 ? (
                      bgmFiles.map((track) => {
                        const isSelected = selectedTrack === track.id;
                        return (
                          <div
                            key={track.id}
                            onClick={() => handleSelectBgm(track.id)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50/70 font-semibold text-emerald-900"
                                : "border-border bg-white hover:border-emerald-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Music2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-600" : "text-muted-foreground"}`} />
                              <span className="truncate">{track.name}</span>
                            </div>
                            {isSelected && (
                              <span className="shrink-0 text-emerald-600 font-bold ml-2">✓ Selected</span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-4 text-xs text-muted-foreground">
                        No BGM files found in MPT resource/songs.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mt-5">
              <SliderRow label="Music Volume" icon={Volume2} value={35} min={0} max={100} suffix="%" />
              <div className="space-y-3">
                <RowToggle icon={Repeat} label="Loop Music" />
                <RowToggle icon={ArrowUpFromLine} label="Fade In" defaultOn />
                <RowToggle icon={ArrowDownToLine} label="Fade Out" defaultOn />
                <RowToggle icon={Scissors} label="Auto Trim to Video Length" defaultOn />
              </div>
            </div>
          </SectionCard>
          </div>

          {/* 8 — FUTURE FEATURES */}
          <SectionCard
            title="Coming Soon"
            subtitle="Next-generation audio tools landing in the next releases."
            right={<Pill tone="warning">Roadmap</Pill>}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {[
                { icon: Mic, label: "Voice Cloning" },
                { icon: Zap, label: "Instant Clone" },
                { icon: Sparkles, label: "Voice Training" },
                { icon: Users, label: "Voice Profiles" },
                { icon: MessageSquare, label: "Multi Speaker" },
                { icon: Globe2, label: "Conversation Mode" },
                { icon: Heart, label: "Emotion Control" },
                { icon: BookOpen, label: "Pronunciation Dict." },
                { icon: Code2, label: "SSML Editor" },
                { icon: Waves, label: "Noise Removal" },
              ].map(f => (
                <FutureCard key={f.label} icon={f.icon} label={f.label} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ─── STICKY SIDE RAIL ─── */}
        <aside className="col-span-12 xl:col-span-3">
          <div className="xl:sticky xl:top-[88px] space-y-4">
            {/* AI Recommendations */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-gradient grid place-items-center shadow-brand">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-[14px]">AI Recommendations</div>
                  <div className="text-[11px] text-muted-foreground">Based on your script & style</div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <RecRow label="Best Voice" value="Aria · EN-US" />
                <RecRow label="Best Accent" value="Neutral American" />
                <RecRow label="Best Speed" value="1.05x" />
                <RecRow label="Background Music" value="Cinematic Pulse" />
                <RecRow label="Subtitle Style" value="Bold Caption · Yellow" />
              </div>

              <button className="mt-4 w-full h-9 rounded-lg bg-brand-gradient text-white text-[12.5px] font-semibold shadow-brand hover:opacity-95 transition flex items-center justify-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Apply All
              </button>
            </div>

            {/* Estimates */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="font-display font-bold text-[14px] mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-emerald-700" /> Estimated Output
              </div>
              <Estimate icon={Clock} label="Audio Duration" value="00:47" tone="primary" />
              <Estimate icon={Star} label="Voice Quality" value="Ultra HD · 5.0" tone="success" />
              <Estimate icon={DollarSign} label="Estimated Cost" value="$0.014" tone="default" />
              <Estimate icon={Zap} label="Render Time" value="~ 8s" tone="default" />
            </div>

            {/* Validation */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-[12px] text-amber-800 leading-snug">
                  <b>Heads up.</b> ElevenLabs uses Premium credits. Switch to Edge TTS for unlimited free runs.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

/* ───────────────────────── components ───────────────────────── */

function ProviderCard({ p, active, onClick }: { p: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={p.soon}
      className={`group relative text-left rounded-2xl border p-4 transition overflow-hidden ${
        active
          ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/30"
          : "border-border bg-white hover:border-emerald-300 hover:shadow-sm"
      } ${p.soon ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {p.recommended && (
        <span className="absolute top-2 right-2 text-[9.5px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">REC</span>
      )}
      {p.soon && (
        <span className="absolute top-2 right-2 text-[9.5px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">SOON</span>
      )}
      {p.default && !p.recommended && (
        <span className="absolute top-2 right-2 text-[9.5px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-700 text-white">DEFAULT</span>
      )}

      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.tint} grid place-items-center text-white font-display font-extrabold text-[13px] shadow-sm`}>
          {p.custom ? <Plus className="w-4 h-4" /> : p.tag}
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-[13.5px] truncate">{p.name}</div>
          <div className="text-[10.5px] text-muted-foreground flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              p.status === "connected" ? "bg-emerald-500" : "bg-slate-300"
            }`} />
            {p.status === "connected" ? "Connected" : p.soon ? "Coming soon" : "Not configured"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{p.langs} langs · {p.voices}</span>
        {p.rating > 0 && (
          <span className="flex items-center gap-0.5 font-semibold text-amber-600">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {p.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{p.quality}</span>
        {p.premium && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" />PRO</span>}
        {p.free && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">FREE</span>}
      </div>
    </button>
  );
}

function VoiceCard({ v, selected, onSelect }: { v: any; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border p-3.5 cursor-pointer transition ${
        selected
          ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30 shadow-sm"
          : "border-border bg-white hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5"
      }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white grid place-items-center">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${v.tint} grid place-items-center text-white font-display font-extrabold shadow-sm`}>
          {v.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="font-display font-bold text-[13.5px] truncate">{v.name}</div>
            {v.premium && <Crown className="w-3 h-3 text-violet-600" />}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">{v.lang} · {v.accent}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-[10.5px]">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{v.gender === "F" ? "Female" : "Male"}</span>
          <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-2.5 h-2.5 ${i < v.quality ? "fill-amber-500 text-amber-500" : "text-slate-200"}`} />
            ))}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full bg-white border border-border grid place-items-center hover:bg-emerald-50 transition" title="Preview">
            <Play className="w-3 h-3 ml-0.5" />
          </button>
          <button onClick={e => e.stopPropagation()} className={`w-7 h-7 rounded-full border grid place-items-center transition ${
            v.fav ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-border hover:bg-rose-50"
          }`} title="Favorite">
            <Heart className={`w-3 h-3 ${v.fav ? "fill-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-2 text-[10px] font-semibold tracking-wider uppercase text-emerald-700">{v.natural}</div>
    </div>
  );
}

function SliderRow({ label, icon: Icon, value, min, max, suffix }: { label: string; icon: any; value: number; min: number; max: number; suffix?: string }) {
  const [v, setV] = useState(value);
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
        <div className="flex-1"><Slider value={v} min={min} max={max} onChange={setV} /></div>
        <div className="w-14 text-right text-[12.5px] font-mono font-semibold text-foreground">{v}{suffix}</div>
      </div>
    </Field>
  );
}

function PlaceholderField({ label, icon: Icon }: { label: string; icon: any }) {
  return (
    <Field label={label} hint="Coming soon">
      <div className="flex items-center gap-2 px-3 h-10 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-[12.5px]">
        <Icon className="w-4 h-4" />
        <span>Future-ready · placeholder</span>
        <Lock className="w-3 h-3 ml-auto" />
      </div>
    </Field>
  );
}

function RowToggle({ icon: Icon, label, defaultOn }: { icon: any; label: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <Icon className="w-4 h-4 text-emerald-700" />
        {label}
      </div>
      <Toggle checked={defaultOn} />
    </div>
  );
}

function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 h-7 rounded-full text-[12px] font-semibold border transition ${
        active
          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
          : "bg-white border-border text-foreground hover:border-emerald-300"
      }`}
    >
      {children}
    </button>
  );
}

function IconBtn({ children, title, danger }: { children: ReactNode; title: string; danger?: boolean }) {
  return (
    <button
      title={title}
      className={`w-8 h-8 rounded-lg border grid place-items-center transition ${
        danger
          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
          : "border-border text-foreground/70 hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function FutureCard({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="relative rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center hover:bg-muted/40 transition">
      <div className="absolute top-2 right-2 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">SOON</div>
      <div className="w-9 h-9 rounded-lg bg-white border border-border grid place-items-center mx-auto mb-2">
        <Icon className="w-4 h-4 text-emerald-700" />
      </div>
      <div className="text-[12px] font-semibold">{label}</div>
    </div>
  );
}

function RecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function Estimate({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "default" | "success" | "primary" }) {
  const tones = {
    default: "text-foreground/70",
    success: "text-emerald-700",
    primary: "text-emerald-700",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 ${tones[tone]}`} />
        {label}
      </div>
      <div className="text-[12.5px] font-semibold font-mono">{value}</div>
    </div>
  );
}
