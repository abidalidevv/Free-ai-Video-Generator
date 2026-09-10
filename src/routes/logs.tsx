import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, GhostButton, Pill } from "@/components/app-shell";
import { CheckCircle2, AlertTriangle, XCircle, Info, Filter, Download, Code2, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "Logs — VideoForge AI" }] }),
  component: LogsPage,
});

type LogEntry = { ts: string; type: "ok" | "warn" | "err" | "info"; title: string; sub: string; raw?: string };

const events: LogEntry[] = [
  { ts: "14:08:24", type: "ok", title: "Render completed", sub: "Morning Habits of CEOs · 4K · 8m 24s", raw: "[exporter] muxing complete -> ./outputs/morning_habits_4k.mp4 (248.4MB)" },
  { ts: "14:05:11", type: "info", title: "Subtitle pass started", sub: "Whisper-large-v3 · 9 segments" },
  { ts: "14:04:37", type: "warn", title: "Clip resolution mismatch", sub: "Scene 6 clip is 720p — upscaling to 1080p", raw: "[render.ffmpeg] -vf scale=1920:1080:flags=lanczos" },
  { ts: "14:02:18", type: "ok", title: "Voice synthesis finished", sub: "ElevenLabs · 248 chars · 1m 32s audio" },
  { ts: "14:01:02", type: "err", title: "Pexels rate-limit hit", sub: "Retrying in 30s — fell back to Pixabay", raw: "HTTP 429 Too Many Requests · backoff=30s" },
  { ts: "13:58:44", type: "ok", title: "Script generated", sub: "GPT-4o · 248 words · 0.012$" },
  { ts: "13:58:21", type: "info", title: "Project created", sub: "morning-habits-of-ceos.vfp" },
];

const tabs = ["Timeline", "Progress", "Warnings", "Completed", "Errors", "Developer"] as const;

function LogsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("Timeline");
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <AppShell>
      <PageHeader
        crumb={["General", "Logs"]}
        title="Activity Logs"
        subtitle="Human-friendly events first. Raw developer logs are one click away."
        actions={<><GhostButton><Filter className="w-4 h-4" /> Filter</GhostButton><GhostButton><Download className="w-4 h-4" /> Export</GhostButton></>}
      />

      <div className="grid grid-cols-5 gap-4 mb-5">
        {[
          { l: "All events today", v: "284", icon: Info, tone: "default" },
          { l: "Completed", v: "162", icon: CheckCircle2, tone: "success" },
          { l: "Warnings", v: "14", icon: AlertTriangle, tone: "warning" },
          { l: "Errors", v: "2", icon: XCircle, tone: "danger" },
          { l: "Avg task time", v: "1m 24s", icon: Clock, tone: "primary" },
        ].map((s: any) => (
          <div key={s.l} className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <s.icon className={`w-4 h-4 mb-2 ${s.tone === "success" ? "text-success" : s.tone === "warning" ? "text-amber-600" : s.tone === "danger" ? "text-destructive" : "text-primary"}`} />
            <div className="text-[11.5px] text-muted-foreground">{s.l}</div>
            <div className="font-display font-extrabold text-[24px] mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition ${tab === t ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
        ))}
      </div>

      <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
        {events.map((e, i) => (
          <button key={i} onClick={() => setOpenId(openId === i ? null : i)} className="w-full text-left grid grid-cols-12 px-5 py-4 items-start gap-3 border-b border-border/50 hover:bg-secondary/30 transition">
            <div className="col-span-1 text-[11.5px] font-mono text-muted-foreground tabular-nums pt-0.5">{e.ts}</div>
            <div className="col-span-1">
              {e.type === "ok" && <div className="w-7 h-7 rounded-lg bg-success/10 grid place-items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success" /></div>}
              {e.type === "warn" && <div className="w-7 h-7 rounded-lg bg-warning/15 grid place-items-center"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /></div>}
              {e.type === "err" && <div className="w-7 h-7 rounded-lg bg-destructive/10 grid place-items-center"><XCircle className="w-3.5 h-3.5 text-destructive" /></div>}
              {e.type === "info" && <div className="w-7 h-7 rounded-lg bg-accent grid place-items-center"><Info className="w-3.5 h-3.5 text-primary" /></div>}
            </div>
            <div className="col-span-8">
              <div className="text-[13px] font-semibold">{e.title}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">{e.sub}</div>
              {openId === i && e.raw && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border font-mono text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2 text-[10px] text-foreground/60 mb-1.5 font-sans"><Code2 className="w-3 h-3" /> RAW LOG</div>
                  {e.raw}
                </div>
              )}
            </div>
            <div className="col-span-2 flex justify-end items-center gap-2">
              <Pill tone={e.type === "ok" ? "success" : e.type === "warn" ? "warning" : e.type === "err" ? "danger" : "primary"}>{e.type.toUpperCase()}</Pill>
              {e.raw && <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition ${openId === i ? "rotate-180" : ""}`} />}
            </div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
