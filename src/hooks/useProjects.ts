import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import { projectService } from "../services/project.service";
import type { ProjectUpsertRequest } from "../types/requests";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: ({ signal }) => projectService.list(signal),
    // Phase 8B: enabled by default; callers can override.
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.project(id) : queryKeys.projects,
    queryFn: ({ signal }) => projectService.get(id as string, signal),
    // Phase 8B: enabled by default; callers can override.
  });
}

export function useUpsertProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectUpsertRequest) =>
      body.id ? projectService.update(body.id, body) : projectService.create(body),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.project(p.id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}
