import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import { voiceService } from "../services/voice.service";

export function useVoices() {
  return useQuery({
    queryKey: queryKeys.voices,
    queryFn: ({ signal }) => voiceService.list(signal),
    staleTime: 5 * 60_000,
    // Phase 8B: enabled by default; callers can override.
  });
}
