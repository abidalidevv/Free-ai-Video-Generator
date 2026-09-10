import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionCard, Field, Select, Toggle, Pill, GhostButton, PrimaryButton, Input } from "@/components/app-shell";
import { Languages as LangIcon, Globe2, Check, Search } from "lucide-react";

export const Route = createFileRoute("/languages")({
  head: () => ({ meta: [{ title: "Languages — VideoForge AI" }] }),
  component: () => (
    <AppShell>
      <PageHeader
        crumb={["General", "Languages"]}
        title="Languages & Localization"
        subtitle="Choose interface language, translation engine and the languages you create in."
        actions={<><GhostButton>Reset</GhostButton><PrimaryButton>Save Changes</PrimaryButton></>}
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <SectionCard title="Interface Language">
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Field label="App language"><Select><option>English (United States)</option><option>Español</option><option>Français</option><option>Deutsch</option><option>العربية</option><option>日本語</option><option>中文</option></Select></Field>
              <Field label="Date / Number format"><Select><option>US — MM/DD/YYYY</option><option>EU — DD/MM/YYYY</option><option>ISO — YYYY-MM-DD</option></Select></Field>
            </div>
          </SectionCard>

          <SectionCard title="Translation Engine" subtitle="Used for subtitle auto-translation and multi-language exports">
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Field label="Provider"><Select><option>DeepL</option><option>Google Translate</option><option>OpenAI GPT-4o</option><option>Azure Translator</option></Select></Field>
              <Field label="Quality"><Select><option>Premium</option><option>Standard</option></Select></Field>
            </div>
            <div className="space-y-3 mt-4">
              <Row label="Auto-translate generated subtitles"><Toggle checked /></Row>
              <Row label="Preserve speaker tone"><Toggle checked /></Row>
              <Row label="Use formal address (where applicable)"><Toggle /></Row>
            </div>
          </SectionCard>

          <SectionCard title="Active Creation Languages" subtitle="Languages enabled in script and voice generation">
            <div className="relative mb-4 pt-4">
              <Search className="absolute left-3 top-[34px] w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search 80+ languages" className="!h-9 !pl-9 !text-[12px]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["English (US)", true], ["English (UK)", true], ["Spanish", true], ["French", false],
                ["German", false], ["Arabic", true], ["Hindi", false], ["Japanese", false],
                ["Chinese (Simplified)", false], ["Portuguese (BR)", false], ["Italian", false], ["Korean", false],
              ].map(([l, on]) => (
                <label key={l as string} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border cursor-pointer hover:border-primary/30">
                  <input type="checkbox" defaultChecked={on as boolean} className="accent-[#227850] w-4 h-4" />
                  <span className="text-[12.5px] font-medium flex-1">{l}</span>
                  {on && <Check className="w-3.5 h-3.5 text-primary" />}
                </label>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="col-span-4 space-y-5">
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <Globe2 className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-bold text-[16px]">80+ languages</h3>
            <p className="text-[12px] text-muted-foreground mt-1">Voice, subtitles and UI — all localized.</p>
            <div className="mt-4 space-y-2">
              {[
                { l: "English", p: 100, c: "1.2B speakers" },
                { l: "Spanish", p: 100, c: "560M" },
                { l: "Chinese", p: 95, c: "1.1B" },
                { l: "Arabic", p: 92, c: "420M" },
                { l: "Hindi", p: 88, c: "600M" },
              ].map(x => (
                <div key={x.l}>
                  <div className="flex justify-between text-[11.5px] mb-1"><span className="font-semibold">{x.l}</span><span className="text-muted-foreground">{x.c}</span></div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-brand-gradient" style={{ width: `${x.p}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-brand-gradient-radial p-6 text-white shadow-brand">
            <LangIcon className="w-7 h-7 mb-3" />
            <h3 className="font-display font-bold text-[16px]">Auto-detect script language</h3>
            <p className="text-[12px] text-white/80 mt-1">Pipeline detects input language and picks the matching voice automatically.</p>
            <Row label=""><span className="text-[12px] text-white/85">Enabled</span><Toggle checked /></Row>
          </div>
        </div>
      </div>
    </AppShell>
  ),
});

function Row({ label, children }: any) {
  return <div className="flex items-center justify-between gap-3 py-1.5"><span className="text-[12.5px] font-medium">{label}</span><div className="flex items-center gap-2">{children}</div></div>;
}
