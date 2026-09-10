import { endpoints } from "../api/endpoints";
import { post } from "../utils/request";
import type { GenerateScriptRequest, GenerateTermsRequest } from "../types/requests";
import type { ScriptResponse, TermsResponse } from "../types/responses";

export const llmService = {
  generateScript: (body: GenerateScriptRequest, signal?: AbortSignal) =>
    post<ScriptResponse>(endpoints.generateScript, body, { signal }),
  generateTerms: (body: GenerateTermsRequest, signal?: AbortSignal) =>
    post<TermsResponse>(endpoints.generateTerms, body, { signal }),
};
