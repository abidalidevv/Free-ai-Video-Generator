import { useMutation } from "@tanstack/react-query";
import { llmService } from "../services/llm.service";
import type { GenerateTermsRequest } from "../types/requests";

export function useGenerateKeywords() {
  return useMutation({
    mutationFn: (body: GenerateTermsRequest) => llmService.generateTerms(body),
  });
}
