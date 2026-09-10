import { useMutation } from "@tanstack/react-query";
import { llmService } from "../services/llm.service";
import type { GenerateScriptRequest } from "../types/requests";

export function useGenerateScript() {
  return useMutation({
    mutationFn: (body: GenerateScriptRequest) => llmService.generateScript(body),
  });
}
