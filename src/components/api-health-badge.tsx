/**
 * Lightweight status pill for the global header. Reads `useApiHealth`
 * and renders Connected / Reconnecting / Disconnected. Safe to mount
 * anywhere — purely visual, no side effects.
 */
import { useApiHealth } from "@/hooks/useApiHealth";
import { cn } from "@/lib/utils";

export function ApiHealthBadge({ className }: { className?: string }) {
  const { data, isLoading, isError, isFetching } = useApiHealth();

  const status: "connected" | "reconnecting" | "disconnected" | "loading" = isLoading
    ? "loading"
    : isError
      ? "disconnected"
      : isFetching && !data
        ? "reconnecting"
        : "connected";

  const label = {
    connected: "Backend online",
    reconnecting: "Reconnecting…",
    disconnected: "Backend offline",
    loading: "Checking backend…",
  }[status];

  const dot = {
    connected: "bg-emerald-500",
    reconnecting: "bg-amber-500 animate-pulse",
    disconnected: "bg-rose-500",
    loading: "bg-muted-foreground/60 animate-pulse",
  }[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground/80",
        className,
      )}
      title={label}
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span>{label}</span>
    </div>
  );
}
