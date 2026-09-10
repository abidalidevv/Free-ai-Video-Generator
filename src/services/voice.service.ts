import { endpoints } from "../api/endpoints";
import { get, post } from "../utils/request";
import type { VoicePreviewRequest } from "../types/requests";
import type { VoiceResponse } from "../types/responses";

export const voiceService = {
  list: (signal?: AbortSignal) => get<VoiceResponse[]>(endpoints.voices, { signal }),
  preview: (body: VoicePreviewRequest, signal?: AbortSignal) =>
    post<Blob>(endpoints.voicePreview, body, { signal, responseType: "blob" }),
};
