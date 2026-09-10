import { endpoints } from "../api/endpoints";
import { post } from "../utils/request";
import type { SearchVideosRequest } from "../types/requests";
import type { VideoSearchHit } from "../types/responses";

export const videoService = {
  searchVideos: (body: SearchVideosRequest, signal?: AbortSignal) =>
    post<VideoSearchHit[]>(endpoints.searchVideos, body, { signal }),
  searchImages: (body: SearchVideosRequest, signal?: AbortSignal) =>
    post<VideoSearchHit[]>(endpoints.searchImages, body, { signal }),
};
