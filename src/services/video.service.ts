import { endpoints } from "../api/endpoints";
import { get, post } from "../utils/request";
import { apiClient } from "../api/client";
import type { SearchVideosRequest } from "../types/requests";
import type { VideoSearchHit } from "../types/responses";
import type { VideoMaterial } from "../types";

export const videoService = {
  searchVideos: (body: SearchVideosRequest, signal?: AbortSignal) =>
    post<VideoSearchHit[]>(endpoints.searchVideos, body, { signal }),

  searchImages: (body: SearchVideosRequest, signal?: AbortSignal) =>
    post<VideoSearchHit[]>(endpoints.searchImages, body, { signal }),

  listMaterials: async (signal?: AbortSignal): Promise<VideoMaterial[]> => {
    const res = await get<{ files: VideoMaterial[] }>(endpoints.videoMaterials, { signal });
    return res?.files ?? [];
  },

  uploadMaterial: async (
    file: File,
    onProgress?: (pct: number) => void,
    signal?: AbortSignal
  ): Promise<{ file: string }> => {
    const form = new FormData();
    form.append("file", file, file.name);

    const res = await apiClient.post<{ status: number; message: string; data: { file: string } }>(
      endpoints.videoMaterials,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
        onUploadProgress: (e) => {
          if (!onProgress) return;
          const total = e.total ?? file.size;
          const pct = total > 0 ? Math.round((e.loaded / total) * 100) : 0;
          onProgress(pct);
        },
      }
    );
    const data = res.data;
    if (data && typeof data === "object" && "data" in data) {
      return (data as any).data;
    }
    return data as any;
  },
};
