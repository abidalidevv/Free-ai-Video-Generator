// ============================================================================
// Global Command Palette — Ctrl/⌘ + K
// Pure UI; jumps across Projects, Outputs, Voices, Templates, Settings,
// Effects, API Providers and Subtitle Templates using router links.
// ============================================================================

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Search, ArrowRight, CornerDownLeft, Command as CmdIcon,
  LayoutDashboard, Video, Clapperboard, Mic2, FolderKanban, Subtitles,
  Sparkles, Library, LayoutTemplate, AudioLines, Music2, Rocket, ListVideo,
  FileVideo, KeyRound, Settings as SettingsIcon, Languages, ScrollText,
  Code2, Info, Bell, CreditCard, Shield, UserCircle, HelpCircle,
  type LucideIcon,
} from "lucide-react";

type Entry = {
  id: string;
  title: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  to: string;
  search?: Record<string, string>;
  keywords?: string;
};

const ENTRIES: Entry[] = [
  // Studio
  { id: "n-dash", group: "Navigate", title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { id: "n-create", group: "Navigate", title: "Create Video", hint: "Script Studio", icon: Video, to: "/create", keywords: "script ai prompt" },
  { id: "n-video", group: "Navigate", title: "Video Settings", icon: Clapperboard, to: "/video-settings", keywords: "transition encoder aspect" },
  { id: "n-audio", group: "Navigate", title: "Audio Studio", icon: Mic2, to: "/audio-studio", keywords: "tts voice bgm music" },
  { id: "n-sub", group: "Navigate", title: "Subtitle Studio", icon: Subtitles, to: "/subtitle-studio", keywords: "captions karaoke font" },
  { id: "n-render", group: "Navigate", title: "Render Studio", hint: "Pro", icon: Rocket, to: "/render" },
  { id: "n-queue", group: "Navigate", title: "Render Queue", icon: ListVideo, to: "/queue" },
  { id: "n-out", group: "Navigate", title: "Outputs", icon: FileVideo, to: "/outputs", keywords: "library exports" },
  { id: "n-proj", group: "Navigate", title: "Projects", icon: FolderKanban, to: "/projects" },

  // Libraries
  { id: "l-eff", group: "Libraries", title: "Video Effects", icon: Sparkles, to: "/subtitle-studio", search: { tab: "animations" }, keywords: "effects animations" },
  { id: "l-ass", group: "Libraries", title: "Assets Library", icon: Library, to: "/assets" },
  { id: "l-tpl", group: "Libraries", title: "Templates", icon: LayoutTemplate, to: "/subtitle-studio", search: { tab: "templates" }, keywords: "caption templates" },
  { id: "l-voi", group: "Libraries", title: "Voices", icon: AudioLines, to: "/audio-studio", search: { tab: "voices" }, keywords: "voice library tts" },
  { id: "l-mus", group: "Libraries", title: "Music", icon: Music2, to: "/audio-studio", search: { tab: "music" }, keywords: "bgm background music" },

  // System
  { id: "s-basic", group: "System", title: "Basic Settings", hint: "LLM & Providers", icon: SettingsIcon, to: "/basic-settings", keywords: "llm provider model openai groq api keys elevenlabs pexels" },
  
  { id: "s-lang", group: "System", title: "Languages", icon: Languages, to: "/languages" },
  { id: "s-log", group: "System", title: "Logs", icon: ScrollText, to: "/logs" },
  { id: "s-dev", group: "System", title: "Developer Mode", icon: Code2, to: "/developer" },
  { id: "s-about", group: "System", title: "About", icon: Info, to: "/about" },
  { id: "s-notif", group: "System", title: "Notifications", icon: Bell, to: "/notifications" },

  // Account
  { id: "a-acc", group: "Account", title: "Account", icon: UserCircle, to: "/account" },
  { id: "a-pro", group: "Account", title: "Profile", icon: UserCircle, to: "/account", search: { tab: "profile" } },
  { id: "a-bil", group: "Account", title: "Billing", icon: CreditCard, to: "/account", search: { tab: "billing" } },
  { id: "a-sec", group: "Account", title: "Security", icon: Shield, to: "/account", search: { tab: "security" } },
  { id: "a-help", group: "Account", title: "Help & Support", icon: HelpCircle, to: "/help" },

  // Providers (deep-links into Basic Settings)
  { id: "p-openai", group: "Providers", title: "OpenAI", hint: "LLM provider", icon: KeyRound, to: "/basic-settings", keywords: "gpt-4 gpt-4o llm" },
  { id: "p-anthropic", group: "Providers", title: "Anthropic Claude", hint: "LLM provider", icon: KeyRound, to: "/basic-settings", keywords: "claude sonnet" },
  { id: "p-gemini", group: "Providers", title: "Google Gemini", hint: "LLM provider", icon: KeyRound, to: "/basic-settings" },
  { id: "p-groq", group: "Providers", title: "Groq", hint: "LLM provider", icon: KeyRound, to: "/basic-settings" },
  { id: "p-eleven", group: "Providers", title: "ElevenLabs", hint: "Voice provider", icon: KeyRound, to: "/basic-settings", keywords: "tts voice" },
  { id: "p-pexels", group: "Providers", title: "Pexels", hint: "Video source", icon: KeyRound, to: "/basic-settings", keywords: "stock footage" },
  { id: "p-pixabay", group: "Providers", title: "Pixabay", hint: "Video source", icon: KeyRound, to: "/basic-settings" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ENTRIES;
    return ENTRIES.filter(e =>
      e.title.toLowerCase().includes(s) ||
      e.group.toLowerCase().includes(s) ||
      (e.hint?.toLowerCase().includes(s) ?? false) ||
      (e.keywords?.toLowerCase().includes(s) ?? false),
    );
  }, [q]);

  const grouped = useMemo(() => {
    const g: Record<string, Entry[]> = {};
    filtered.forEach(e => { (g[e.group] ||= []).push(e); });
    return g;
  }, [filtered]);

  useEffect(() => { setActive(0); }, [q, open]);
  useEffect(() => { if (!open) setQ(""); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[active];
        if (item) { navigate({ to: item.to, search: item.search ?? {} } as never); onClose(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, navigate, onClose]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] rounded-2xl bg-card border border-border shadow-card-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects, voices, templates, settings…"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground"
            aria-label="Search command palette"
          />
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-md">ESC</span>
        </div>

        <div className="max-h-[420px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary grid place-items-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-[13px] font-semibold text-foreground">No matches</div>
              <div className="text-[11.5px] mt-1">Try a different keyword.</div>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-1">
                <div className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{group}</div>
                {items.map(item => {
                  runningIndex += 1;
                  const isActive = runningIndex === active;
                  const idx = runningIndex;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => { navigate({ to: item.to, search: item.search ?? {} } as never); onClose(); }}
                      className={`w-full flex items-center gap-3 px-4 h-10 text-left transition ${isActive ? "bg-accent" : "hover:bg-secondary/60"}`}
                    >
                      <div className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${isActive ? "bg-brand-gradient text-white shadow-brand" : "bg-secondary text-muted-foreground"}`}>
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-[13px] font-semibold truncate">{item.title}</span>
                        {item.hint && <span className="text-[10.5px] text-muted-foreground truncate">· {item.hint}</span>}
                      </div>
                      {isActive && <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                      {!isActive && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-4 h-10 border-t border-border bg-secondary/30 flex items-center gap-4 text-[10.5px] text-muted-foreground">
          <Hint k="↑↓">Navigate</Hint>
          <Hint k="↵">Open</Hint>
          <Hint k="ESC">Close</Hint>
          <div className="flex-1" />
          <span className="inline-flex items-center gap-1 font-semibold">
            <CmdIcon className="w-3 h-3" /> K to open anywhere
          </span>
        </div>
      </div>
    </div>
  );
}

function Hint({ k, children }: { k: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-bold text-foreground">{k}</kbd>
      <span>{children}</span>
    </span>
  );
}

// ── Hook: register global Ctrl/⌘+K listener ────────────────────────────────
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
