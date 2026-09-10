// ============================================================================
// Render Studio — the production-grade replacement for "Generate Video".
// Reads from global app-state; ready for MoneyPrinterTurbo backend wiring.
// ============================================================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AppShell, PageHeader, PrimaryButton, GhostButton, Card, Pill,
} from "@/components/app-shell";
import { StatusBadge } from "@/components/shared";
import { RenderPipeline } from "@/components/render/pipeline";
import { VideoPlayer } from "@/components/render/video-player";
import { useAppState } from "@/store/app-state";
import {
  PIPELINE_STAGES, type PipelineStageId, type PipelineStageState,
  formatDuration, formatBytes, makeRenderTask,
} from "@/lib/render-pipeline";
import {
  Play, Pause, X, Bell, Volume2, FolderOpen, Copy, Sparkles, RefreshCcw,
  FileText, Mic, Subtitles as SubIcon, Film, Clock, HardDrive, Cpu, Monitor,
  CheckCircle2, ArrowRight, Image as ImageIcon, Wand2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/render")({
  head: () => ({ meta: [{ title: "Render Studio — VideoForge AI" }] }),
  component: RenderStudioPage,
});

// ── Demo pipeline state — backend will populate this via events ────────────
const DEMO_STATES: Partial<Record<PipelineStageId, PipelineStageState>> = {
  "preparing-project":   { status: "completed", progress: 100 },
  "validating-settings": { status: "completed", progress: 100 },
  "generating-script":   { status: "completed", progress: 100 },
  "generating-keywords": { status: "completed", progress: 100 },
  "generating-voice":    { status: "completed", progress: 100 },
  "generating-subtitle": { status: "completed", progress: 100 },
  "preparing-timeline":  { status: "completed", progress: 100 },
  "searching-stock":     { status: "completed", progress: 100 },
  "matching-scenes":     { status: "running", progress: 62, currentScene: "06 / 12", currentClip: "tokyo_night_03.mp4", currentFile: "ranker.py" },
  "downloading-assets":  { status: "waiting", progress: 0 },
  "preparing-render":    { status: "waiting", progress: 0 },
  "rendering":           { status: "waiting", progress: 0 },
  "encoding":            { status: "waiting", progress: 0 },
  "exporting":           { status: "waiting", progress: 0 },
  "completed":           { status: "waiting", progress: 0 },
};

