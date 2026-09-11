// ============================================================================
// Output Studio — every render produces a rich Output card with full metadata.
// Connected to real MoneyPrinterTurbo tasks + client persistence + direct MP4 download.
// ============================================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AppShell, PageHeader, PrimaryButton, GhostButton, Pill, Input,
} from "@/components/app-shell";
import { EmptyState } from "@/components/shared";
import { VideoPlayer } from "@/components/render/video-player";
import { useAppState } from "@/store/app-state";
import { formatBytes, formatDuration, relativeTime } from "@/lib/render-pipeline";
import { renderService } from "@/services/render.service";
import { queryKeys } from "@/api/query-keys";
import { downloadVideoFile } from "@/utils/download";
import type { Output } from "@/types";
import {
  Search, Play, Heart, Share2, Copy, Trash2, FolderOpen, Filter, Plus,
  Star, FileVideo, X, Mic, Subtitles, Film, Cpu, Monitor, Calendar,
  HardDrive, Hash, RefreshCcw, Pencil, Download, Eye,
} from "lucide-react";

export const Route = createFileRoute("/outputs")({
  head: () => ({ meta: [{ title: "Outputs — VideoForge AI" }] }),
  component: OutputsPage,
});

const FILTERS = ["All", "Today", "This Week", "This Month", "Favorites"] as const;

