import type { Project, Output, RenderTask } from "../types";

const STORAGE_KEYS = {
  PROJECTS: "videoforge_projects_v1",
  ACTIVE_PROJECT_ID: "videoforge_active_project_id_v1",
  OUTPUTS: "videoforge_outputs_v1",
  QUEUE: "videoforge_render_queue_v1",
} as const;

function sanitizeProject(project: Project): Project {
  const safe = { ...project };
  // Never persist API keys or secrets in project data
  delete (safe as any).apiKey;
  delete (safe as any).token;
  delete (safe as any).secret;
  return safe;
}


function sanitizeQueueTask(task: RenderTask): RenderTask {
  const safe = { ...task };
  delete (safe as any).apiKey;
  delete (safe as any).token;
  delete (safe as any).secret;
  if (safe.taskRequest) {
    const req = { ...safe.taskRequest };
    delete (req as any).apiKey;
    delete (req as any).token;
    safe.taskRequest = req;
  }
  return safe;
}

function sanitizeOutput(output: Output): Output {
  const safe = { ...output };
  delete (safe as any).apiKey;
  delete (safe as any).token;
  // Ensure we don't store huge base64 data blobs in localStorage
  if (safe.filePath && safe.filePath.startsWith("data:video")) {
    safe.filePath = "";
  }
  return safe;
}

export const projectStorageService = {
  // ── Projects ──────────────────────────────────────────────────────────────
  listProjects(): Project[] {
    try {
      if (typeof window === "undefined" || !window.localStorage) return [];
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to load projects from localStorage:", e);
      return [];
    }
  },

  getProject(id: string): Project | null {
    const list = this.listProjects();
    return list.find((p) => p.id === id) || null;
  },

  saveProject(project: Project): Project {
    const list = this.listProjects();
    const clean = sanitizeProject({
      ...project,
      updatedAt: new Date().toISOString(),
    });
    const existingIndex = list.findIndex((p) => p.id === clean.id);
    let updated: Project[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = clean;
    } else {
      updated = [clean, ...list];
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Failed to save project to localStorage:", e);
    }
    return clean;
  },

  deleteProject(id: string): boolean {
    const list = this.listProjects();
    const updated = list.filter((p) => p.id !== id);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
        if (this.getActiveProjectId() === id) {
          this.setActiveProjectId(updated[0]?.id || null);
        }
      }
      return true;
    } catch (e) {
      console.error("Failed to delete project from localStorage:", e);
      return false;
    }
  },

  getActiveProjectId(): string | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || null;
    } catch {
      return null;
    }
  },

  setActiveProjectId(id: string | null): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      }
    } catch (e) {
      console.error("Failed to set active project id in localStorage:", e);
    }
  },

  // ── Outputs ───────────────────────────────────────────────────────────────
  listOutputs(): Output[] {
    try {
      if (typeof window === "undefined" || !window.localStorage) return [];
      const raw = localStorage.getItem(STORAGE_KEYS.OUTPUTS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to load outputs from localStorage:", e);
      return [];
    }
  },

  saveOutput(output: Output): Output {
    const list = this.listOutputs();
    const clean = sanitizeOutput(output);
    const existingIndex = list.findIndex((o) => o.id === clean.id);
    let updated: Output[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = clean;
    } else {
      updated = [clean, ...list];
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Failed to save output to localStorage:", e);
    }
    return clean;
  },

  deleteOutput(id: string): boolean {
    const list = this.listOutputs();
    const updated = list.filter((o) => o.id !== id);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify(updated));
      }
      return true;
    } catch (e) {
      console.error("Failed to delete output from localStorage:", e);
      return false;
    }
  },

  // ── Render Queue ──────────────────────────────────────────────────────────
  listQueue(): RenderTask[] {
    try {
      if (typeof window === "undefined" || !window.localStorage) return [];
      const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to load queue from localStorage:", e);
      return [];
    }
  },

  saveQueue(queue: RenderTask[]): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const sanitized = queue.map(sanitizeQueueTask);
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(sanitized));
    } catch (e) {
      console.error("Failed to save queue to localStorage:", e);
    }
  },

  clearCompletedQueue(): RenderTask[] {
    const list = this.listQueue();
    const remaining = list.filter((t) => t.status !== "completed");
    this.saveQueue(remaining);
    return remaining;
  },
};