function RenderStudioPage() {
  const { state, dispatch } = useAppState();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const project = state.currentProject?.name ?? "Untitled Project";
  const aspect = state.videoSettings.aspectRatio;
  const resolution = state.videoSettings.resolution;
  const encoder = state.videoSettings.encoder;
  const fps = state.videoSettings.fps;
  const transition = state.videoSettings.transition;
  const voiceName = state.selectedVoice?.name ?? "Narrator · ElevenLabs David v2";
  const template = state.selectedSubtitleTemplate?.name ?? "Clean Bold White";

  const startRender = () => {
    const t = makeRenderTask("p_new", project);
    dispatch({ type: "ENQUEUE_RENDER", payload: { ...t, status: "rendering", progress: 0, startedAt: new Date().toISOString() } });
    dispatch({ type: "PUSH_NOTIFICATION", payload: {
      id: `n_${Date.now()}`, level: "info", category: "render",
      title: "Render started", message: project, createdAt: new Date().toISOString(), isRead: false,
      actionLabel: "View queue", actionTo: "/queue",
    }});
    setRunning(true);
    setTimeout(() => { setRunning(false); setDone(true); }, 2400);
    toast.success("Render started", { description: project });
  };

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Render Studio"]}
        title="Render Studio"
        subtitle="Final production pass — every setting maps to the MoneyPrinterTurbo task pipeline."
        actions={
          <>
            <Link to="/queue"><GhostButton><Clock className="w-4 h-4" /> Queue ({state.renderQueue.length})</GhostButton></Link>
            {!running ? (
              <PrimaryButton onClick={startRender}><Play className="w-4 h-4" fill="currentColor" /> Start Render</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setRunning(false)}><Pause className="w-4 h-4" /> Pause</PrimaryButton>
            )}
          </>
        }
      />

      {done && <RenderCompleteBanner project={project} onDismiss={() => setDone(false)} />}

      <div className="grid grid-cols-12 gap-6">
        {/* Left rail — settings summary */}
        <div className="col-span-3 space-y-5">
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Project</div>
              <StatusBadge tone="brand" icon={Sparkles}>READY</StatusBadge>
            </div>
            <div className="text-[15px] font-extrabold tracking-tight">{project}</div>
            <div className="text-[11.5px] text-muted-foreground mt-1">{aspect} · {resolution} · {fps}fps</div>
          </Card>

          <SummaryCard title="Content">
            <SummaryRow icon={FileText} label="Script"   value={`${state.currentScript?.wordCount ?? 248} words · ${formatDuration(state.currentScript?.estDurationSec ?? 92)}`} />
            <SummaryRow icon={Mic}      label="Voice"    value={voiceName} />
            <SummaryRow icon={SubIcon}  label="Subtitle" value={template} />
            <SummaryRow icon={Film}     label="Transition" value={transition} />
            <SummaryRow icon={ImageIcon} label="Overlay"  value="None" />
          </SummaryCard>

          <SummaryCard title="Output">
            <SummaryRow icon={Monitor}   label="Resolution"   value={`${resolution.toUpperCase()} · ${aspect}`} />
            <SummaryRow icon={Cpu}       label="Encoder"      value={encoder} />
            <SummaryRow icon={Clock}     label="Est. duration" value={formatDuration(92)} />
            <SummaryRow icon={Wand2}     label="Est. render"  value="~ 4m 30s" />
            <SummaryRow icon={HardDrive} label="Est. size"    value={formatBytes(248_000_000)} />
            <SummaryRow icon={FolderOpen} label="Destination" value="~/Movies/VideoForge" />
          </SummaryCard>
        </div>

        {/* Center — pipeline */}
        <div className="col-span-6">
          <RenderPipeline states={DEMO_STATES} />
        </div>

        {/* Right rail — player + actions */}
        <div className="col-span-3 space-y-5">
          <VideoPlayer aspect={aspect} title={project} />
          <Card padding="p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction icon={Bell}      label="Notify" />
              <QuickAction icon={Volume2}   label="Sound" />
              <QuickAction icon={Copy}      label="Copy Path" />
              <QuickAction icon={FolderOpen} label="Open Folder" />
              <QuickAction icon={RefreshCcw} label="Restart" />
              <QuickAction icon={X}         label="Cancel" danger />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ title, children }: any) {
  return (
    <Card padding="p-5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{title}</div>
      <div className="space-y-2.5">{children}</div>
    </Card>
  );
}
function SummaryRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-secondary grid place-items-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[12.5px] font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}
function QuickAction({ icon: Icon, label, danger }: any) {
  return (
    <button className={`h-12 rounded-xl border border-border bg-card text-[11.5px] font-semibold flex flex-col items-center justify-center gap-0.5 transition hover:bg-secondary ${danger ? "text-destructive hover:bg-destructive/5" : "text-foreground"}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function RenderCompleteBanner({ project, onDismiss }: { project: string; onDismiss: () => void }) {
  return (
    <div className="mb-6 rounded-3xl bg-brand-gradient text-white p-6 shadow-brand flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] uppercase tracking-wider font-bold opacity-80">Render Complete</div>
        <div className="text-[20px] font-display font-extrabold tracking-tight">{project}</div>
        <div className="text-[12px] opacity-80 mt-1 flex items-center gap-4 flex-wrap">
          <span>Elapsed 4m 22s</span>
          <span>Avg 62 fps</span>
          <span>248 MB</span>
          <span>1080p · 9:16</span>
          <span className="font-mono">~/Movies/VideoForge/output.mp4</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/outputs"><button className="h-10 px-4 rounded-xl bg-white text-[#164E32] text-[12.5px] font-bold flex items-center gap-2"><Play className="w-3.5 h-3.5" fill="currentColor" /> Play</button></Link>
        <button className="h-10 px-4 rounded-xl bg-white/15 backdrop-blur text-white text-[12.5px] font-bold flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Open Folder</button>
        <button className="h-10 px-4 rounded-xl bg-white/15 backdrop-blur text-white text-[12.5px] font-bold flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5" /> New</button>
        <button onClick={onDismiss} className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}
