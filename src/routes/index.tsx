import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAppState } from "@/store/app-state";
import { useApiHealth } from "@/hooks/useApiHealth";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { env } from "@/api/env";
import {
  Plus, Play, Pause, FolderOpen, ArrowUpRight, Cpu, HardDrive, Activity,
  Zap, Clock, CheckCircle2, Loader2, Wand2, TrendingUp, Film, Mic, FileText,
  Sparkles, Subtitles, Mic2, LayoutTemplate, Layers, Server, AlertCircle, ListVideo,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — VideoForge AI" },
      { name: "description", content: "AI video generation command center powered by MoneyPrinterTurbo." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useAppState();
  const { data: health, isLoading: healthLoading, isError: healthError } = useApiHealth(15_000);

  const isOnline = Boolean(health?.ok && !healthError);
  const activeCount = state.renderQueue.filter(
    (t) =>
      t.status === "rendering" ||
      t.status === "dispatching" ||
      t.status === "preparing" ||
      t.status === "encoding"
  ).length;
  const queuedCount = state.renderQueue.filter((t) => t.status === "queued").length;
  const totalOutputs = state.recentOutputs.length;
  const activeJob = state.renderQueue.find(
    (t) => t.status === "rendering" || t.status === "dispatching"
  );

  return (
    <AppShell>
      <Header
        isOnline={isOnline}
        latencyMs={health?.latencyMs}
        outputsCount={totalOutputs}
        activeCount={activeCount}
      />

      <ComponentErrorBoundary fallbackTitle="Dashboard Statistics Failed to Load">
        <StatsRow
          isOnline={isOnline}
          outputsCount={totalOutputs}
          activeCount={activeCount}
          queuedCount={queuedCount}
          latencyMs={health?.latencyMs}
        />
      </ComponentErrorBoundary>

      <div className="grid grid-cols-12 gap-5 mt-5">
        <div className="col-span-12 xl:col-span-8 space-y-5">
          <ComponentErrorBoundary fallbackTitle="Render Pipeline View Failed to Load">
            <RenderPipeline activeJob={activeJob} isOnline={isOnline} />
          </ComponentErrorBoundary>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComponentErrorBoundary fallbackTitle="System Health View Failed to Load">
              <SystemHealth isOnline={isOnline} health={health} />
            </ComponentErrorBoundary>

            <ComponentErrorBoundary fallbackTitle="Recent Activity View Failed to Load">
              <RecentActivity activeCount={activeCount} queuedCount={queuedCount} />
            </ComponentErrorBoundary>
          </div>

          <ComponentErrorBoundary fallbackTitle="Recent Outputs View Failed to Load">
            <RecentOutputs outputs={state.recentOutputs} />
          </ComponentErrorBoundary>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-5">
          <QuickActions />
          <RecentProjects projects={state.recentProjects} />
        </div>
      </div>
    </AppShell>
  );
}

function Header({
  isOnline,
  latencyMs,
  outputsCount,
  activeCount,
}: {
  isOnline: boolean;
  latencyMs?: number;
  outputsCount: number;
  activeCount: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between pt-7 pb-6 gap-4">
      <div>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2">
          <span>Studio</span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <h1 className="font-display font-extrabold text-[36px] sm:text-[40px] leading-none tracking-tight">
          VideoForge Command Center <span className="inline-block">⚡</span>
        </h1>
        <p className="text-[13.5px] text-muted-foreground mt-2">
          {isOnline
            ? `${outputsCount} video exports · ${activeCount} active render jobs · MPT Online (${latencyMs ?? 0}ms)`
            : "MoneyPrinterTurbo backend offline. Start backend on http://127.0.0.1:8080."}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <Link to="/assets">
          <button className="h-11 px-4 rounded-xl bg-card border border-border text-[13px] font-semibold hover:bg-secondary transition flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Manage Media
          </button>
        </Link>
        <Link to="/create">
          <button className="h-11 px-5 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold shadow-brand hover:opacity-95 transition flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={3} /> Create Video
          </button>
        </Link>
      </div>
    </div>
  );
}

function StatsRow({
  isOnline,
  outputsCount,
  activeCount,
  queuedCount,
  latencyMs,
}: {
  isOnline: boolean;
  outputsCount: number;
  activeCount: number;
  queuedCount: number;
  latencyMs?: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="relative rounded-3xl bg-brand-gradient-radial p-5 overflow-hidden shadow-brand">
        <div className="flex items-start justify-between mb-4">
          <div className="text-white/80 text-[12px] font-medium">Videos Generated</div>
          <Link to="/outputs">
            <button className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur grid place-items-center transition">
              <ArrowUpRight className="w-3 h-3 text-white" strokeWidth={2.5} />
            </button>
          </Link>
        </div>
        <div className="text-white font-display font-extrabold text-[44px] leading-none tracking-tight">
          {outputsCount}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-white/85 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur px-1.5 py-0.5 rounded-md">
            <Film className="w-3 h-3" /> Output Library
          </span>
          Ready to stream
        </div>
      </div>

      <Link to="/queue" className="block">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-card hover:border-primary/30 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[12px] font-medium">Active Renders</span>
            {activeCount > 0 ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Clock className="w-4 h-4" />}
          </div>
          <div className="font-display font-extrabold text-[38px] leading-none text-foreground tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            {activeCount > 0 ? "Rendering on MPT worker" : "No active jobs in flight"}
          </div>
        </div>
      </Link>

      <Link to="/queue" className="block">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-card hover:border-primary/30 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[12px] font-medium">Queued Jobs</span>
            <ListVideo className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="font-display font-extrabold text-[38px] leading-none text-foreground tabular-nums">
            {queuedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">Waiting for worker slot</div>
        </div>
      </Link>

      <Link to="/developer" className="block">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-card hover:border-primary/30 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[12px] font-medium">Backend Engine</span>
            <Server className={`w-4 h-4 ${isOnline ? "text-emerald-500" : "text-rose-500"}`} />
          </div>
          <div className={`font-display font-bold text-[22px] leading-tight ${isOnline ? "text-emerald-500" : "text-rose-500"}`}>
            {isOnline ? "MPT Online" : "Offline"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 font-mono">
            {isOnline ? `Ping: ${latencyMs ?? 0}ms · 200 OK` : "Connection failed"}
          </div>
        </div>
      </Link>
    </div>
  );
}

function RenderPipeline({ activeJob, isOnline }: { activeJob?: any; isOnline: boolean }) {
  if (activeJob) {
    return (
      <div className="rounded-3xl bg-card border border-primary/20 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-[17px]">Active Render Job</h3>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-brand-gradient text-white">
                <Loader2 className="w-3 h-3 animate-spin" />
                {activeJob.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              <span className="text-foreground font-semibold">{activeJob.projectName}</span>
              {activeJob.mptTaskId && <span className="font-mono text-[11px] ml-2 text-primary">{activeJob.mptTaskId}</span>}
            </p>
          </div>
          <Link to="/queue">
            <button className="px-3 h-8 rounded-lg text-[12px] font-semibold border border-border hover:bg-secondary transition">
              Open Queue
            </button>
          </Link>
        </div>

        <div className="rounded-2xl bg-secondary/40 border border-border/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-muted-foreground">Execution Progress</span>
            <span className="font-mono font-bold text-[13px] text-foreground">{activeJob.progress || 0}%</span>
          </div>
          <div className="h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient transition-all duration-300"
              style={{ width: `${activeJob.progress || 0}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-[17px] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Render Pipeline Ready</span>
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            {isOnline
              ? "MoneyPrinterTurbo engine is idle and ready to process video render tasks."
              : "MoneyPrinterTurbo server is offline. Please start main.py to enable video rendering."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/render">
            <button className="px-4 h-9 rounded-xl bg-brand-gradient text-white text-[12.5px] font-semibold shadow-brand transition flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" /> Start Render
            </button>
          </Link>
          <Link to="/queue">
            <button className="px-4 h-9 rounded-xl bg-secondary text-foreground text-[12.5px] font-semibold hover:bg-secondary/70 transition flex items-center gap-1.5">
              <ListVideo className="w-3.5 h-3.5" /> View Queue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SystemHealth({ isOnline, health }: { isOnline: boolean; health?: any }) {
  const subsystems = [
    { label: "Video Synthesis", endpoint: "POST /api/v1/videos", active: isOnline },
    { label: "Task Monitor", endpoint: "GET /api/v1/tasks", active: isOnline },
    { label: "Media Cache", endpoint: "GET /api/v1/video_materials", active: isOnline },
    { label: "Audio & BGM", endpoint: "POST /api/v1/audio", active: isOnline },
  ];

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-[16px]">Engine Subsystems</h3>
        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${isOnline ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"}`}>
          {isOnline ? "OPERATIONAL" : "OFFLINE"}
        </span>
      </div>
      <div className="space-y-3">
        {subsystems.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-[12px] p-2 rounded-xl bg-secondary/30">
            <div>
              <div className="font-semibold text-foreground">{s.label}</div>
              <div className="font-mono text-[10.5px] text-muted-foreground">{s.endpoint}</div>
            </div>
            <span className={`font-semibold text-[11px] ${s.active ? "text-emerald-500" : "text-rose-500"}`}>
              {s.active ? "Ready" : "Unavailable"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ activeCount, queuedCount }: { activeCount: number; queuedCount: number }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-bold text-[16px] mb-4">Queue Activity</h3>
      <div className="space-y-3 text-[12.5px]">
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60">
          <span className="text-muted-foreground">Active worker threads</span>
          <span className="font-mono font-bold text-foreground">{activeCount} / 1</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60">
          <span className="text-muted-foreground">Buffered in queue</span>
          <span className="font-mono font-bold text-foreground">{queuedCount} jobs</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60">
          <span className="text-muted-foreground">Dispatch mode</span>
          <span className="font-medium text-foreground">Orderly Serial (Windows safe)</span>
        </div>
      </div>
    </div>
  );
}

function RecentOutputs({ outputs }: { outputs: any[] }) {
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-[16px]">Recent Outputs</h3>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">Ready to preview, stream, or download.</p>
        </div>
        <Link to="/outputs" className="text-[12px] font-semibold text-primary hover:underline">
          View all exports →
        </Link>
      </div>

      {outputs.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-[12.5px]">
          No video outputs recorded yet. Render a video to see it appear here.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {outputs.slice(0, 4).map((o) => (
            <div
              key={o.id}
              onClick={() => o.filePath && setPlayingUrl(o.filePath)}
              className="group cursor-pointer rounded-2xl border border-border bg-secondary/20 p-3 hover:border-primary/40 transition"
            >
              <div className="relative aspect-video rounded-xl bg-black/60 flex items-center justify-center overflow-hidden mb-2">
                <Play className="w-5 h-5 text-white/80 group-hover:scale-110 group-hover:text-primary transition" fill="currentColor" />
                <span className="absolute bottom-1.5 right-1.5 text-[9.5px] font-mono text-white bg-black/50 px-1 py-0.5 rounded">
                  {o.durationSec || 15}s
                </span>
              </div>
              <div className="text-[12px] font-semibold text-foreground truncate">{o.name}</div>
              <div className="text-[10.5px] text-muted-foreground mt-0.5 font-mono">{o.resolution || "1080p"} · MP4</div>
            </div>
          ))}
        </div>
      )}

      {playingUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlayingUrl(null)}
        >
          <div className="bg-card border border-border rounded-3xl p-4 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <video src={playingUrl} controls autoPlay className="w-full rounded-2xl aspect-[9/16] bg-black max-h-[70vh] object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: Wand2, label: "Script Studio", sub: "LLM generation", to: "/create" },
    { icon: Subtitles, label: "Subtitle Studio", sub: "SRT & fonts", to: "/subtitle-studio" },
    { icon: Mic2, label: "Audio Studio", sub: "Edge TTS & BGM", to: "/audio-studio" },
    { icon: FolderOpen, label: "Assets Studio", sub: "Local materials", to: "/assets" },
  ];

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-bold text-[16px] mb-4">Quick Studios</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((q) => (
          <Link key={q.label} to={q.to} className="block">
            <div className="group text-left p-3.5 rounded-2xl border border-border hover:border-primary/30 hover:bg-accent/30 transition h-full">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient grid place-items-center mb-2.5 shadow-brand group-hover:scale-105 transition">
                <q.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
              </div>
              <div className="text-[12px] font-bold text-foreground">{q.label}</div>
              <div className="text-[10.5px] text-muted-foreground mt-0.5">{q.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecentProjects({ projects }: { projects: any[] }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-[16px]">Recent Projects</h3>
        <Link to="/projects" className="text-[11.5px] font-semibold text-primary hover:underline">
          View all →
        </Link>
      </div>
      {projects.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground text-[12px]">
          No saved projects. Click 'Create Video' to start.
        </div>
      ) : (
        <div className="space-y-2">
          {projects.slice(0, 3).map((p) => (
            <Link key={p.id} to="/render" className="block">
              <div className="p-2.5 rounded-xl border border-border/60 hover:bg-secondary/30 transition flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-foreground truncate">{p.name}</div>
                  <div className="text-[10.5px] text-muted-foreground font-mono mt-0.5">{p.aspectRatio || "9:16"}</div>
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">OPEN</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
