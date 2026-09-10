import { endpoints } from "../api/endpoints";
import { del, get, post } from "../utils/request";
import type { TaskRequest } from "../types/requests";
import type { TaskResponse, OutputResponse } from "../types/responses";

export const renderService = {
  list: (signal?: AbortSignal) => get<TaskResponse[]>(endpoints.tasks, { signal }),
  get: (id: string, signal?: AbortSignal) => get<TaskResponse>(endpoints.taskById(id), { signal }),
  submit: (body: TaskRequest, idempotencyKey?: string) =>
    post<TaskResponse>(endpoints.tasks, body, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    }),
  cancel: (id: string) => post<TaskResponse>(endpoints.taskCancel(id)),
  retry: (id: string, idempotencyKey?: string) =>
    post<TaskResponse>(endpoints.taskRetry(id), undefined, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    }),
  remove: (id: string) => del<void>(endpoints.taskById(id)),
  outputs: (signal?: AbortSignal) => get<OutputResponse[]>(endpoints.outputs, { signal }),
  output: (id: string, signal?: AbortSignal) => get<OutputResponse>(endpoints.outputById(id), { signal }),
  removeOutput: (id: string) => del<void>(endpoints.outputById(id)),
};
