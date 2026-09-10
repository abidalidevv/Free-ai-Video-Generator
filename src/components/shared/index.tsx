// ============================================================================
// Shared, reusable UI primitives used across pages.
// Visual identity matches AppShell tokens — do not restyle.
// ============================================================================

import { Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Inbox, Loader2, Check, CircleAlert, HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AppShell, PageHeader, GhostButton, PrimaryButton } from "@/components/app-shell";

// ── Status badge ───────────────────────────────────────────────────────────
type StatusTone = "success" | "warning" | "error" | "info" | "neutral" | "brand";
const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error:   "bg-rose-50 text-rose-700 border-rose-200",
  info:    "bg-sky-50 text-sky-700 border-sky-200",
  neutral: "bg-secondary text-muted-foreground border-border",
  brand:   "bg-brand-gradient text-white border-transparent shadow-brand",
};

export function StatusBadge({
  tone = "neutral", icon: Icon, children,
}: { tone?: StatusTone; icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full border text-[11px] font-bold uppercase tracking-wider ${TONE_CLASS[tone]}`}>
      {Icon ? <Icon className="w-3 h-3" /> : null}
      {children}
    </span>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon = Inbox, title, description, action,
}: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl bg-card border border-dashed border-border p-12 shadow-card text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary grid place-items-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-[15px] font-bold text-foreground mb-1">{title}</h3>
      {description ? <p className="text-[12.5px] text-muted-foreground max-w-md mx-auto">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

// ── Loading placeholder ────────────────────────────────────────────────────
export function LoadingPanel({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-10 shadow-card flex items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-[12.5px] font-semibold">{label}</span>
    </div>
  );
}

// ── Save / dirty indicator ─────────────────────────────────────────────────
export function SaveIndicator({
  isDirty, isSaving, lastSavedAt,
}: { isDirty: boolean; isSaving: boolean; lastSavedAt?: string | null }) {
  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-700">
        <CircleAlert className="w-3 h-3" /> Unsaved changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-700">
      <Check className="w-3 h-3" /> Saved{lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString()}` : ""}
    </span>
  );
}

// ── Help tip — inline tooltip with optional "Learn more" link ─────────────
export function HelpTip({
  label, learnMoreHref,
}: { label: string; learnMoreHref?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-4 h-4 grid place-items-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] z-50 w-[240px] rounded-lg bg-foreground text-background text-[11px] leading-snug font-medium px-3 py-2 shadow-card-lg"
        >
          {label}
          {learnMoreHref && (
            <a href={learnMoreHref} target="_blank" rel="noreferrer" className="block mt-1 text-[10.5px] underline opacity-80 hover:opacity-100">Learn more →</a>
          )}
        </span>
      )}
    </span>
  );
}

// ── Skeleton — generic shimmer block ───────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary/70 ${className}`} />;
}

// ── "Source of truth" redirect banner ──────────────────────────────────────
export function StudioRedirectBanner({
  title, description, to, ctaLabel,
}: { title: string; description: string; to: string; ctaLabel: string }) {
  return (
    <div className="rounded-3xl bg-brand-gradient text-white p-6 shadow-brand mb-6 flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-white/15 grid place-items-center shrink-0 backdrop-blur">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold">{title}</div>
        <div className="text-[12.5px] text-white/80 mt-0.5">{description}</div>
      </div>
      <Link to={to} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-foreground text-[12.5px] font-bold shadow-card hover:bg-white/95 transition">
        {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ── Coming Soon page (route-level) ─────────────────────────────────────────
export function ComingSoonPage({
  crumb, title, subtitle, eta = "Phase 7", description, icon: Icon = Sparkles,
}: {
  crumb: string[];
  title: string;
  subtitle?: string;
  eta?: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <AppShell>
      <PageHeader crumb={crumb} title={title} subtitle={subtitle} />
      <div className="rounded-3xl bg-card border border-border shadow-card p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-gradient shadow-brand grid place-items-center mb-5">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 h-6 rounded-full bg-secondary border border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Planned for {eta}
        </div>
        <h2 className="text-[20px] font-extrabold text-foreground tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-2 text-[13px] text-muted-foreground max-w-md mx-auto">{description}</p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link to="/"><GhostButton>Back to Dashboard</GhostButton></Link>
          <Link to="/create"><PrimaryButton><Sparkles className="w-3.5 h-3.5" /> Start Creating</PrimaryButton></Link>
        </div>
      </div>
    </AppShell>
  );
}
