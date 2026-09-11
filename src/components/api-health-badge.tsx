/**
 * Lightweight status pill for the global header. Reads `useApiHealth`
 * and renders live MPT connectivity state and latency. Safe to mount
 * anywhere — purely visual, no side effects.
 */
import { useApiHealth } from "@/hooks/useApiHealth";
import { cn } from "@/lib/utils";

export function ApiHealthBadge({ className }: { className?: string }) {
  const { data, isLoading, isError } = useApiHealth(15_000);

  const isOnline = Boolean(data?.ok && !isError);
  const status: "online" | "checking" | "offline" = isLoading
    ? "checking"
    : isOnline
      ? "online"
      : "offline";

  const label = {
    online: data?.latencyMs != null ? `MPT Online · ${data.latencyMs}ms` : "MPT Online",
    checking: "Checking MPT…",
    offline: "MPT Offline",
  }[status];

  const tooltip = {
    online: `Connected to MoneyPrinterTurbo ${data?.version || "Upstream"} (${data?.latencyMs || 0}ms roundtrip)`,
    checking: "Checking backend connectivity to http://127.0.0.1:8080…",
    offline: `MPT connection failed: ${data?.message || "Server unreachable"}. Ensure MoneyPrinterTurbo backend is running.`,
  }[status];

  return (
    <div
      className={cn(
        "hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border transition-colors",
        status === "online" && "border-border text-foreground",
        status === "checking" && "border-border text-muted-foreground",
        status === "offline" && "border-rose-500/30 bg-rose-500/5 text-rose-500",
        className,
      )}
      title={tooltip}
    >
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            status === "online" && "bg-emerald-500",
            status === "checking" && "bg-amber-400 animate-pulse",
            status === "offline" && "bg-rose-500",
          )}
        />
        {status === "online" && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-60" />
        )}
      </div>
      <span
        className={cn(
          "text-[12px] font-medium truncate",
          status === "online" && "text-foreground",
          status === "checking" && "text-muted-foreground",
          status === "offline" && "text-rose-500 font-semibold",
        )}
      >
        {label}
      </span>
    </div>
  );
}
