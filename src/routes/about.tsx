import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Pill } from "@/components/app-shell";
import { Wand2, Globe, Github, Linkedin, Heart, Award, Code2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — VideoForge AI" }] }),
  component: () => (
    <AppShell>
      <PageHeader crumb={["General", "About"]} title="About VideoForge" subtitle="Where the project comes from and who built it." />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <div className="relative rounded-3xl bg-brand-gradient-radial p-10 overflow-hidden shadow-brand text-white">
            <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur grid place-items-center mb-5"><Wand2 className="w-7 h-7" strokeWidth={2.4} /></div>
              <h1 className="font-display font-extrabold text-[42px] leading-none tracking-tight">Abid VideoForge AI</h1>
              <p className="text-white/85 text-[15px] mt-4 max-w-xl">A premium AI video studio that turns a sentence into a finished, voiced, captioned, cinematic video — fully local, fully yours.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1.5 rounded-lg bg-white/15 text-[12px] font-bold">v1.0.0</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/15 text-[12px] font-bold">MIT License</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/15 text-[12px] font-bold">Built with Python · TanStack Start</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[18px] mb-4">Credits & Acknowledgements</h3>
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              {[
                ["MoneyPrinterTurbo", "Python pipeline foundation"],
                ["OpenAI · Anthropic · Google", "Large language models"],
                ["ElevenLabs · Azure · Edge TTS", "Voice synthesis"],
                ["Pexels · Pixabay · Coverr", "Stock video providers"],
                ["FFmpeg", "Encoding & muxing"],
                ["Whisper", "Speech-to-text"],
                ["shadcn/ui · TanStack", "UI primitives & routing"],
                ["Lucide", "Icons"],
              ].map(([n, w]) => (
                <div key={n} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50"><div><div className="font-bold">{n}</div><div className="text-[11px] text-muted-foreground">{w}</div></div><Heart className="w-3.5 h-3.5 text-rose-500" fill="currentColor" /></div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[18px] mb-4">License</h3>
            <pre className="text-[11.5px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
{`MIT License · Copyright (c) 2026 Abid Ali

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction…`}
            </pre>
          </div>
        </div>

        <div className="col-span-4 space-y-5">
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient grid place-items-center text-white font-display font-extrabold text-[24px] shadow-brand">AA</div>
              <div>
                <div className="font-display font-extrabold text-[18px]">Abid Ali</div>
                <div className="text-[12px] text-muted-foreground">Creator · Engineer · Designer</div>
                <Pill tone="primary"><Award className="w-3 h-3" /> Founder</Pill>
              </div>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-4">Building tools that turn ideas into video as fast as you can think. Based in 🌍 — shipping globally.</p>
            <div className="mt-5 space-y-2">
              <Social icon={Globe} label="abidalidev.com" href="https://abidalidev.com" />
              <Social icon={Github} label="github.com/abidmmp" href="https://github.com/abidmmp" />
              <Social icon={Linkedin} label="linkedin.com/in/abidalidev" href="https://linkedin.com/in/abidalidev" />
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <Code2 className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-display font-bold text-[15px]">System Information</h3>
            <div className="mt-3 space-y-1.5 text-[12px]">
              {[["App version", "1.0.0"], ["Backend", "MoneyPrinterTurbo 1.4"], ["Platform", "Windows 11 Pro"], ["GPU", "NVIDIA RTX 4090"], ["Python", "3.11.7"], ["Node", "20.11.1"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/50 pb-1.5"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  ),
});

function Social({ icon: Icon, label, href }: any) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition">
      <div className="w-8 h-8 rounded-lg bg-secondary grid place-items-center"><Icon className="w-4 h-4 text-primary" /></div>
      <span className="text-[12.5px] font-semibold flex-1 truncate">{label}</span>
    </a>
  );
}
