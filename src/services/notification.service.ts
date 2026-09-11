/**
 * Centralized notification surface. Today this only forwards to Sonner
 * (already used by AppShell) so behaviour is unchanged. Phase 8B will
 * additionally fan out to the in-app NotificationCenter via the app
 * state reducer.
 */

import { toast } from "sonner";

export type NotificationLevel = "success" | "error" | "warning" | "info";

export interface NotifyOptions {
  title: string;
  description?: string;
  level?: NotificationLevel;
  durationMs?: number;
}

export const notificationService = {
  notify({ title, description, level = "info", durationMs }: NotifyOptions) {
    const opts = { description, duration: durationMs };
    switch (level) {
      case "success": return toast.success(title, opts);
      case "error":   return toast.error(title, opts);
      case "warning": return toast.warning(title, opts);
      default:        return toast(title, opts);
    }
  },
  renderCompleted: (name: string) =>
    notificationService.notify({ title: "Render complete", description: name, level: "success" }),
  queueCompleted: () =>
    notificationService.notify({ title: "Queue finished", level: "success" }),
  uploadCompleted: (filename: string) =>
    notificationService.notify({ title: "Upload complete", description: filename, level: "success" }),
  apiFailure: (message: string) =>
    notificationService.notify({ title: "Backend error", description: message, level: "error" }),
};
