/**
 * Shared building blocks reused by both the API Manager page and the
 * Basic Settings page. Keeping the data + cards in one module means
 * both surfaces always show identical information.
 */
import { SectionCard, Field, Input, Pill, Toggle } from "@/components/app-shell";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export type Api = {
  name: string;
  cat: string;
  status: "connected" | "disconnected";
  quota?: string;
  remaining?: string;
  rt?: string;
  key?: string;
};

export const TTS_APIS: Api[] = [
  { name: "ElevenLabs", cat: "TTS", status: "connected", quota: "100k chars / mo", remaining: "62.4k", rt: "320ms", key: "•••8jL" },
  { name: "Azure Speech", cat: "TTS", status: "connected", quota: "500k chars / mo", remaining: "488k", rt: "248ms", key: "•••aZ2" },
  { name: "OpenAI TTS", cat: "TTS", status: "disconnected", quota: "—", remaining: "—", rt: "—" },
  { name: "Edge TTS", cat: "TTS", status: "connected", quota: "Free", remaining: "—", rt: "180ms" },
];

export const FUTURE_APIS: Api[] = [
  { name: "Runway ML", cat: "Future", status: "disconnected" },
  { name: "Suno (AI Music)", cat: "Future", status: "disconnected" },
  { name: "Topaz Video AI", cat: "Future", status: "disconnected" },
];

export const API_SUMMARY = [
  { l: "Connected", v: "7", tone: "success" as const },
  { l: "Disconnected", v: "5", tone: "default" as const },
  { l: "Avg Response", v: "168ms", tone: "primary" as const },
  { l: "This Month Spend", v: "$24.10", tone: "primary" as const },
];

export function ApiSummaryCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
      {API_SUMMARY.map((s) => (
        <div key={s.l} className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <div className="text-[12px] text-muted-foreground">{s.l}</div>
          <div className="font-display font-extrabold text-[28px] mt-2">{s.v}</div>
        </div>
      ))}
    </div>
  );
}

export function ApiGroupSection({
  title,
  sub,
  items,
}: {
  title: string;
  sub: string;
  items: Api[];
}) {
  return (
    <SectionCard
      title={title}
      subtitle={sub}
      right={
        <Pill tone="primary">
          {items.filter((i) => i.status === "connected").length}/{items.length}
        </Pill>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
        {items.map((api) => (
          <APICard key={api.name} {...api} />
        ))}
      </div>
    </SectionCard>
  );
}

export function APICard(a: Api) {
  const connected = a.status === "connected";
  return (
    <div className="p-4 rounded-2xl border border-border bg-card hover:border-primary/20 transition">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${connected ? "bg-brand-gradient" : "bg-secondary"} grid place-items-center text-white font-display font-extrabold shrink-0`}
        >
          <KeyRound className={`w-4 h-4 ${connected ? "" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-display font-bold text-[14px]">{a.name}</div>
            {connected ? (
              <Pill tone="success">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </Pill>
            ) : (
              <Pill tone="default">
                <AlertCircle className="w-3 h-3" /> Disconnected
              </Pill>
            )}
          </div>
          {a.key && (
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">{a.key}</div>
          )}
        </div>
        <Toggle checked={connected} />
      </div>
      {connected && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2 rounded-lg bg-secondary/50">
              <div className="text-[10px] text-muted-foreground">Quota</div>
              <div className="text-[11.5px] font-bold mt-0.5">{a.quota}</div>
            </div>
            <div className="p-2 rounded-lg bg-secondary/50">
              <div className="text-[10px] text-muted-foreground">Remaining</div>
              <div className="text-[11.5px] font-bold mt-0.5 text-primary">{a.remaining}</div>
            </div>
            <div className="p-2 rounded-lg bg-secondary/50">
              <div className="text-[10px] text-muted-foreground">Response</div>
              <div className="text-[11.5px] font-bold mt-0.5">{a.rt}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Field label="">
              <Input placeholder="API key" defaultValue={a.key} className="!h-9 !text-[12px]" />
            </Field>
            <button className="h-9 px-3 self-end rounded-xl text-[11.5px] font-bold border border-border hover:bg-secondary">
              Rotate
            </button>
          </div>
        </>
      )}
      {!connected && a.cat !== "Future" && (
        <button className="w-full h-9 rounded-xl bg-brand-gradient text-white text-[12px] font-bold shadow-brand">
          Connect
        </button>
      )}
      {a.cat === "Future" && (
        <div className="text-[11px] text-muted-foreground italic">
          Coming soon — sign up for early access.
        </div>
      )}
    </div>
  );
}
