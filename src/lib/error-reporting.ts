export type ErrorReportingOptions = {
  boundary?: string;
  fingerprint?: string[];
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && window.console) {
    console.error("[App Error]", error, context);
  }
}
