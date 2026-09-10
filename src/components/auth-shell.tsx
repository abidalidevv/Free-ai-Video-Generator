import { Link } from "@tanstack/react-router";
import { Wand2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-12 bg-background">
      <div className="col-span-12 lg:col-span-5 flex flex-col p-10">
        <Link to="/" className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center shadow-brand"><Wand2 className="w-[18px] h-[18px] text-white" strokeWidth={2.5} /></div>
          <div>
            <div className="font-display font-extrabold text-[15px] leading-none">VideoForge</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-1 tracking-wider uppercase">by Abid Ali</div>
          </div>
        </Link>

        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-md">
            <h1 className="font-display font-extrabold text-[32px] leading-tight tracking-tight">{title}</h1>
            <p className="text-[13.5px] text-muted-foreground mt-2 mb-7">{subtitle}</p>
            {children}
          </div>
        </div>

        <div className="text-[11.5px] text-muted-foreground">© 2026 Abid Ali · <a href="https://abidalidev.com" className="hover:text-foreground">abidalidev.com</a></div>
      </div>

      <div className="hidden lg:flex col-span-7 relative overflow-hidden bg-brand-gradient-radial m-3 rounded-3xl shadow-brand">
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" preserveAspectRatio="none">
          <defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        <div className="relative flex flex-col justify-end p-12 text-white">
          <div className="font-display font-extrabold text-[44px] leading-[1.05] tracking-tight max-w-xl">From a single sentence to a finished cinematic video.</div>
          <p className="text-white/80 text-[14px] mt-5 max-w-md leading-relaxed">Script · voice · subtitles · b-roll · render — all in one premium studio, designed for creators who ship.</p>
          <div className="grid grid-cols-3 gap-3 mt-10 max-w-xl">
            {[
              { icon: Sparkles, l: "AI Scripts", s: "GPT-4o · Claude · Gemini" },
              { icon: Zap, l: "GPU Render", s: "Local NVENC pipeline" },
              { icon: ShieldCheck, l: "Yours, locally", s: "Files never leave your PC" },
            ].map(f => (
              <div key={f.l} className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                <f.icon className="w-5 h-5 text-white mb-2" />
                <div className="text-[12.5px] font-bold">{f.l}</div>
                <div className="text-[10.5px] text-white/70 mt-0.5">{f.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
