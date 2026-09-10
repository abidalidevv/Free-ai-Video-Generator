import { endpoints } from "../api/endpoints";
import { get } from "../utils/request";
import type { FontResponse, SubtitleTemplateResponse, BgmResponse } from "../types/responses";

export const subtitleService = {
  templates: (signal?: AbortSignal) =>
    get<SubtitleTemplateResponse[]>(endpoints.subtitleTemplates, { signal }),
  fonts: (signal?: AbortSignal) => get<FontResponse[]>(endpoints.fonts, { signal }),
  bgm: (signal?: AbortSignal) => get<BgmResponse[]>(endpoints.bgm, { signal }),
};
