import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import { renderService } from "../services/render.service";
import type { TaskResponse } from "../types/responses";

/**
 * Live polling hook for MPT tasks.
 * Polls GET /api/v1/tasks/{id} every 1500ms.
 * Automatically halts when task status is succeeded, failed, or cancelled.
 */
export function useTask(id: string | undefined | null) {
  return useQuery<TaskResponse>({
    queryKey: id ? queryKeys.task(id) : (["tasks", "detail", "noop"] as const),
    queryFn: ({ signal }) => {
      if (!id) throw new Error("No task ID provided");
      return renderService.get(id, signal);
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 1500;
      if (status === "succeeded" || status === "failed" || status === "cancelled") {
        return false;
      }
      return 1500;
    },
  });
}
