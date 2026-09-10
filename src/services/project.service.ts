import { endpoints } from "../api/endpoints";
import { del, get, post, put } from "../utils/request";
import type { ProjectUpsertRequest } from "../types/requests";
import type { ProjectResponse } from "../types/responses";

export const projectService = {
  list: (signal?: AbortSignal) => get<ProjectResponse[]>(endpoints.projects, { signal }),
  get: (id: string, signal?: AbortSignal) => get<ProjectResponse>(endpoints.projectById(id), { signal }),
  create: (body: ProjectUpsertRequest) => post<ProjectResponse>(endpoints.projects, body),
  update: (id: string, body: ProjectUpsertRequest) =>
    put<ProjectResponse>(endpoints.projectById(id), body),
  remove: (id: string) => del<void>(endpoints.projectById(id)),
  duplicate: (id: string) => post<ProjectResponse>(endpoints.projectDuplicate(id)),
  export: (id: string) =>
    get<Blob>(endpoints.projectExport(id), { responseType: "blob" }),
  import: (file: File) => {
    const form = new FormData();
    form.append("file", file, file.name);
    return post<ProjectResponse>(endpoints.projectImport, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
