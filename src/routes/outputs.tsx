// ============================================================================
// Output Studio — every render produces a rich Output card with full metadata.
// Backend wiring: app-state `recentOutputs` is the single source of truth.
// ============================================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AppShell, PageHeader, PrimaryButton, GhostButton, Pill, Input,
} from "@/components/app-shell";
import { StatusBadge, EmptyState } from "@/components/shared";
import { VideoPlayer } from "@/components/render/video-player";
import { useAppState } from "@/store/app-state";
import { formatBytes, formatDuration, relativeTime } from "@/lib/render-pipeline";
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
  const { state } = useAppState();
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set([state.recentOutputs[0]?.id]));
  const [selected, setSelected] = useState<Output | null>(null);

  const outputs = useMemo(() => {
    const now = Date.now();
    return state.recentOutputs.filter(o => {
      const ageMs = now - new Date(o.createdAt).getTime();
      if (filter === "Today" && ageMs > 86_400_000) return false;
      if (filter === "This Week" && ageMs > 7 * 86_400_000) return false;
      if (filter === "This Month" && ageMs > 30 * 86_400_000) return false;
      if (filter === "Favorites" && !favorites.has(o.id)) return false;
      if (query && !o.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [state.recentOutputs, filter, query, favorites]);

  const toggleFav = (id: string) => {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavorites(next);
  };

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Output Studio"]}
        title="Output Studio"
        subtitle="Every rendered video, with full metadata and a desktop-class player."
        actions={
          <>
            <GhostButton><FolderOpen className="w-4 h-4" /> Open Folder</GhostButton>
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
          description="Finished renders will appear here automatically."
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
            />
          ))}
        </div>
      )}

      {selected && <MetadataDrawer output={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function OutputCard({ output, fav, onFav, onOpen }: { output: Output; fav: boolean; onFav: () => void; onOpen: () => void }) {
  return (
    <div className="group rounded-3xl bg-card border border-border p-3 shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition">
      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-900 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_60%)]" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <Pill tone="primary">{output.resolution.toUpperCase()}</Pill>
          <Pill tone="success">SUCCESS</Pill>
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
          <ActionBtn icon={Eye} label="Details" onClick={onOpen} />
          <ActionBtn icon={FolderOpen} label="Reveal" onClick={() => toast("Revealing in folder")} />
          <ActionBtn icon={Share2} label="Share" />
          <ActionBtn icon={Copy} label="Copy path" onClick={() => toast.success("Path copied")} />
          <ActionBtn icon={Pencil} label="Rename" />
          <ActionBtn icon={Trash2} label="Delete" danger />
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
function MetadataDrawer({ output, onClose }: { output: Output; onClose: () => void }) {
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
          <VideoPlayer aspect="9:16" title={output.name} />

          <div className="grid grid-cols-2 gap-3">
            <Meta icon={Monitor}   label="Resolution"      value={`${output.resolution.toUpperCase()} · 9:16`} />
            <Meta icon={Film}      label="FPS"             value="30 fps" />
            <Meta icon={Cpu}       label="Encoder"         value="H.264 NVENC" />
            <Meta icon={HardDrive} label="File size"       value={formatBytes(output.fileSizeBytes)} />
            <Meta icon={Calendar}  label="Created"         value={new Date(output.createdAt).toLocaleString()} />
            <Meta icon={Hash}      label="Output ID"       value={output.id} mono />
          </div>

          <div>
            <SectionHeading>Production</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <Meta icon={Mic}       label="Voice"           value="ElevenLabs · David v2" />
              <Meta icon={Subtitles} label="Subtitle template" value="Clean Bold White" />
              <Meta icon={Film}      label="Transition"      value="Fade · 280 ms" />
              <Meta icon={Cpu}       label="LLM model"       value="gpt-4o-mini · OpenAI" />
            </div>
          </div>

          <div>
            <SectionHeading>Storage</SectionHeading>
            <div className="rounded-2xl bg-secondary/40 border border-border p-4 font-mono text-[12px] flex items-center justify-between gap-3">
              <span className="truncate text-muted-foreground">{output.filePath}</span>
              <button onClick={() => toast.success("Path copied")} className="text-primary font-semibold text-[11px] flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <PrimaryButton><Play className="w-3.5 h-3.5" fill="currentColor" /> Play</PrimaryButton>
            <GhostButton><FolderOpen className="w-3.5 h-3.5" /> Open Folder</GhostButton>
            <GhostButton><RefreshCcw className="w-3.5 h-3.5" /> Regenerate</GhostButton>
            <GhostButton><Download className="w-3.5 h-3.5" /> Export JSON</GhostButton>
            <GhostButton><Star className="w-3.5 h-3.5" /> Favorite</GhostButton>
            <GhostButton><Trash2 className="w-3.5 h-3.5" /> Delete</GhostButton>
          </div>
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
