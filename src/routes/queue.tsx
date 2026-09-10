// ============================================================================
// Render Queue Manager — drives off global state `renderQueue` (RenderTask[]).
// Backend wiring point: ENQUEUE_RENDER / UPDATE_RENDER actions in app-state.
// ============================================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AppShell, PageHeader, PrimaryButton, GhostButton, Pill, Input,
} from "@/components/app-shell";
import { StatusBadge, EmptyState } from "@/components/shared";
import { useAppState } from "@/store/app-state";
import { formatDuration, statusTone } from "@/lib/render-pipeline";
import type { RenderTask, RenderStatus } from "@/types";
import {
  Play, Pause, X, RotateCcw, ChevronUp, ChevronDown, Copy, Trash2,
  Search, ListVideo, Plus, Filter, Clock, Cpu,
} from "lucide-react";

export const Route = createFileRoute("/queue")({
  head: () => ({ meta: [{ title: "Render Queue — VideoForge AI" }] }),
  component: QueuePage,
});

const TABS: { id: "all" | RenderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rendering", label: "Active" },
  { id: "queued", label: "Queued" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
  { id: "canceled", label: "Canceled" },
];

function QueuePage() {
  const { state, dispatch } = useAppState();
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const tasks = useMemo(() => {
    return state.renderQueue.filter(t =>
      (tab === "all" || t.status === tab) &&
      (!query || t.projectName.toLowerCase().includes(query.toLowerCase()))
    );
  }, [state.renderQueue, tab, query]);

  const totals = {
    active: state.renderQueue.filter(t => t.status === "rendering" || t.status === "preparing" || t.status === "encoding").length,
    queued: state.renderQueue.filter(t => t.status === "queued").length,
    completed: state.renderQueue.filter(t => t.status === "completed").length,
    failed: state.renderQueue.filter(t => t.status === "failed").length,
  };

  const act = (id: string, patch: Partial<RenderTask>, msg?: string) => {
    dispatch({ type: "UPDATE_RENDER", payload: { id, patch } });
    if (msg) toast.success(msg);
  };

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Render Queue"]}
        title="Render Queue"
        subtitle="Pause, retry, reorder. Mirrors MoneyPrinterTurbo's task scheduler."
        actions={
          <>
            <Link to="/outputs"><GhostButton><ListVideo className="w-4 h-4" /> Outputs</GhostButton></Link>
            <Link to="/render"><PrimaryButton><Plus className="w-4 h-4" /> New Render</PrimaryButton></Link>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <Stat label="Active"    value={totals.active}    tone="primary" />
        <Stat label="Queued"    value={totals.queued}    tone="neutral" />
        <Stat label="Completed" value={totals.completed} tone="success" />
        <Stat label="Failed"    value={totals.failed}    tone="danger"  />
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search render tasks…" className="!pl-10" />
        </div>
        <GhostButton><Filter className="w-4 h-4" /> Priority</GhostButton>
      </div>

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition whitespace-nowrap ${
              tab === t.id ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="No render tasks"
          description="Start a render from the Render Studio to see it appear here."
          action={<Link to="/render"><PrimaryButton><Plus className="w-4 h-4" /> Start a Render</PrimaryButton></Link>}
        />
      ) : (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_120px_180px_140px_220px] gap-3 px-5 py-3 border-b border-border bg-secondary/30 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>#</span><span>Project</span><span>Status</span><span>Progress</span><span>Elapsed / ETA</span><span className="text-right">Actions</span>
          </div>
          {tasks.map((t, i) => (
            <QueueRow key={t.id} task={t} index={i + 1} onAct={act} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function QueueRow({ task, index, onAct }: { task: RenderTask; index: number; onAct: (id: string, patch: Partial<RenderTask>, msg?: string) => void }) {
  const tone = statusTone(task.status);
  return (
    <div className="grid grid-cols-[60px_1fr_120px_180px_140px_220px] gap-3 px-5 py-4 items-center border-b border-border/50 last:border-0 hover:bg-secondary/30 transition">
      <div className="text-[11px] font-mono text-muted-foreground">#{index.toString().padStart(2, "0")}</div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 shrink-0 grid place-items-center text-white text-[10px] font-bold">
          9:16
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold truncate">{task.projectName}</div>
          <div className="text-[10.5px] text-muted-foreground font-mono truncate">{task.id} · 1080p · h264-nvenc</div>
        </div>
      </div>

      <div>
        <StatusBadge tone={tone === "danger" ? "error" : tone === "primary" ? "info" : tone}>{task.status.toUpperCase()}</StatusBadge>
      </div>

      <div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className={`h-full ${task.status === "failed" ? "bg-destructive" : "bg-brand-gradient"} transition-all`} style={{ width: `${task.progress}%` }} />
        </div>
        <div className="text-[10.5px] font-mono text-muted-foreground mt-1">{Math.round(task.progress)}%</div>
      </div>

      <div className="text-[11.5px] font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3 h-3" /> {formatDuration(task.elapsedSec)}</div>
        <div className="flex items-center gap-1.5 text-foreground mt-0.5"><Cpu className="w-3 h-3 text-primary" /> ETA {formatDuration(task.etaSec)}</div>
      </div>

      <div className="flex items-center justify-end gap-1">
        {task.status === "rendering" || task.status === "preparing"
          ? <IconBtn icon={Pause} label="Pause" onClick={() => onAct(task.id, { status: "queued" }, "Paused")} />
          : <IconBtn icon={Play}  label="Resume" onClick={() => onAct(task.id, { status: "rendering" }, "Resumed")} />}
        <IconBtn icon={RotateCcw} label="Retry"  onClick={() => onAct(task.id, { status: "rendering", progress: 0 }, "Retrying")} />
        <IconBtn icon={Copy}      label="Duplicate" onClick={() => toast("Duplicated to queue")} />
        <IconBtn icon={ChevronUp} label="Move up" />
        <IconBtn icon={ChevronDown} label="Move down" />
        <IconBtn icon={X}         label="Cancel" onClick={() => onAct(task.id, { status: "canceled" }, "Canceled")} danger />
        <IconBtn icon={Trash2}    label="Remove" danger />
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick, danger }: any) {
  return (
    <button onClick={onClick} title={label}
      className={`w-8 h-8 rounded-lg grid place-items-center transition ${danger ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "primary" | "neutral" | "success" | "danger" }) {
  const cls = { primary: "text-primary", neutral: "text-muted-foreground", success: "text-emerald-600", danger: "text-destructive" }[tone];
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
      <div className="text-[11.5px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`font-display font-extrabold text-[28px] mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
