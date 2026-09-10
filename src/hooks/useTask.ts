import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import { renderService } from "../services/render.service";

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.task(id) : queryKeys.tasks,
    queryFn: ({ signal }) => renderService.get(id as string, signal),
    enabled: !!id,
  });
}
