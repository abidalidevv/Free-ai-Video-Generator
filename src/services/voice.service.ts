import { endpoints } from "../api/endpoints";
import { get, post } from "../utils/request";
import type { VoicePreviewRequest } from "../types/requests";
import type { VoiceResponse } from "../types/responses";

/**
 * Standard MPT-tested Edge and Azure Neural voices.
 * Current MPT backend does not expose a public /voices REST endpoint;
 * voice definitions are resolved server-side in app/services/voice.py.
 */
export const MPT_SUPPORTED_VOICES: VoiceResponse[] = [
  { id: "en-US-GuyNeural-Male", name: "en-US-GuyNeural-Male", language: "English (US)", gender: "male", provider: "edge" },
  { id: "en-US-JennyNeural-Female", name: "en-US-JennyNeural-Female", language: "English (US)", gender: "female", provider: "edge" },
  { id: "en-US-AriaNeural-Female", name: "en-US-AriaNeural-Female", language: "English (US)", gender: "female", provider: "azure" },
  { id: "en-US-ChristopherNeural-Male", name: "en-US-ChristopherNeural-Male", language: "English (US)", gender: "male", provider: "azure" },
  { id: "en-GB-SoniaNeural-Female", name: "en-GB-SoniaNeural-Female", language: "English (UK)", gender: "female", provider: "edge" },
  { id: "en-GB-RyanNeural-Male", name: "en-GB-RyanNeural-Male", language: "English (UK)", gender: "male", provider: "edge" },
  { id: "zh-CN-XiaoxiaoNeural-Female", name: "zh-CN-XiaoxiaoNeural-Female", language: "Chinese (Mandarin)", gender: "female", provider: "edge" },
  { id: "zh-CN-YunxiNeural-Male", name: "zh-CN-YunxiNeural-Male", language: "Chinese (Mandarin)", gender: "male", provider: "edge" },
  { id: "es-ES-ElviraNeural-Female", name: "es-ES-ElviraNeural-Female", language: "Spanish", gender: "female", provider: "edge" },
  { id: "ja-JP-NanamiNeural-Female", name: "ja-JP-NanamiNeural-Female", language: "Japanese", gender: "female", provider: "edge" },
];

export const voiceService = {
  /**
   * Client catalog of MPT-supported voices.
   */
  list: async (signal?: AbortSignal): Promise<VoiceResponse[]> => {
    return MPT_SUPPORTED_VOICES;
  },

  /**
   * Voice preview is UNSUPPORTED on MPT backend (no public preview route).
   */
  preview: async (body: VoicePreviewRequest, signal?: AbortSignal): Promise<Blob> => {
    throw new Error("Voice preview is unsupported on current MoneyPrinterTurbo backend.");
  },

  /**
   * Standalone audio generation via MPT POST /api/v1/audio.
   */
  generateAudio: async (body: any): Promise<any> => {
    return post<any>("/audio", body);
  },
};
