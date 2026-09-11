import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader, PrimaryButton, GhostButton, Pill, Input } from "@/components/app-shell";
import { EmptyState } from "@/components/shared";
import { useAppState } from "@/store/app-state";
import type { Project } from "@/types";
import { toast } from "sonner";
import { Plus, Search, Pin, Play, Trash2, Filter, Grid3x3, List, Clock, Film, History } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — VideoForge AI" }] }),
  component: ProjectsPage,
});

const tabs = ["All", "Recent", "Pinned", "Archived"] as const;

function ProjectsPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");

  const handleNewProject = () => {
    const id = crypto.randomUUID();
    const newProj: Project = {
      id,
      name: `Project ${state.recentProjects.length + 1}`,
      aspectRatio: "9:16",
      language: "en-US",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "SAVE_PROJECT", payload: newProj });
    toast.success("New project created");
    navigate({ to: "/create" });
  };

  const handleContinueLast = () => {
    if (state.currentProject) {
      navigate({ to: "/create" });
    } else if (state.recentProjects.length > 0) {
      dispatch({ type: "SET_PROJECT", payload: state.recentProjects[0] });
      navigate({ to: "/create" });
    } else {
      handleNewProject();
    }
  };

  const handleOpenProject = (p: Project) => {
    dispatch({ type: "SET_PROJECT", payload: p });
    navigate({ to: "/create" });
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "DELETE_PROJECT", payload: id });
    toast.success("Project deleted");
  };

  const filteredProjects = useMemo(() => {
    return state.recentProjects.filter(p => {
      if (tab === "Pinned" && !p.pinned) return false;
      if (tab === "Recent") {
        const ageMs = Date.now() - new Date(p.updatedAt).getTime();
        if (ageMs > 7 * 86_400_000) return false;
      }
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [state.recentProjects, tab, query]);

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Projects"]}
        title="Project Manager"
        subtitle="Every video you've made, drafted, or scheduled — persisted locally."
        actions={<>
          <GhostButton onClick={handleContinueLast}><History className="w-4 h-4 mr-1" /> Continue Last</GhostButton>
          <PrimaryButton onClick={handleNewProject}><Plus className="w-4 h-4 mr-1" /> New Project</PrimaryButton>
        </>}
      />

      <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 mb-5 shadow-card">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition ${tab === t ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
        ))}
        <div className="flex-1" />
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects" className="!h-9 !pl-9 !text-[12px]" />
        </div>
        <button className="h-9 px-3 rounded-xl text-[12px] font-semibold border border-border flex items-center gap-1.5 hover:bg-secondary"><Filter className="w-3.5 h-3.5" /> Filter</button>
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl border border-border">
          <button onClick={() => setView("grid")} className={`w-8 h-8 rounded-lg grid place-items-center ${view === "grid" ? "bg-secondary" : ""}`}><Grid3x3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setView("list")} className={`w-8 h-8 rounded-lg grid place-items-center ${view === "list" ? "bg-secondary" : ""}`}><List className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No projects found"
          description={state.recentProjects.length === 0 ? "Create your first project to begin generating videos." : "No projects match the current filter."}
          action={<PrimaryButton onClick={handleNewProject}><Plus className="w-4 h-4 mr-1" /> Create Project</PrimaryButton>}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-4 gap-5">
          {filteredProjects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={() => handleOpenProject(p)}
              onDelete={(e) => handleDeleteProject(p.id, e)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-6">Project</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Aspect Ratio</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filteredProjects.map(p => (
            <div
              key={p.id}
              onClick={() => handleOpenProject(p)}
              className="grid grid-cols-12 px-5 py-3 items-center border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition"
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-950 flex items-center justify-center text-white">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">Updated {new Date(p.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="col-span-2">
                <Pill tone={p.status === "completed" ? "success" : p.status === "rendering" ? "primary" : "default"}>
                  {p.status.toUpperCase()}
                </Pill>
              </div>
              <div className="col-span-2 text-[12.5px] font-mono">{p.aspectRatio}</div>
              <div className="col-span-2 flex justify-end gap-1">
                <button
                  onClick={(e) => handleDeleteProject(p.id, e)}
                  className="w-7 h-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive grid place-items-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ProjectCard({
  project, onOpen, onDelete,
}: {
  project: Project;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div onClick={onOpen} className="group cursor-pointer rounded-3xl bg-card border border-border p-3 shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition">
      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_60%)]" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {project.pinned && <span className="w-6 h-6 rounded-md bg-black/30 backdrop-blur grid place-items-center"><Pin className="w-3 h-3 text-white" fill="white" /></span>}
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded">
            {project.aspectRatio}
          </span>
        </div>
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-11 h-11 rounded-full bg-white/95 grid place-items-center shadow-lg"><Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" /></div>
        </div>
      </div>
      <div className="px-1 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[13px] font-bold truncate">{project.name}</div>
          <Pill tone={project.status === "completed" ? "success" : "default"}>{project.status.toUpperCase()}</Pill>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(project.updatedAt).toLocaleDateString()}</span>
          <button
            onClick={onDelete}
            title="Delete project"
            className="w-6 h-6 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive grid place-items-center"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
