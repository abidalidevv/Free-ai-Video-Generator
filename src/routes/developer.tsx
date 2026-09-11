import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, GhostButton, Pill } from "@/components/app-shell";
import { Code2, Terminal, FileJson, Layers, AlertTriangle, Eye, EyeOff, Copy, Shield, ShieldAlert, Lock, Server } from "lucide-react";
import { env, featureFlags } from "@/api/env";
import { useState } from "react";

export const Route = createFileRoute("/developer")({
  head: () => ({ meta: [{ title: "Developer Mode — VideoForge AI" }] }),
  component: DevPage,
});

const tabs = [
  { k: "logs", l: "Raw Logs", icon: Terminal },
  { k: "json", l: "JSON", icon: FileJson },
  { k: "config", l: "Configuration", icon: Code2 },
  { k: "env", l: "Environment", icon: Layers },
  { k: "api", l: "API Responses", icon: FileJson },
  { k: "pipeline", l: "Pipeline", icon: Layers },
];

const RAW_LOG = `[14:08:24.812] INFO  exporter   muxing complete -> outputs/morning_habits_4k.mp4 (248.4MB)
[14:08:24.103] DEBUG ffmpeg     frame=14211 fps=58 q=23.0 size=  248064kB time=00:08:24.18 bitrate=4030.7kbits/s speed=1.94x
[14:05:11.901] INFO  subtitle   whisper-large-v3 loaded · device=cuda
[14:04:37.554] WARN  render     scene 6 source=720p target=1080p · upscaling lanczos
[14:02:18.220] INFO  tts        elevenlabs voice=adam chars=248 dur=92s cost=$0.184
[14:01:02.001] ERROR pexels     HTTP 429 Too Many Requests · backoff=30s · falling back to pixabay
[13:58:44.812] INFO  llm        openai gpt-4o usage=in:182 out:312 tokens cost=$0.0124
[13:58:21.011] INFO  project    created morning-habits-of-ceos.vfp`;

const JSON_PAYLOAD = `{
  "project_id": "vfp_2026_06_26_b1a4",
  "subject": "Morning habits of highly successful CEOs",
  "language": "en-US",
  "voice": { "provider": "elevenlabs", "id": "adam", "speed": 1.0 },
  "video": { "aspect": "9:16", "resolution": "1080p", "fps": 30 },
  "scenes": 9,
  "keywords": ["sunrise office","ceo meeting","luxury watch"],
  "rendering": { "encoder": "h264_nvenc", "preset": "balanced", "bitrate_mbps": 12 }
}`;

