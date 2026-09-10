// ============================================================================
// Visual Render Pipeline — drives off PIPELINE_STAGES; backend swaps the
// `states` map for real-time events from MoneyPrinterTurbo task runner.
// ============================================================================

import { CheckCircle2, Loader2, Circle, XCircle, MinusCircle } from "lucide-react";
import { PIPELINE_STAGES, type PipelineStageState, type PipelineStageId, statusTone } from "@/lib/render-pipeline";
import { Pill } from "@/components/app-shell";

type StatesMap = Partial<Record<PipelineStageId, PipelineStageState>>;

export function RenderPipeline({ states, compact = false }: { states: StatesMap; compact?: boolean }) {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-[16px]">Render Pipeline</div>
          <div className="text-[11.5px] text-muted-foreground mt-0.5">
            Live mapping to MoneyPrinterTurbo task stages
          </div>
        </div>
        <Pill tone="primary">{Object.values(states).filter(s => s?.status === "running").length} running</Pill>
      </div>

      <ol className="relative">
        {PIPELINE_STAGES.map((stage, i) => {
          const state = states[stage.id] ?? { status: "waiting", progress: 0 } as PipelineStageState;
          const tone = statusTone(state.status);
          const Icon = stage.icon;
          return (
            <li
              key={stage.id}
              className={`relative grid grid-cols-[56px_1fr_auto] items-start gap-4 px-6 py-4 border-b border-border/50 last:border-0 transition ${
                state.status === "running" ? "bg-accent/30" : ""
              }`}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 transition ${
                    state.status === "completed"
                      ? "bg-success/10 text-success"
                      : state.status === "running"
                      ? "bg-brand-gradient text-white shadow-brand"
                      : state.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : state.status === "cancelled"
                      ? "bg-warning/15 text-amber-700"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <span
                    className={`absolute top-10 w-px h-[calc(100%-8px)] ${
                      state.status === "completed" ? "bg-success/40" : "bg-border"
                    }`}
                  />
                )}
              </div>

              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold text-foreground">{stage.label}</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {stage.backend}
                  </span>
                </div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">{stage.hint}</div>

                {!compact && state.status === "running" && (
                  <div className="mt-2.5">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-brand-gradient transition-all"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10.5px] text-muted-foreground font-mono">
                      <span>{Math.round(state.progress)}%</span>
                      {state.currentScene && <span>scene: {state.currentScene}</span>}
                      {state.currentClip && <span>clip: {state.currentClip}</span>}
                      {state.currentFile && <span className="truncate">file: {state.currentFile}</span>}
                    </div>
                  </div>
                )}
                {state.message && (
                  <div className="mt-1.5 text-[11px] text-muted-foreground italic">{state.message}</div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <StageIcon status={state.status} />
                <Pill tone={tone === "danger" ? "danger" : tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "primary" ? "primary" : "default"}>
                  {state.status.toUpperCase()}
                </Pill>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StageIcon({ status }: { status: PipelineStageState["status"] }) {
  if (status === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
  if (status === "running")   return <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />;
  if (status === "failed")    return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  if (status === "cancelled") return <MinusCircle className="w-3.5 h-3.5 text-amber-600" />;
  return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
}
