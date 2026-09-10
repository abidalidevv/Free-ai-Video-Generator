import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader, SectionCard, Input, GhostButton, PrimaryButton, Pill } from "@/components/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search, KeyRound, Mic2, Subtitles, Rocket, Keyboard, LifeBuoy, X,
} from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Documentation — VideoForge AI" },
      { name: "description", content: "Setup guides, configuration reference, keyboard shortcuts and troubleshooting for VideoForge AI." },
      { property: "og:title", content: "Help & Documentation — VideoForge AI" },
      { property: "og:description", content: "Setup guides, configuration reference, keyboard shortcuts and troubleshooting for VideoForge AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const CHIPS = ["FFmpeg Setup", "Gemini API", "Whisper Models", "Keyboard Shortcuts"];

const CARDS = [
  {
    icon: KeyRound,
    title: "AI Provider Configuration",
    subtitle: "Groq · Gemini · OpenAI",
    points: [
      "Add provider API keys in Basic Settings → AI Configuration.",
      "Groq: fastest free tier for script drafting; set a base URL only if self-hosting a proxy.",
      "Gemini: paste the key from Google AI Studio, then pick a model from the model selector.",
      "OpenAI: supports a custom base URL for Azure or compatible gateways.",
      "Keys are stored as local configuration — nothing is sent anywhere until the backend is connected.",
    ],
  },
  {
    icon: Mic2,
    title: "Voice & Audio Studio",
    subtitle: "Edge-TTS · ElevenLabs · BGM",
    points: [
      "Edge-TTS needs no key and is the recommended default for local runs.",
      "ElevenLabs requires an API key; premium voices are marked in the voice library.",
      "Filter voices by language, gender and accent, then preview before selecting.",
      "Background music: keep BGM volume roughly 15–25% of narration for clear speech.",
      "Custom voiceovers can replace generated speech entirely via Custom Audio.",
    ],
  },
  {
    icon: Subtitles,
    title: "Captions & Subtitle Styling",
    subtitle: "Styles · Karaoke · Fonts",
    points: [
      "Manual Style controls font, size, stroke, background and position.",
      "Templates gives ready-made caption looks; apply then fine-tune.",
      "Karaoke and highlight modes sync per word, line or sentence.",
      "Custom fonts must be installed locally for the render engine to embed them.",
      "Animations control in/out and loop behaviour for caption blocks.",
    ],
  },
  {
    icon: Rocket,
    title: "Render Pipeline & Hardware Acceleration",
    subtitle: "Stages · NVENC · Encoders",
    points: [
      "The pipeline runs script → keywords → media → speech → subtitles → mix → encode.",
      "NVENC (NVIDIA) gives the fastest encode; select it under Render Settings → GPU.",
      "Fall back to CPU (libx264) when no compatible GPU is detected.",
      "Bitrate, resolution and FPS defaults live in Render Settings.",
      "FFmpeg must be installed and reachable on PATH for any render to complete.",
    ],
  },
];

const SHORTCUTS = [
  { keys: "Cmd / Ctrl + K", label: "Open the Command Palette" },
  { keys: "Esc", label: "Close palette, modal or panel" },
  { keys: "↑ / ↓", label: "Move between palette results" },
  { keys: "Enter", label: "Open the highlighted result / submit the focused form" },
  { keys: "Space", label: "Play or pause the focused preview player" },
];

const FAQ = [
  {
    q: "FFmpeg is missing or not detected",
    a: "VideoForge relies on a local FFmpeg build for encoding. Install FFmpeg and make sure the binary is on your system PATH, then restart the app. On Windows, confirm ffmpeg.exe resolves from a new terminal; on macOS/Linux, `which ffmpeg` should return a path.",
  },
  {
    q: "Network or API timeout while generating",
    a: "Long generations can exceed a strict proxy timeout. Verify the provider key in Basic Settings, check whether an HTTP/SOCKS5 proxy is configured under Account → Security, and retry. Rate-limited free tiers will also surface as timeouts.",
  },
  {
    q: "Local directory permission errors",
    a: "Output, project and cache folders are configured in Render Settings → Storage. The chosen paths must exist and be writable by the account running the app. Avoid system-protected locations such as Program Files or /usr.",
  },
  {
    q: "Backend unavailable",
    a: "The rendering backend is a separate local service. Until it is running and its URL is configured, pages that depend on live data show idle or unavailable states instead of numbers. No data is fabricated while the backend is offline.",
  },
  {
    q: "Rendering fails or produces a black video",
    a: "Most render failures come from a missing encoder, an unreadable source clip, or a font the system cannot resolve. Switch the encoder to CPU to rule out GPU driver issues, confirm every asset in the timeline opens locally, and re-run with a system font selected.",
  },
];

function HelpPage() {
  const [q, setQ] = useState("");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const cards = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CARDS;
    return CARDS.filter(c =>
      c.title.toLowerCase().includes(s) ||
      c.subtitle.toLowerCase().includes(s) ||
      c.points.some(p => p.toLowerCase().includes(s)),
    );
  }, [q]);

  const faq = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FAQ;
    return FAQ.filter(f => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s));
  }, [q]);

  return (
    <AppShell>
      <PageHeader
        crumb={["General", "Help"]}
        title="Help & Documentation"
        subtitle="Setup guides, configuration reference and troubleshooting for VideoForge AI."
        actions={<GhostButton onClick={() => setShortcutsOpen(true)}><Keyboard className="w-4 h-4" /> Keyboard Shortcuts</GhostButton>}
      />

      <div className="rounded-3xl bg-card border border-border shadow-card p-6 mb-5">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search guides, setup steps and troubleshooting…"
            className="!pl-10"
            aria-label="Search documentation"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {CHIPS.map(c => (
            <button
              key={c}
              onClick={() => (c === "Keyboard Shortcuts" ? setShortcutsOpen(true) : setQ(c.split(" ")[0]))}
              className="px-3 h-9 rounded-xl text-[12px] font-semibold bg-secondary text-muted-foreground hover:text-foreground transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title="Quick Start" subtitle="Configuration guidance — informational only." right={<Pill tone="default">Docs</Pill>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map(c => (
            <div key={c.title} className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-brand">
                  <c.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-[14px] truncate">{c.title}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{c.subtitle}</div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {c.points.map(p => (
                  <li key={p} className="text-[12.5px] text-muted-foreground flex gap-2">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {cards.length === 0 && (
            <div className="text-[13px] text-muted-foreground py-6">No guides match “{q}”.</div>
          )}
        </div>
      </SectionCard>

      <div className="h-5" />

      <SectionCard title="Troubleshooting & FAQ" subtitle="Guidance for the most common setup issues.">
        {faq.length === 0 ? (
          <div className="text-[13px] text-muted-foreground py-6">No troubleshooting entries match “{q}”.</div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {faq.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-[13.5px] font-semibold text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[12.5px] text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </SectionCard>

      {shortcutsOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShortcutsOpen(false)} />
          <div className="relative w-full max-w-[520px] rounded-2xl bg-card border border-border shadow-card-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 h-14 border-b border-border">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-primary" />
                <span className="font-display font-bold text-[14px]">Keyboard Shortcuts</span>
              </div>
              <button onClick={() => setShortcutsOpen(false)} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-secondary grid place-items-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {SHORTCUTS.map(s => (
                <div key={s.keys} className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                  <span className="text-[12.5px] text-muted-foreground">{s.label}</span>
                  <span className="text-[11px] font-bold tracking-wider bg-secondary px-2 py-1 rounded-md shrink-0">{s.keys}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <PrimaryButton onClick={() => setShortcutsOpen(false)}>Got it</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