function DevPage() {
  const [tab, setTab] = useState("logs");
  const [unmasked, setUnmasked] = useState(false);
  return (
    <AppShell>
      <PageHeader
        crumb={["General", "Developer Mode"]}
        title="Developer Mode"
        subtitle="Advanced internals. Useful for debugging — handle with care."
        actions={<><Pill tone="warning"><AlertTriangle className="w-3 h-3" /> Power user</Pill></>}
      />

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 transition ${tab === t.k ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.l}
          </button>
        ))}
      </div>

      {tab === "logs" && (
        <CodeBlock title="Raw pipeline log" right={<><GhostButton className="!h-8 !text-[11px]"><Copy className="w-3 h-3" /> Copy</GhostButton><GhostButton className="!h-8 !text-[11px]">Download</GhostButton></>}>
          {RAW_LOG}
        </CodeBlock>
      )}
      {tab === "json" && <CodeBlock title="project.json">{JSON_PAYLOAD}</CodeBlock>}
      {tab === "config" && (
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[16px]">Server Configuration</h3>
              <p className="text-[12px] text-muted-foreground">MoneyPrinterTurbo backend configuration state</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-[12.5px] space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Pill tone="default">Security Protected</Pill>
              <span>Server config.toml is private</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              In compliance with architectural security standards, MoneyPrinterTurbo upstream does not expose a public REST configuration endpoint (<code className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded">GET /api/v1/config</code> does not exist).
              Backend credentials, LLM keys, and TTS provider tokens remain strictly isolated on the host server's local <code className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded">config.toml</code> file and are never sent over HTTP to the client browser.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Active Client Configuration</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[12px]">
              <div className="p-3 rounded-xl border border-border bg-card">
                <span className="text-muted-foreground block text-[11px] uppercase font-sans font-bold">API Base URL</span>
                <span className="text-primary font-semibold truncate block mt-0.5">{env.apiBaseUrl}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card">
                <span className="text-muted-foreground block text-[11px] uppercase font-sans font-bold">Environment</span>
                <span className="text-foreground font-semibold truncate block mt-0.5">{env.environment}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card">
                <span className="text-muted-foreground block text-[11px] uppercase font-sans font-bold">Request Timeout</span>
                <span className="text-foreground font-semibold truncate block mt-0.5">{env.requestTimeout} ms</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card">
                <span className="text-muted-foreground block text-[11px] uppercase font-sans font-bold">Max Retries</span>
                <span className="text-foreground font-semibold truncate block mt-0.5">{env.maxRetries}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === "env" && (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <div className="font-display font-bold text-[15px]">Client Environment</div>
              <div className="text-[11.5px] text-muted-foreground">Client process variables & feature flags</div>
            </div>
            <button onClick={() => setUnmasked(v => !v)} className="text-[12px] font-semibold text-primary flex items-center gap-1.5">
              {unmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {unmasked ? "Hide" : "Reveal"} values
            </button>
          </div>
          <div className="p-5 font-mono text-[12px] space-y-2">
            {[
              ["VITE_API_BASE_URL", env.apiBaseUrl],
              ["VITE_ENVIRONMENT", env.environment],
              ["VITE_REQUEST_TIMEOUT", `${env.requestTimeout}ms`],
              ["VITE_UPLOAD_LIMIT", `${env.uploadLimit / (1024 * 1024)}MB`],
              ["VITE_API_MAX_RETRIES", String(env.maxRetries)],
              ["VITE_API_KEY", env.apiKey ? (unmasked ? env.apiKey : "•••••••••••••") : "(Not required / empty)"],
              ["FEATURE: render", featureFlags.render ? "enabled" : "disabled"],
              ["FEATURE: captions", featureFlags.captions ? "enabled" : "disabled"],
              ["FEATURE: templates", featureFlags.templates ? "enabled" : "disabled"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap gap-4 items-center">
                <span className="text-primary font-semibold w-56 shrink-0">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border bg-secondary/20 text-[12px] text-muted-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Server backend secrets and LLM keys are held exclusively in server-side config.toml and never exposed to the client.</span>
          </div>
        </div>
      )}
      {tab === "api" && (
        <CodeBlock title="POST /api/generate · 200 OK · 312ms">{`{
  "ok": true,
  "task_id": "task_8a2c4f9e",
  "stage": "voice_synth",
  "progress": 0.42,
  "eta_seconds": 231
}`}</CodeBlock>
      )}
      {tab === "pipeline" && (
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
          <h3 className="font-display font-bold text-[15px] mb-4">Pipeline graph</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-3">
            {["Subject", "LLM Script", "Keywords", "Stock Search", "Download", "Voice", "Subtitle", "Composer", "Encoder", "Export"].map((s, i, a) => (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-2 rounded-xl bg-brand-gradient text-white text-[11.5px] font-bold shadow-brand">{s}</div>
                {i < a.length - 1 && <div className="w-5 h-px bg-border" />}
              </div>
            ))}
          </div>
          <div className="text-[11.5px] text-muted-foreground mt-3">All nodes operational · last health check 12s ago.</div>
        </div>
      )}
    </AppShell>
  );
}

function CodeBlock({ title, right, children }: any) {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="font-display font-bold text-[14px]">{title}</div>
        <div className="flex items-center gap-2">{right ?? <GhostButton className="!h-8 !text-[11px]"><Copy className="w-3 h-3" /> Copy</GhostButton>}</div>
      </div>
      <pre className="p-5 m-0 font-mono text-[12px] leading-relaxed text-foreground/80 bg-secondary/30 overflow-x-auto whitespace-pre-wrap">{children}</pre>
    </div>
  );
}
