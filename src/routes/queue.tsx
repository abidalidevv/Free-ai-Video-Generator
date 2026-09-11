// ============================================================================
// Render Queue Manager — Connected to MPT background task dispatcher & orchestrator
// ============================================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AppShell, PageHeader, PrimaryButton, GhostButton, Pill, Input,
} from "@/components/app-shell";
import { EmptyState } from "@/components/shared";
import { useAppState } from "@/store/app-state";
import { useQueueOrchestrator } from "@/hooks/useQueueOrchestrator";
import { renderService } from "@/services/render.service";
import { downloadVideoFile } from "@/utils/download";
import type { RenderTask, RenderStatus } from "@/types";
import {
  Play, Pause, X, RotateCcw, Copy, Trash2,
  Search, ListVideo, Plus, Filter, Clock,
  Film, CheckCircle2, AlertCircle, Layers, Download, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/queue")({
  head: () => ({ meta: [{ title: "Render Queue & Batch Manager — VideoForge AI" }] }),
  component: QueuePage,
});

const TABS: { id: "all" | RenderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rendering", label: "Active" },
  { id: "queued", label: "Queued" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

function QueuePage() {
  const { state, dispatch } = useAppState();
  const { isQueueRunning, toggleQueueRunning, maxConcurrency } = useQueueOrchestrator();
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const tasks = useMemo(() => {
    return state.renderQueue.filter((t) => {
      const matchesTab =
        tab === "all"
          ? true
          : tab === "rendering"
            ? t.status === "rendering" || t.status === "dispatching" || t.status === "preparing" || t.status === "encoding"
            : t.status === tab;
      const matchesQuery =
        !query ||
        t.projectName.toLowerCase().includes(query.toLowerCase()) ||
        (t.mptTaskId && t.mptTaskId.toLowerCase().includes(query.toLowerCase()));
      return matchesTab && matchesQuery;
    });
  }, [state.renderQueue, tab, query]);

  const totals = {
    active: state.renderQueue.filter(
      (t) =>
        t.status === "rendering" ||
        t.status === "dispatching" ||
        t.status === "preparing" ||
        t.status === "encoding"
    ).length,
    queued: state.renderQueue.filter((t) => t.status === "queued").length,
    completed: state.renderQueue.filter((t) => t.status === "completed").length,
    failed: state.renderQueue.filter((t) => t.status === "failed").length,
  };

  // Real aggregate progress across all jobs in queue
  const totalJobs = state.renderQueue.length;
  const aggregateProgress =
    totalJobs > 0
      ? Math.round(
          state.renderQueue.reduce((acc, t) => acc + (t.progress || 0), 0) / totalJobs
        )
      : 0;

  // Enqueue a sample batch of 2 test render jobs
  const handleEnqueueSampleBatch = () => {
    const job1: RenderTask = {
      id: `qjob_${Date.now()}_alpha`,
      projectId: "proj_sample_alpha",
      projectName: "Batch Video Alpha (Quantum Computing)",
      status: "queued",
      progress: 0,
      aspectRatio: "9:16",
      taskRequest: {
        videoSubject: "Quantum Computing Basics",
        videoScript: "Quantum computing harnesses the strange principles of quantum mechanics to solve complex calculations at unprecedented speed.",
        videoTerms: ["Quantum Computing", "Superposition", "Technology"],
        videoAspect: "9:16",
        videoClipDurationSec: 5,
        videoSource: "pexels",
        voiceName: "en-US-GuyNeural-Male",
        voiceVolume: 1.0,
        voiceRate: 1.0,
        bgmType: "random",
        bgmVolume: 0.2,
        fontName: "STHeitiMedium.ttc",
        fontSize: 60,
        textForeColor: "#FFFFFF",
        strokeColor: "#000000",
        strokeWidth: 1.5,
        subtitleEnabled: true,
      },
    };

    const job2: RenderTask = {
      id: `qjob_${Date.now()}_beta`,
      projectId: "proj_sample_beta",
      projectName: "Batch Video Beta (Artificial Intelligence)",
      status: "queued",
      progress: 0,
      aspectRatio: "9:16",
      taskRequest: {
        videoSubject: "Future of Artificial Intelligence",
        videoScript: "Artificial intelligence is transforming every industry across the globe, driving breakthrough innovations in science and medicine.",
        videoTerms: ["Artificial Intelligence", "Neural Network", "Future"],
        videoAspect: "9:16",
        videoClipDurationSec: 5,
        videoSource: "pexels",
        voiceName: "en-US-GuyNeural-Male",
        voiceVolume: 1.0,
        voiceRate: 1.0,
        bgmType: "random",
        bgmVolume: 0.2,
        fontName: "STHeitiMedium.ttc",
        fontSize: 60,
        textForeColor: "#FFFFFF",
        strokeColor: "#000000",
        strokeWidth: 1.5,
        subtitleEnabled: true,
      },
    };

    dispatch({ type: "ENQUEUE_RENDER", payload: job1 });
    dispatch({ type: "ENQUEUE_RENDER", payload: job2 });
    toast.success("Enqueued 2 sample batch render jobs to MPT queue");
  };

  const handleRetry = (job: RenderTask) => {
    dispatch({
      type: "UPDATE_RENDER",
      payload: {
        id: job.id,
        patch: {
          status: "queued",
          progress: 0,
          errorMessage: undefined,
          mptTaskId: undefined,
        },
      },
    });
    toast.info(`Retrying ${job.projectName}`);
  };

  const handleRemove = async (job: RenderTask) => {
    if (job.status === "rendering" || job.status === "dispatching") {
      toast.warning("Task is currently busy on MPT. MPT backend does not support cancelling in-progress tasks.");
      return;
    }

    if (job.mptTaskId && (job.status === "completed" || job.status === "failed")) {
      try {
        await renderService.remove(job.mptTaskId);
      } catch (err: any) {
        console.warn("Backend task delete warning:", err.message);
      }
    }

    dispatch({ type: "REMOVE_RENDER", payload: job.id });
    toast.success(`Removed ${job.projectName}`);
  };

  const handleClearCompleted = () => {
    dispatch({ type: "CLEAR_COMPLETED_RENDERS" });
    toast.success("Cleared completed tasks from queue");
  };

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Render Queue"]}
        title="Render Queue & Batch Manager"
        subtitle="Multi-task dispatching and real-time execution monitoring with MoneyPrinterTurbo."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GhostButton onClick={toggleQueueRunning}>
              {isQueueRunning ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
              {isQueueRunning ? "Pause Queue" : "Resume Queue"}
            </GhostButton>
            <GhostButton onClick={handleEnqueueSampleBatch}>
              <Plus className="w-4 h-4 text-primary" /> Enqueue Sample Batch
            </GhostButton>
            {totals.completed > 0 && (
              <GhostButton onClick={handleClearCompleted}>
                <Trash2 className="w-4 h-4" /> Clear Completed
              </GhostButton>
            )}
            <Link to="/outputs">
              <GhostButton><ListVideo className="w-4 h-4" /> Outputs</GhostButton>
            </Link>
            <Link to="/render">
              <PrimaryButton><Plus className="w-4 h-4" /> New Render</PrimaryButton>
            </Link>
          </div>
        }
      />

      {/* 1. Batch Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label="Active" value={totals.active} tone="primary" sub={`Concurrency limit: ${maxConcurrency}`} />
        <Stat label="Queued" value={totals.queued} tone="neutral" sub="Waiting for worker" />
        <Stat label="Completed" value={totals.completed} tone="success" sub="Ready to stream" />
        <Stat label="Failed" value={totals.failed} tone="danger" sub="Errors or aborted" />
      </div>

      {/* 2. Aggregate Batch Progress Bar Card */}
      {totalJobs > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 mb-5 shadow-card">
          <div className="flex items-center justify-between text-[12.5px] mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Aggregate Batch Progress</span>
              <Pill tone={isQueueRunning ? "success" : "warning"}>
                {isQueueRunning ? "Queue Active" : "Queue Paused"}
              </Pill>
            </div>
            <div className="font-mono text-muted-foreground">
              {totals.completed} of {totalJobs} jobs finished ({aggregateProgress}%)
            </div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${aggregateProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 3. Search and Tabs */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search render tasks by name or MPT task ID…"
            className="!pl-10"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition whitespace-nowrap ${
              tab === t.id
                ? "bg-brand-gradient text-white shadow-brand"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Tasks Table / Empty State */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="No render tasks in queue"
          description="Enqueue a render job from Render Studio or click 'Enqueue Sample Batch' above to begin batch rendering."
          action={
            <div className="flex gap-2">
              <PrimaryButton onClick={handleEnqueueSampleBatch}>
                <Plus className="w-4 h-4" /> Enqueue Sample Batch
              </PrimaryButton>
              <Link to="/render">
                <GhostButton><Film className="w-4 h-4" /> Open Render Studio</GhostButton>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-[50px_1fr_130px_180px_120px_180px] gap-3 px-5 py-3 border-b border-border bg-secondary/30 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>#</span>
            <span>Project & Task</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Elapsed</span>
            <span className="text-right">Actions</span>
          </div>
          {tasks.map((t, i) => (
            <QueueRow
              key={t.id}
              task={t}
              index={i + 1}
              onRetry={handleRetry}
              onRemove={handleRemove}
              onPlay={(url) => {
                setPreviewVideoUrl(url);
                setPreviewTitle(t.projectName);
              }}
            />
          ))}
        </div>
      )}

      {/* 5. Video Preview Modal */}
      {previewVideoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewVideoUrl(null)}
        >
          <div
            className="relative bg-card border border-border rounded-3xl max-w-2xl w-full p-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div className="font-bold text-[14px] text-foreground truncate max-w-md">
                {previewTitle || "Render Output Preview"}
              </div>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/70 grid place-items-center text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="w-full rounded-2xl max-h-[70vh] bg-black aspect-[9/16] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}

function QueueRow({
  task,
  index,
  onRetry,
  onRemove,
  onPlay,
}: {
  task: RenderTask;
  index: number;
  onRetry: (task: RenderTask) => void;
  onRemove: (task: RenderTask) => void;
  onPlay: (url: string) => void;
}) {
  const isRunning =
    task.status === "rendering" ||
    task.status === "dispatching" ||
    task.status === "preparing" ||
    task.status === "encoding";

  return (
    <div className="grid grid-cols-[50px_1fr_130px_180px_120px_180px] gap-3 px-5 py-4 items-center border-b border-border/50 last:border-0 hover:bg-secondary/20 transition">
      <div className="text-[11px] font-mono text-muted-foreground">
        #{index.toString().padStart(2, "0")}
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 shrink-0 grid place-items-center text-white text-[10px] font-bold">
          {task.aspectRatio || "9:16"}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold truncate text-foreground">
            {task.projectName}
          </div>
          <div className="text-[10.5px] text-muted-foreground font-mono truncate flex items-center gap-1.5 mt-0.5">
            {task.mptTaskId ? (
              <>
                <span className="text-primary font-semibold truncate max-w-[140px]">{task.mptTaskId}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(task.mptTaskId!);
                    toast.info("Copied MPT Task ID");
                  }}
                  title="Copy Task ID"
                  className="hover:text-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </>
            ) : (
              <span>Local Queue Item</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <Pill
          tone={
            task.status === "completed"
              ? "success"
              : task.status === "failed"
                ? "danger"
                : isRunning
                  ? "primary"
                  : "default"
          }
        >
          {isRunning && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
          {task.status.toUpperCase()}
        </Pill>
      </div>

      <div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              task.status === "failed" ? "bg-rose-500" : "bg-brand-gradient"
            }`}
            style={{ width: `${task.progress || 0}%` }}
          />
        </div>
        <div className="text-[10.5px] font-mono text-muted-foreground mt-1">
          {Math.round(task.progress || 0)}%
        </div>
      </div>

      <div className="text-[11.5px] font-mono text-muted-foreground">
        {task.startedAt ? (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>Active</span>
          </div>
        ) : (
          <span>Pending</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-1.5">
        {task.status === "completed" && task.outputUrl && (
          <button
            onClick={() => onPlay(task.outputUrl!)}
            title="Play Video"
            className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 grid place-items-center transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {task.status === "completed" && task.downloadUrl && (
          <button
            onClick={() => downloadVideoFile(task.downloadUrl!, `${task.projectName}.mp4`)}
            title="Download Video"
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/70 text-foreground grid place-items-center transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {task.status === "failed" && (
          <button
            onClick={() => onRetry(task)}
            title="Retry Render"
            className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 grid place-items-center transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {task.status !== "rendering" && task.status !== "dispatching" && (
          <button
            onClick={() => onRemove(task)}
            title="Remove Job"
            className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 grid place-items-center transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: number;
  tone: "primary" | "neutral" | "success" | "danger";
  sub?: string;
}) {
  const cls = {
    primary: "text-primary",
    neutral: "text-muted-foreground",
    success: "text-emerald-500",
    danger: "text-rose-500",
  }[tone];
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
      <div className="text-[11.5px] text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </div>
      <div className={`font-display font-extrabold text-[26px] mt-1 tabular-nums ${cls}`}>
        {value}
      </div>
      {sub && <div className="text-[10.5px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
