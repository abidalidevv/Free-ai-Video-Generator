import { endpoints } from "../api/endpoints";
import { post } from "../utils/request";
import type { GenerateScriptRequest, GenerateTermsRequest } from "../types/requests";
import type { ScriptResponse, TermsResponse } from "../types/responses";

/**
 * Maps VideoForge script & terms requests directly to MoneyPrinterTurbo's
 * /api/v1/scripts and /api/v1/terms FastAPI controllers.
 */
export const llmService = {
  generateScript: async (body: GenerateScriptRequest, signal?: AbortSignal): Promise<ScriptResponse> => {
    // Exact MPT VideoScriptRequest model:
    const mptPayload = {
      video_subject: body.subject,
      video_language: body.language === "auto" ? "" : (body.language ?? ""),
      paragraph_number: body.paragraphs ?? 1,
      video_script_prompt: body.prompt ?? "",
      custom_system_prompt: body.systemPrompt ?? "",
    };
    const res = await post<any>(endpoints.generateScript, mptPayload, { signal });
    // MPT returns {"video_script": "..."} inside {status: 200, data: ...}
    const scriptText = res?.video_script ?? res?.script ?? (typeof res === "string" ? res : "");
    return {
      script: scriptText,
      video_script: scriptText,
      language: body.language,
    } as ScriptResponse;
  },

  generateTerms: async (body: GenerateTermsRequest, signal?: AbortSignal): Promise<TermsResponse> => {
    // Exact MPT VideoTermsRequest model:
    const mptPayload = {
      video_subject: body.subject ?? "",
      video_script: body.script,
      amount: body.amount ?? 5,
      match_materials_to_script: body.matchMaterialsToScript ?? false,
    };
    const res = await post<any>(endpoints.generateTerms, mptPayload, { signal });
    // MPT returns {"video_terms": ["..."]} inside {status: 200, data: ...}
    const termsList = res?.video_terms ?? res?.terms ?? (Array.isArray(res) ? res : []);
    return {
      terms: termsList,
      video_terms: termsList,
    } as TermsResponse;
  },
};
