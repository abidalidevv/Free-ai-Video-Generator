import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Field, Input, Select, Toggle, GhostButton, PrimaryButton, Pill } from "@/components/app-shell";
import { User, UserCircle, Sparkles, Receipt, Gauge, Shield, Check, Download, Smartphone, Key, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

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

          {tab === "api-usage" && <Group title="API Usage" sub="This billing period">
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { l: "LLM tokens", v: "7.2M", c: "of 10M", p: 72 },
                { l: "TTS characters", v: "62.4k", c: "of 100k", p: 62 },
                { l: "Stock requests", v: "4.6k", c: "of 5k", p: 92 },
              ].map(s => (
                <div key={s.l} className="rounded-2xl border border-border p-5">
                  <div className="text-[12px] text-muted-foreground">{s.l}</div>
                  <div className="font-display font-extrabold text-[24px] mt-1">{s.v}</div>
                  <div className="text-[11px] text-muted-foreground">{s.c}</div>
                  <div className="h-1.5 mt-3 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-brand-gradient" style={{ width: `${s.p}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border p-5">
              <div className="text-[12px] font-bold mb-3">Daily usage (last 14 days)</div>
              <div className="flex items-end gap-1.5 h-32">
                {[42, 56, 38, 71, 64, 88, 52, 76, 92, 68, 58, 84, 96, 78].map((v, i) => (
                  <div key={i} className="flex-1 bg-brand-gradient rounded-md" style={{ height: `${v}%` }} />
                ))}
              </div>
            </div>
          </Group>}

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
