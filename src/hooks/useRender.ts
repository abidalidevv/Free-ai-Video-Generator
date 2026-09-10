import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renderService } from "../services/render.service";
import { queryKeys } from "../api/query-keys";
import type { TaskRequest } from "../types/requests";

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function useSubmitRender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TaskRequest) => renderService.submit(body, body.idempotencyKey ?? newIdempotencyKey()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

export function useCancelRender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => renderService.cancel(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
      qc.invalidateQueries({ queryKey: queryKeys.task(id) });
    },
  });
}

export function useRetryRender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => renderService.retry(id, newIdempotencyKey()),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}
