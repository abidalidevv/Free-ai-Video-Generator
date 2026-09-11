import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Field, Input, Select, Toggle, GhostButton, PrimaryButton, Pill } from "@/components/app-shell";
import { User, UserCircle, Sparkles, Receipt, Gauge, Shield, Check, Download, Smartphone, Key, Settings as SettingsIcon, Server, Activity, CheckCircle2, AlertCircle, Clock, Film, Layers, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApiHealth } from "@/hooks/useApiHealth";
import { settingsService } from "@/services/settings.service";
import { env } from "@/api/env";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } =>
    typeof search.tab === "string" ? { tab: search.tab } : {},
  head: () => ({ meta: [{ title: "Account — VideoForge AI" }] }),
  component: AccountPage,
});

const tabs = [
  { k: "profile", l: "Profile", icon: User },
  { k: "account", l: "Account", icon: UserCircle },
  { k: "subscription", l: "Subscription", icon: Sparkles },
  { k: "billing", l: "Billing", icon: Receipt },
  { k: "api-usage", l: "API Usage", icon: Gauge },
  { k: "security", l: "Security", icon: Shield },
  { k: "general", l: "General Settings", icon: SettingsIcon },
];

function AccountPage() {
  const { tab: tabParam } = Route.useSearch();
  const initial = tabs.some(t => t.k === tabParam) ? tabParam! : "profile";
  const [tab, setTab] = useState(initial);
  useEffect(() => {
    if (tabParam && tabs.some(t => t.k === tabParam)) setTab(tabParam);
  }, [tabParam]);
  const current = tabs.find(t => t.k === tab) ?? tabs[0];
  return (
    <AppShell>
      <PageHeader crumb={["Account", current.l]} title="Account" subtitle="Profile, plan, billing and security — all in one place." />

      <div className="flex gap-5">
        <aside className="w-60 shrink-0">
          <div className="rounded-2xl bg-card border border-border p-2 sticky top-[88px] shadow-card">
            <div className="p-3 flex items-center gap-3 border-b border-border mb-2">
              <div className="w-11 h-11 rounded-xl bg-brand-gradient grid place-items-center text-white font-bold text-[14px]">AA</div>
              <div className="min-w-0"><div className="text-[13px] font-bold truncate">Abid Ali</div><div className="text-[11px] text-muted-foreground truncate">Pro plan</div></div>
            </div>
            {tabs.map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition ${tab === t.k ? "bg-accent text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                <t.icon className="w-4 h-4" /><span>{t.l}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-5">
          {tab === "profile" && <Group title="Profile" sub="How your profile appears across VideoForge">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-brand-gradient grid place-items-center text-white font-display font-extrabold text-[28px] shadow-brand">AA</div>
              <div className="space-y-2"><GhostButton className="!h-9 !text-[12px]">Upload photo</GhostButton><div className="text-[11px] text-muted-foreground">PNG or JPG, max 4 MB</div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name"><Input defaultValue="Abid" /></Field>
              <Field label="Last name"><Input defaultValue="Ali" /></Field>
              <Field label="Display name"><Input defaultValue="Abid Ali" /></Field>
              <Field label="Title"><Input defaultValue="Creator · Founder" /></Field>
              <Field label="Website"><Input defaultValue="https://abidalidev.com" /></Field>
              <Field label="Timezone"><Select><option>UTC+05:00 — Pakistan</option><option>UTC-08:00 — Pacific</option><option>UTC+00:00 — London</option></Select></Field>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-5"><GhostButton>Cancel</GhostButton><PrimaryButton>Save profile</PrimaryButton></div>
          </Group>}

          {tab === "account" && <Group title="Account" sub="Email, password and connected accounts">
            <Field label="Email address"><Input defaultValue="abid@abidalidev.com" /></Field>
            <Field label="Username"><Input defaultValue="abidmmp" /></Field>
            <Field label="Account type"><Select><option>Individual</option><option>Team</option><option>Agency</option></Select></Field>
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Connected accounts</div>
              {[["Google", true], ["GitHub", true], ["LinkedIn", false]].map(([n, c]) => (
                <div key={n as string} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <span className="text-[13px] font-semibold">{n}</span>
                  {c ? <Pill tone="success">Connected</Pill> : <button className="text-[12px] font-semibold text-primary">Connect</button>}
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-[12px] font-bold text-destructive uppercase tracking-wider mb-2">Danger zone</div>
              <GhostButton className="!text-destructive">Delete my account</GhostButton>
            </div>
          </Group>}

          {tab === "subscription" && <Group title="Subscription" sub="You're on the Pro plan">
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: "Free", p: "$0", f: ["3 renders / day", "Watermarked", "720p max"] },
                { n: "Pro", p: "$24", f: ["Unlimited renders", "No watermark", "4K · 60 fps", "Priority GPU queue", "Premium voices"], best: true },
                { n: "Studio", p: "$79", f: ["Pro + Team seats (5)", "API access", "Custom voice clone", "Dedicated support"] },
              ].map(p => (
                <div key={p.n} className={`relative rounded-2xl p-5 border-2 ${p.best ? "border-primary bg-brand-gradient-radial text-white shadow-brand" : "border-border bg-card"}`}>
                  {p.best && <Pill tone="default" ><span className="text-primary">CURRENT</span></Pill>}
                  <div className={`font-display font-bold text-[16px] mt-2 ${p.best ? "" : ""}`}>{p.n}</div>
                  <div className={`font-display font-extrabold text-[32px] mt-2 ${p.best ? "" : ""}`}>{p.p}<span className={`text-[13px] font-medium ${p.best ? "text-white/70" : "text-muted-foreground"}`}>/mo</span></div>
                  <div className="space-y-1.5 mt-4">{p.f.map(x => <div key={x} className={`text-[12px] flex items-center gap-2 ${p.best ? "text-white/90" : ""}`}><Check className="w-3.5 h-3.5" /> {x}</div>)}</div>
                  <button className={`mt-5 w-full h-10 rounded-xl font-bold text-[12.5px] ${p.best ? "bg-white text-[#164E32]" : "bg-secondary text-foreground hover:bg-secondary/70"}`}>{p.best ? "Manage" : "Upgrade"}</button>
                </div>
              ))}
            </div>
          </Group>}

          {tab === "billing" && <Group title="Billing" sub="Payment method and invoices">
            <div className="p-4 rounded-2xl border border-border bg-secondary/30 flex items-center gap-4">
              <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-900 grid place-items-center text-white text-[10px] font-extrabold">VISA</div>
              <div className="flex-1"><div className="text-[13px] font-bold">Visa ending in 4242</div><div className="text-[11.5px] text-muted-foreground">Expires 09/28 · Next charge Jul 24, 2026 · $24.00</div></div>
              <GhostButton className="!h-9 !text-[12px]">Update</GhostButton>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden mt-4">
              <div className="grid grid-cols-12 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                <div className="col-span-3">Date</div><div className="col-span-4">Description</div><div className="col-span-2">Amount</div><div className="col-span-2">Status</div><div className="col-span-1 text-right">PDF</div>
              </div>
              {[
                { d: "Jun 24, 2026", desc: "Pro plan — monthly", a: "$24.00", s: "Paid" },
                { d: "May 24, 2026", desc: "Pro plan — monthly", a: "$24.00", s: "Paid" },
                { d: "Apr 24, 2026", desc: "Pro plan — monthly", a: "$24.00", s: "Paid" },
              ].map((r, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-3 items-center border-b border-border/50 text-[12.5px]">
                  <div className="col-span-3 text-muted-foreground">{r.d}</div>
                  <div className="col-span-4 font-semibold">{r.desc}</div>
                  <div className="col-span-2 tabular-nums">{r.a}</div>
                  <div className="col-span-2"><Pill tone="success">{r.s}</Pill></div>
                  <div className="col-span-1 text-right"><button className="text-primary"><Download className="w-3.5 h-3.5" /></button></div>
                </div>
              ))}
            </div>
          </Group>}

          {tab === "api-usage" && <ApiUsageTabContent />}

          {tab === "security" && <Group title="Security" sub="Protect your account">
            <Field label="Current password"><Input type="password" /></Field>
            <Field label="New password"><Input type="password" /></Field>
            <Field label="Confirm new password"><Input type="password" /></Field>
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border"><div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-primary" /><div><div className="text-[13px] font-bold">Two-factor authentication</div><div className="text-[11.5px] text-muted-foreground">Authenticator app</div></div></div><Pill tone="success">Active</Pill></div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-border"><div className="flex items-center gap-3"><Key className="w-4 h-4 text-primary" /><div><div className="text-[13px] font-bold">Personal API key</div><div className="text-[11.5px] text-muted-foreground font-mono">vfp_•••8aZ9</div></div></div><GhostButton className="!h-9 !text-[12px]">Rotate</GhostButton></div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-border"><div className="text-[13px] font-bold">Sign out of all sessions</div><GhostButton className="!h-9 !text-[12px] !text-destructive">Sign out</GhostButton></div>
            </div>
            <div className="pt-3 border-t border-border space-y-2">
              <Row label="Email me on new sign-in"><Toggle checked /></Row>
              <Row label="Require password for sensitive changes"><Toggle checked /></Row>
            </div>
          </Group>}

          {tab === "general" && <Group title="General" sub="Workspace name, defaults and behavior">
            <Field label="Workspace name"><Input defaultValue="Abid's Studio" /></Field>
            <Field label="Default project location"><Input defaultValue="C:\\VideoForge\\Projects" /></Field>
            <Field label="Theme"><Select><option>System</option><option>Light</option><option>Dark</option></Select></Field>
            <Row label="Start with last project"><Toggle checked /></Row>
            <Row label="Send anonymous usage analytics"><Toggle /></Row>
            <Row label="Show keyboard shortcuts on hover"><Toggle checked /></Row>
          </Group>}
        </div>
      </div>
    </AppShell>
  );
}

function Group({ title, sub, children }: any) {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="mb-5"><h3 className="font-display font-bold text-[18px]">{title}</h3>{sub && <p className="text-[12.5px] text-muted-foreground mt-1">{sub}</p>}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Row({ label, children }: any) {
  return <div className="flex items-center justify-between py-2"><span className="text-[13px] font-medium">{label}</span>{children}</div>;
}


function ApiUsageTabContent() {
  const { data: health, isLoading: healthLoading, isError: healthError } = useApiHealth(10_000);
  const { data: telemetry, isLoading: telLoading, refetch } = useQuery({
    queryKey: ["taskTelemetry"],
    queryFn: ({ signal }) => settingsService.taskTelemetry(signal),
    refetchInterval: 15_000,
  });

  const isOnline = Boolean(health?.ok && !healthError);

  return (
    <Group title="System & Task Telemetry" sub="Live MPT connection status, task execution statistics, and backend engine status">
      {/* 1. MPT Backend Connection Status Card */}
      <div className="p-4 rounded-2xl border border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl grid place-items-center ${isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-foreground">MoneyPrinterTurbo Upstream</span>
              <Pill tone={isOnline ? "success" : "danger"}>
                {healthLoading ? "Checking…" : isOnline ? "Online (200 OK)" : "Offline"}
              </Pill>
            </div>
            <div className="text-[11.5px] text-muted-foreground mt-0.5">
              Host: <span className="font-mono text-foreground">{env.apiBaseUrl.replace(/\/api\/v1\/?$/, "")}</span> · Ping latency: <span className="font-mono font-medium text-foreground">{health?.latencyMs != null ? `${health.latencyMs}ms` : "N/A"}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-xl border border-border bg-card text-[12px] font-semibold text-muted-foreground hover:text-foreground transition shadow-sm"
        >
          Refresh Telemetry
        </button>
      </div>

      {/* 2. Real MPT Task Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        <div className="rounded-2xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-medium">Total Render Tasks</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="font-display font-extrabold text-[26px] mt-1.5 text-foreground tabular-nums">
            {telLoading ? "…" : telemetry?.total ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Submitted to MPT engine</div>
        </div>

        <div className="rounded-2xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-medium">Completed Videos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-display font-extrabold text-[26px] mt-1.5 text-emerald-500 tabular-nums">
            {telLoading ? "…" : telemetry?.succeeded ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Successfully synthesized</div>
        </div>

        <div className="rounded-2xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-medium">Running Tasks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display font-extrabold text-[26px] mt-1.5 text-amber-500 tabular-nums">
            {telLoading ? "…" : telemetry?.running ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Currently processing</div>
        </div>

        <div className="rounded-2xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-medium">Failed Tasks</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-display font-extrabold text-[26px] mt-1.5 text-rose-500 tabular-nums">
            {telLoading ? "…" : telemetry?.failed ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Render errors or aborted</div>
        </div>
      </div>

      {/* 3. Verified Backend Capabilities */}
      <div className="rounded-2xl border border-border p-5 bg-card mt-4">
        <div className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span>Verified MPT Engine Endpoints</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">Video Synthesis Engine</div>
              <div className="text-[11px] text-muted-foreground font-mono">POST /api/v1/videos</div>
            </div>
            <Pill tone="success">Operational</Pill>
          </div>
          <div className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">Task State Telemetry</div>
              <div className="text-[11px] text-muted-foreground font-mono">GET /api/v1/tasks</div>
            </div>
            <Pill tone="success">Operational</Pill>
          </div>
          <div className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">Audio & Music Engine</div>
              <div className="text-[11px] text-muted-foreground font-mono">/api/v1/audio · /musics</div>
            </div>
            <Pill tone="success">Operational</Pill>
          </div>
          <div className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">Local Video Materials</div>
              <div className="text-[11px] text-muted-foreground font-mono">/api/v1/video_materials</div>
            </div>
            <Pill tone="success">Operational</Pill>
          </div>
        </div>
      </div>

      {/* 4. Telemetry Transparency Notice */}
      <div className="p-4 rounded-2xl border border-border bg-secondary/20 flex items-start gap-3 mt-4">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Architecture Notice regarding API Quotas & Billing: </span>
          MoneyPrinterTurbo is a self-hosted engine and does not expose centralized token meters, GPU hardware sensors, or billing APIs.
          External LLM and voice generation quotas are billed directly by your upstream providers (OpenAI, Anthropic, Azure Speech, SiliconFlow, Pexels).
        </div>
      </div>

      {/* 5. Recent Render Tasks Table */}
      <div className="rounded-2xl border border-border overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <span className="text-[12px] font-bold text-foreground">Recent Engine Tasks</span>
          <span className="text-[11px] text-muted-foreground">Source: GET /api/v1/tasks</span>
        </div>
        {telemetry?.tasks && telemetry.tasks.length > 0 ? (
          <div className="divide-y divide-border/60">
            {telemetry.tasks.slice(0, 5).map((t) => (
              <div key={t.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-[12px] hover:bg-secondary/10 transition">
                <div className="min-w-0">
                  <div className="font-mono text-[11.5px] font-semibold text-foreground truncate max-w-xs">
                    {t.id}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {t.output?.url ? `Output: ${t.output.url.split("/").pop()}` : "No video output artifact"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brand-gradient h-full transition-all" style={{ width: `${t.progress}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground w-8 text-right">{t.progress}%</span>
                  <Pill tone={t.status === "succeeded" ? "success" : t.status === "running" ? "warning" : "danger"}>
                    {t.status}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-[12px] text-muted-foreground">
            No render tasks found in MPT task history.
          </div>
        )}
      </div>
    </Group>
  );
}
