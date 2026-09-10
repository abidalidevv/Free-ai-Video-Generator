import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, GhostButton, Pill } from "@/components/app-shell";
import { Code2, Terminal, FileJson, Layers, AlertTriangle, Eye, EyeOff, Copy } from "lucide-react";
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
      {tab === "config" && <CodeBlock title="config.toml">{`[backend]\nurl = "http://127.0.0.1:8501"\ntimeout_seconds = 120\n\n[paths]\nffmpeg = "/usr/local/bin/ffmpeg"\nwhisper_models = "./models/whisper"\n\n[rendering]\nencoder = "h264_nvenc"\nbitrate_mbps = 12`}</CodeBlock>}
      {tab === "env" && (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div><div className="font-display font-bold text-[15px]">Environment</div><div className="text-[11.5px] text-muted-foreground">Process variables</div></div>
            <button onClick={() => setUnmasked(v => !v)} className="text-[12px] font-semibold text-primary flex items-center gap-1.5">{unmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {unmasked ? "Hide" : "Reveal"} secrets</button>
          </div>
          <div className="p-5 font-mono text-[12px] space-y-1.5">
            {[
              ["NODE_ENV", "production"],
              ["BACKEND_URL", "http://127.0.0.1:8501"],
              ["OPENAI_API_KEY", unmasked ? "sk-proj-aHb2k…9LfM" : "•••••••••••••"],
              ["ELEVENLABS_API_KEY", unmasked ? "sk_8jL…aZ2p" : "•••••••••••••"],
              ["PEXELS_API_KEY", unmasked ? "2k4pAvE…fT" : "•••••••••••"],
              ["CUDA_VISIBLE_DEVICES", "0"],
              ["LOG_LEVEL", "info"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4"><span className="text-primary font-semibold w-56 shrink-0">{k}</span><span className="text-muted-foreground">{v}</span></div>
            ))}
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
