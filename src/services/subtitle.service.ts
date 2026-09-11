import { endpoints } from "../api/endpoints";
import { get, post } from "../utils/request";
import type { FontResponse, SubtitleTemplateResponse, BgmResponse } from "../types/responses";

export const subtitleService = {
  templates: (signal?: AbortSignal) =>
    get<SubtitleTemplateResponse[]>(endpoints.subtitleTemplates, { signal }),

  /**
   * Font catalog supported by current MoneyPrinterTurbo installation.
   * MPT resolves fonts from local resource/fonts/ directory on disk.
   */
  fonts: async (signal?: AbortSignal): Promise<FontResponse[]> => {
    return [
      { family: "STHeitiMedium.ttc", url: "STHeitiMedium.ttc" },
      { family: "BeVietnamPro-Bold.ttf", url: "BeVietnamPro-Bold.ttf" },
      { family: "BeVietnamPro-Medium.ttf", url: "BeVietnamPro-Medium.ttf" },
      { family: "Charm-Bold.ttf", url: "Charm-Bold.ttf" },
      { family: "MicrosoftYaHeiBold.ttc", url: "MicrosoftYaHeiBold.ttc" },
      { family: "STHeitiLight.ttc", url: "STHeitiLight.ttc" },
      { family: "UTM Kabel KT.ttf", url: "UTM Kabel KT.ttf" },
    ];
  },

  /**
   * Fetches real background music files from MPT GET /api/v1/musics.
   * Unwraps { files: [ { name, size, file } ] } to BgmResponse[].
   */
  bgm: async (signal?: AbortSignal): Promise<BgmResponse[]> => {
    const res = await get<any>(endpoints.bgm, { signal });
    const rawFiles = res?.files ?? (Array.isArray(res) ? res : []);
    return rawFiles.map((f: any) => ({
      id: f.file || f.name,
      name: f.name || f.file,
      url: f.file || f.name,
      durationSec: undefined,
    }));
  },

  /**
   * Uploads custom background music to MPT POST /api/v1/musics.
   * Multipart/form-data validated and stored in storage/bgm.
   */
  uploadBgm: async (file: File): Promise<{ file: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    return post<{ file: string }>(endpoints.bgm, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Standalone subtitle generation via MPT POST /api/v1/subtitle.
   */
  createSubtitle: async (body: any): Promise<any> => {
    return post<any>("/subtitle", body);
  },
};
