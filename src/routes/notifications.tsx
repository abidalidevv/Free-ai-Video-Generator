// ============================================================================
// Notification Center — full history with filtering, mark-all-read, clear-all.
// Reads from global app-state `notifications` (single source of truth).
// ============================================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AppShell, PageHeader, PrimaryButton, GhostButton,
} from "@/components/app-shell";
import { StatusBadge, EmptyState } from "@/components/shared";
import { useAppState } from "@/store/app-state";
import { relativeTime } from "@/lib/render-pipeline";
import type { NotificationCategory } from "@/types";
import {
  Bell, CheckCircle2, AlertTriangle, Info, XCircle, Filter,
  ArrowRight, Trash2, Volume2, MonitorSmartphone,
} from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — VideoForge AI" }] }),
  component: NotificationsPage,
});

const TABS: { id: "all" | NotificationCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "render", label: "Render" },
  { id: "api", label: "API" },
  { id: "system", label: "System" },
  { id: "billing", label: "Billing" },
  { id: "update", label: "Updates" },
];

const LEVEL_ICON = {
  success: { Icon: CheckCircle2, tone: "success" as const },
  info:    { Icon: Info,         tone: "info"    as const },
  warning: { Icon: AlertTriangle, tone: "warning" as const },
  error:   { Icon: XCircle,      tone: "error"   as const },
};

function NotificationsPage() {
  const { state, dispatch } = useAppState();
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("all");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const list = useMemo(() => state.notifications.filter(n =>
    (tab === "all" || n.category === tab) && (!onlyUnread || !n.isRead)
  ), [state.notifications, tab, onlyUnread]);

  const unread = state.notifications.filter(n => !n.isRead).length;

  return (
    <AppShell>
      <PageHeader
        crumb={["General", "Notifications"]}
        title="Notification Center"
        subtitle="Render, API, system and billing events in one timeline."
        actions={
          <>
            <GhostButton onClick={() => toast("Desktop notifications enabled")}><MonitorSmartphone className="w-4 h-4" /> Desktop</GhostButton>
            <GhostButton onClick={() => toast("Sound enabled")}><Volume2 className="w-4 h-4" /> Sound</GhostButton>
            <GhostButton onClick={() => { dispatch({ type: "MARK_NOTIFICATIONS_READ" }); toast.success("All marked as read"); }}>Mark all read</GhostButton>
            <PrimaryButton onClick={() => toast("Cleared")}><Trash2 className="w-4 h-4" /> Clear all</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <Stat label="Unread"      value={unread} tone="brand" />
        <Stat label="Today"       value={state.notifications.filter(n => Date.now() - +new Date(n.createdAt) < 86_400_000).length} tone="primary" />
        <Stat label="Render events" value={state.notifications.filter(n => n.category === "render").length} tone="neutral" />
        <Stat label="Errors"      value={state.notifications.filter(n => n.level === "error").length} tone="danger" />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-2xl bg-card border border-border p-2 flex items-center gap-1 shadow-card flex-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 h-9 rounded-xl text-[12.5px] font-semibold transition whitespace-nowrap ${
                tab === t.id ? "bg-brand-gradient text-white shadow-brand" : "text-muted-foreground hover:bg-secondary"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <GhostButton onClick={() => setOnlyUnread(v => !v)}>
          <Filter className="w-4 h-4" /> {onlyUnread ? "All" : "Unread only"}
        </GhostButton>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          {list.map(n => {
            const meta = LEVEL_ICON[n.level];
            return (
              <div key={n.id}
                className={`relative px-6 py-4 grid grid-cols-[44px_1fr_auto] gap-4 items-start border-b border-border/50 last:border-0 transition hover:bg-secondary/30 ${n.isRead ? "" : "bg-accent/20"}`}>
                {!n.isRead && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-gradient" />}
                <div className={`w-10 h-10 rounded-xl grid place-items-center ${
                  n.level === "success" ? "bg-success/10 text-success"
                  : n.level === "warning" ? "bg-warning/15 text-amber-700"
                  : n.level === "error" ? "bg-destructive/10 text-destructive"
                  : "bg-accent text-primary"
                }`}>
                  <meta.Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[13.5px] font-bold">{n.title}</div>
                    <StatusBadge tone="neutral">{n.category.toUpperCase()}</StatusBadge>
                  </div>
                  {n.message && <div className="text-[12px] text-muted-foreground mt-0.5">{n.message}</div>}
                  <div className="text-[10.5px] text-muted-foreground mt-1.5 font-mono">{relativeTime(n.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {n.actionTo && (
                    <Link to={n.actionTo}>
                      <button className="h-8 px-3 rounded-lg bg-card border border-border text-[11.5px] font-semibold hover:bg-secondary transition flex items-center gap-1.5">
                        {n.actionLabel ?? "View"} <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "brand" | "primary" | "neutral" | "danger" }) {
  const cls = { brand: "bg-brand-gradient bg-clip-text text-transparent", primary: "text-primary", neutral: "text-foreground", danger: "text-destructive" }[tone];
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
      <div className="text-[11.5px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`font-display font-extrabold text-[28px] mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
