import type { AxiosError } from "axios";

/** Decide whether an axios failure is worth retrying. */
export function shouldRetry(error: AxiosError): boolean {
  // No response → network/timeout
  if (!error.response) return true;
  const status = error.response.status;
  // Retry on 5xx and 429; never on 4xx user errors.
  return status >= 500 || status === 429;
}

/** Exponential backoff with jitter, capped at 8 s. */
export function backoffDelay(attempt: number): number {
  const base = Math.min(8000, 250 * 2 ** (attempt - 1));
  const jitter = Math.random() * 200;
  return base + jitter;
}
