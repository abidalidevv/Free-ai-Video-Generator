import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Field, Input, PrimaryButton } from "@/components/app-shell";
import { Mail, Lock, Github, Chrome, MonitorSmartphone } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — VideoForge AI" }] }),
  component: () => (
    <AuthShell title="Welcome back" subtitle="Sign in to continue forging videos.">
      <form className="space-y-4">
        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="you@studio.com" className="!pl-10" />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="••••••••" className="!pl-10" />
          </div>
        </Field>
        <div className="flex items-center justify-between text-[12px]">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#227850]" /> Remember me</label>
          <Link to="/forgot-password" className="text-primary font-semibold hover:underline">Forgot password?</Link>
        </div>
        <PrimaryButton className="w-full !h-12 !text-[14px]">Sign in</PrimaryButton>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" /><span className="text-[11px] text-muted-foreground">OR CONTINUE WITH</span><div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="h-11 rounded-xl border border-border text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-secondary"><Chrome className="w-4 h-4" /> Google</button>
        <button className="h-11 rounded-xl border border-border text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-secondary"><Github className="w-4 h-4" /> GitHub</button>
      </div>

      <Link
        to="/"
        className="mt-3 h-11 w-full rounded-xl border border-border text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-secondary"
      >
        <MonitorSmartphone className="w-4 h-4" /> Continue as Local Studio
      </Link>

      <div className="text-center text-[12.5px] text-muted-foreground mt-6">
        Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Create one</Link>
      </div>
    </AuthShell>
  ),
});
