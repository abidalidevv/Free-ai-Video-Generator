import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  PageHeader,
  Field,
  Input,
  Select,
  Toggle,
  Slider,
  GhostButton,
  PrimaryButton,
} from "@/components/app-shell";
import { Save, Zap } from "lucide-react";

export const Route = createFileRoute("/render-settings")({
  head: () => ({ meta: [{ title: "Render Settings — VideoForge AI" }] }),
  component: RenderSettingsPage,
});

function RenderSettingsPage() {
  return (
    <AppShell>
      <PageHeader
        crumb={["General", "Render Settings"]}
        title="Render Settings"
        subtitle="Default render preset, hardware and storage applied to every new video."
        actions={
          <>
            <GhostButton>Discard</GhostButton>
            <PrimaryButton>
              <Save className="w-4 h-4" /> Save Settings
            </PrimaryButton>
          </>
        }
      />

      <div className="max-w-3xl space-y-5">
        <Group title="Rendering" sub="Default render preset">
          <Field label="Encoder">
            <Select>
              <option>H.264 NVENC (GPU)</option>
              <option>H.264 CPU</option>
              <option>HEVC</option>
              <option>AV1</option>
            </Select>
          </Field>
          <Field label="Quality preset">
            <Select>
              <option>Balanced</option>
              <option>Maximum quality</option>
              <option>Fast preview</option>
            </Select>
          </Field>
          <Field label="Bitrate target (Mbps)">
            <Slider value={60} />
          </Field>
          <Row label="Two-pass encoding"><Toggle /></Row>
          <Row label="Hardware acceleration"><Toggle checked /></Row>
          <Row label="Delete temp files after success"><Toggle checked /></Row>
        </Group>

        <Group title="FFmpeg & Encoding" sub="Host execution and encoder preferences">
          <Field label="Encoder preference">
            <Select>
              <option>Auto (Host FFmpeg default)</option>
              <option>Hardware Acceleration (NVENC / QSV if available)</option>
              <option>Software Encoder (libx264)</option>
            </Select>
          </Field>
          <Row label="Allow hardware acceleration in preview"><Toggle checked /></Row>
          <div className="rounded-xl bg-card/50 border border-border/50 p-3 text-[12px] font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" /> Encoding is executed directly by the upstream MPT MoviePy engine.
          </div>
        </Group>

        <Group title="Storage" sub="Project, output and cache folders">
          <Field label="Projects folder"><Input defaultValue="C:\\VideoForge\\Projects" /></Field>
          <Field label="Outputs folder"><Input defaultValue="C:\\VideoForge\\Outputs" /></Field>
          <Field label="Cache folder"><Input defaultValue="C:\\VideoForge\\Cache" /></Field>
          <Field label="Cache size limit (GB)"><Slider value={30} /></Field>
          <div className="flex gap-2 pt-2">
            <GhostButton className="!h-9 !text-[12px]">Clear cache (12.4 GB)</GhostButton>
          </div>
        </Group>

        <Group title="Performance" sub="Worker, memory and concurrency limits for renders">
          <Field label="Worker threads"><Slider value={70} /></Field>
          <Field label="Memory cap (GB)"><Input type="number" defaultValue={16} /></Field>
          <Field label="Concurrent renders">
            <Select><option>1</option><option>2</option><option>3</option></Select>
          </Field>
          <Row label="Background rendering"><Toggle checked /></Row>
          <Row label="Low-power mode when on battery"><Toggle /></Row>
        </Group>
      </div>
    </AppShell>
  );
}

function Group({ title, sub, children }: any) {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="mb-5">
        <h3 className="font-display font-bold text-[18px]">{title}</h3>
        {sub && <p className="text-[12.5px] text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: any) {
  return (
    <div className="flex items-center justify-between py-1.5 border-t border-border/50 first:border-t-0 pt-3 first:pt-0">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
    </div>
  );
}
