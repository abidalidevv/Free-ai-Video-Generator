import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import { renderService } from "../services/render.service";

export function useOutputs() {
  return useQuery({
    queryKey: queryKeys.outputs,
    queryFn: ({ signal }) => renderService.outputs(signal),
    // Phase 8B: enabled by default; callers can override.
  });
}
