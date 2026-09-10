import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, PrimaryButton, GhostButton, Pill, Input } from "@/components/app-shell";
import { Plus, Search, Pin, Archive, History, Play, MoreHorizontal, FolderOpen, Filter, Grid3x3, List, Clock, Film } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — VideoForge AI" }] }),
  component: ProjectsPage,
});

const tabs = ["All", "Recent", "Pinned", "Archived", "Autosaves"] as const;

const data = [
  { name: "Morning Habits of CEOs", status: "Rendering", progress: 42, updated: "2m ago", scenes: 9, duration: "1:32", pinned: true, hue: "from-emerald-700 to-emerald-950" },
  { name: "Top 10 AI Tools 2026", status: "Draft", progress: 18, updated: "1h ago", scenes: 12, duration: "12:08", pinned: true, hue: "from-orange-600 to-rose-800" },
  { name: "Tokyo at Midnight", status: "Completed", progress: 100, updated: "Yesterday", scenes: 8, duration: "5:42", hue: "from-violet-700 to-indigo-900" },
  { name: "Productivity Hacks", status: "Queued", progress: 0, updated: "2d", scenes: 6, duration: "4:18", hue: "from-amber-600 to-orange-800" },
  { name: "Crypto Explained", status: "Completed", progress: 100, updated: "5d", scenes: 14, duration: "9:14", hue: "from-cyan-700 to-blue-900" },
  { name: "Sleep Science", status: "Draft", progress: 32, updated: "1w", scenes: 10, duration: "7:02", hue: "from-indigo-700 to-purple-900" },
  { name: "Why People Quit", status: "Archived", progress: 100, updated: "3w", scenes: 11, duration: "6:28", hue: "from-stone-700 to-stone-900" },
  { name: "Stoicism in 60s", status: "Completed", progress: 100, updated: "1mo", scenes: 4, duration: "1:00", hue: "from-emerald-700 to-teal-900" },
];

function ProjectsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Projects"]}
        title="Project Manager"
        subtitle="Every video you've made, drafted, or scheduled — all in one place."
        actions={<>
          <GhostButton><History className="w-4 h-4" /> Continue Last</GhostButton>
          <PrimaryButton><Plus className="w-4 h-4" /> New Project</PrimaryButton>
        </>}
      />

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition ${tab === t ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
        ))}
        <div className="flex-1" />
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search projects" className="!h-9 !pl-9 !text-[12px]" />
        </div>
        <button className="h-9 px-3 rounded-xl text-[12px] font-semibold border border-border flex items-center gap-1.5 hover:bg-secondary"><Filter className="w-3.5 h-3.5" /> Filter</button>
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl border border-border">
          <button onClick={() => setView("grid")} className={`w-8 h-8 rounded-lg grid place-items-center ${view === "grid" ? "bg-secondary" : ""}`}><Grid3x3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setView("list")} className={`w-8 h-8 rounded-lg grid place-items-center ${view === "list" ? "bg-secondary" : ""}`}><List className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-4 gap-5">
          {data.map(p => <ProjectCard key={p.name} {...p} />)}
        </div>
      ) : (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-5">Project</div><div className="col-span-2">Status</div><div className="col-span-2">Scenes</div><div className="col-span-2">Updated</div><div className="col-span-1 text-right">Actions</div>
          </div>
          {data.map(p => (
            <div key={p.name} className="grid grid-cols-12 px-5 py-3 items-center border-b border-border/50 hover:bg-secondary/30">
              <div className="col-span-5 flex items-center gap-3"><div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.hue}`} /><div><div className="text-[13px] font-semibold">{p.name}</div><div className="text-[11px] text-muted-foreground">{p.duration}</div></div></div>
              <div className="col-span-2"><Pill tone={p.status === "Completed" ? "success" : p.status === "Rendering" ? "primary" : "default"}>{p.status}</Pill></div>
              <div className="col-span-2 text-[12.5px]">{p.scenes} scenes</div>
              <div className="col-span-2 text-[12px] text-muted-foreground">{p.updated}</div>
              <div className="col-span-1 flex justify-end gap-1">
                <button className="w-7 h-7 rounded-lg hover:bg-secondary grid place-items-center"><FolderOpen className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 rounded-lg hover:bg-secondary grid place-items-center"><MoreHorizontal className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ProjectCard(p: any) {
  return (
    <div className="group cursor-pointer rounded-3xl bg-card border border-border p-3 shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition">
      <div className={`relative aspect-video rounded-2xl bg-gradient-to-br ${p.hue} overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_60%)]" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {p.pinned && <span className="w-6 h-6 rounded-md bg-black/30 backdrop-blur grid place-items-center"><Pin className="w-3 h-3 text-white" fill="white" /></span>}
        </div>
        <div className="absolute top-2.5 right-2.5 text-[10px] font-semibold text-white bg-black/30 backdrop-blur px-1.5 py-0.5 rounded-md">{p.duration}</div>
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-11 h-11 rounded-full bg-white/95 grid place-items-center shadow-lg"><Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" /></div>
        </div>
        {p.progress > 0 && p.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30"><div className="h-full bg-brand-gradient" style={{ width: `${p.progress}%` }} /></div>
        )}
      </div>
      <div className="px-1 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[13px] font-bold truncate">{p.name}</div>
          <Pill tone={p.status === "Completed" ? "success" : p.status === "Rendering" ? "primary" : p.status === "Archived" ? "default" : "default"}>{p.status}</Pill>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {p.scenes} scenes</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.updated}</span>
        </div>
      </div>
    </div>
  );
}