function OutputsPage() {
  const { state, dispatch } = useAppState();
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Output | null>(null);

  // Poll real completed tasks from MPT
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: ({ signal }) => renderService.list(signal),
    refetchInterval: 5000,
  });

  const mptOutputs = useMemo(() => {
    if (!tasksQuery.data) return [];
    return tasksQuery.data
      .filter((t) => (t.status === "succeeded" || (t as any).output) && t.output)
      .map((t) => ({
        id: t.id,
        projectId: (t.request as any)?.video_subject || "project-default",
        name: t.output?.name || `Render ${t.id.slice(0, 8)}`,
        thumbnail: undefined,
        durationSec: t.output?.durationSec || 15,
        fileSizeBytes: t.output?.sizeBytes || 0,
        resolution: "1080p",
        format: "mp4",
        createdAt: t.createdAt || new Date().toISOString(),
        filePath: t.output?.url,
        downloadUrl: t.output?.downloadUrl,
      } as Output));
  }, [tasksQuery.data]);

  // Combine live MPT outputs and locally persisted outputs (MPT outputs take precedence)
  const allOutputs = useMemo(() => {
    const map = new Map<string, Output>();
    for (const o of state.recentOutputs) {
      map.set(o.id, o);
    }
    for (const o of mptOutputs) {
      map.set(o.id, o);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.recentOutputs, mptOutputs]);

  const outputs = useMemo(() => {
    const now = Date.now();
    return allOutputs.filter(o => {
      const ageMs = now - new Date(o.createdAt).getTime();
      if (filter === "Today" && ageMs > 86_400_000) return false;
      if (filter === "This Week" && ageMs > 7 * 86_400_000) return false;
      if (filter === "This Month" && ageMs > 30 * 86_400_000) return false;
      if (filter === "Favorites" && !favorites.has(o.id)) return false;
      if (query && !o.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [allOutputs, filter, query, favorites]);

  const toggleFav = (id: string) => {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavorites(next);
  };

  const handleDelete = async (output: Output) => {
    dispatch({ type: "DELETE_OUTPUT", payload: output.id });
    try {
      await renderService.remove(output.id);
      tasksQuery.refetch();
      toast.success("Output deleted from server");
    } catch {
      toast.success("Output removed from library");
    }
    if (selected?.id === output.id) {
      setSelected(null);
    }
  };

  const handleDownload = (output: Output) => {
    const targetUrl = output.downloadUrl || output.filePath || "";
    const filename = `${output.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.mp4`;
    downloadVideoFile(targetUrl, filename);
  };

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Output Studio"]}
        title="Output Studio"
        subtitle="Every rendered video, with full metadata and direct download."
        actions={
          <>
            <GhostButton onClick={() => tasksQuery.refetch()}>
              <RefreshCcw className="w-4 h-4 mr-1" /> Refresh
            </GhostButton>
            <Link to="/render"><PrimaryButton><Plus className="w-4 h-4" /> New Render</PrimaryButton></Link>
          </>
        }
      />

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search outputs…" className="!pl-10" />
        </div>
        <GhostButton><Filter className="w-4 h-4" /> Resolution</GhostButton>
        <select className="h-10 px-3 rounded-xl bg-card border border-border text-[13px]">
          <option>Sort: Newest</option><option>Largest first</option><option>By project</option>
        </select>
      </div>

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition ${
              filter === f ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {outputs.length === 0 ? (
        <EmptyState
          icon={FileVideo}
          title="No outputs yet"
          description="Finished renders from MoneyPrinterTurbo will appear here automatically."
          action={<Link to="/render"><PrimaryButton><Plus className="w-4 h-4" /> Start your first render</PrimaryButton></Link>}
        />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {outputs.map(o => (
            <OutputCard
              key={o.id} output={o}
              fav={favorites.has(o.id)}
              onFav={() => toggleFav(o.id)}
              onOpen={() => setSelected(o)}
              onDownload={() => handleDownload(o)}
              onDelete={() => handleDelete(o)}
            />
          ))}
        </div>
      )}

      {selected && (
        <MetadataDrawer
          output={selected}
          onClose={() => setSelected(null)}
          onDownload={() => handleDownload(selected)}
          onDelete={() => handleDelete(selected)}
        />
      )}
    </AppShell>
  );
}

function OutputCard({
  output, fav, onFav, onOpen, onDownload, onDelete,
}: {
  output: Output;
  fav: boolean;
  onFav: () => void;
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-3xl bg-card border border-border p-3 shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition">
      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-900 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_60%)]" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <Pill tone="primary">{output.resolution.toUpperCase()}</Pill>
          <Pill tone="success">READY</Pill>
        </div>
        <button
          onClick={onFav}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-md backdrop-blur grid place-items-center ${fav ? "bg-rose-500 text-white" : "bg-black/30 text-white"}`}
        >
          <Heart className="w-3.5 h-3.5" fill={fav ? "currentColor" : "none"} />
        </button>
        <div className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold text-white bg-black/40 backdrop-blur px-1.5 py-0.5 rounded">
          {formatDuration(output.durationSec)}
        </div>
        <button onClick={onOpen} className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-12 h-12 rounded-full bg-white/95 grid place-items-center shadow-lg"><Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" /></div>
        </button>
      </div>
      <div className="px-1 pt-3 pb-1">
        <div className="text-[13px] font-bold truncate">{output.name}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {formatBytes(output.fileSizeBytes)} · {relativeTime(output.createdAt)} · {output.format.toUpperCase()}
        </div>
        <div className="mt-3 flex items-center gap-1">
          <ActionBtn icon={Eye} label="Details & Player" onClick={onOpen} />
          <ActionBtn icon={Download} label="Download MP4" onClick={onDownload} />
          <ActionBtn icon={Copy} label="Copy stream URL" onClick={() => {
            if (output.filePath) {
              navigator.clipboard.writeText(output.filePath);
              toast.success("Stream URL copied");
            }
          }} />
          <ActionBtn icon={Trash2} label="Delete" danger onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, danger }: any) {
  return (
    <button onClick={onClick} title={label}
      className={`flex-1 h-8 rounded-lg grid place-items-center text-muted-foreground hover:bg-secondary ${danger ? "hover:text-destructive" : "hover:text-primary"} transition`}>
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

// ── Metadata drawer ────────────────────────────────────────────────────────
function MetadataDrawer({
  output, onClose, onDownload, onDelete,
}: {
  output: Output;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid grid-cols-[1fr_640px]">
      <button className="bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="bg-background border-l border-border overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Output</div>
            <div className="text-[16px] font-display font-extrabold truncate">{output.name}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary grid place-items-center hover:bg-card hover:border hover:border-border">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <VideoPlayer aspect="9:16" title={output.name} src={output.filePath} />

          <div className="flex gap-3">
            <PrimaryButton onClick={onDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Download MP4 Video
            </PrimaryButton>
            <GhostButton onClick={onDelete} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </GhostButton>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Meta icon={Monitor}   label="Resolution"      value={`${output.resolution.toUpperCase()} · 9:16`} />
            <Meta icon={Film}      label="Duration"        value={`${output.durationSec}s`} />
            <Meta icon={Cpu}       label="Backend Engine"  value="MoneyPrinterTurbo v1.3.6" />
            <Meta icon={HardDrive} label="Format"          value={output.format.toUpperCase()} />
            <Meta icon={Calendar}  label="Created"         value={new Date(output.createdAt).toLocaleString()} />
            <Meta icon={Hash}      label="Task ID"         value={output.id} mono />
          </div>

          <div>
            <SectionHeading>Stream URL</SectionHeading>
            <div className="rounded-2xl bg-secondary/40 border border-border p-4 font-mono text-[12px] flex items-center justify-between gap-3">
              <span className="truncate text-muted-foreground">{output.filePath || "Unavailable"}</span>
              <button
                onClick={() => {
                  if (output.filePath) {
                    navigator.clipboard.writeText(output.filePath);
                    toast.success("Stream URL copied");
                  }
                }}
                className="text-primary font-semibold text-[11px] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          </div>

          {output.downloadUrl && (
            <div>
              <SectionHeading>Direct Download URL</SectionHeading>
              <div className="rounded-2xl bg-secondary/40 border border-border p-4 font-mono text-[12px] flex items-center justify-between gap-3">
                <span className="truncate text-muted-foreground">{output.downloadUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output.downloadUrl!);
                    toast.success("Download URL copied");
                  }}
                  className="text-primary font-semibold text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value, mono }: any) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3.5 shadow-card flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-secondary grid place-items-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`text-[12.5px] font-semibold truncate ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: any) {
  return <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2.5">{children}</div>;
}
