import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Field, Input, PrimaryButton } from "@/components/app-shell";
import { Mail, Lock, User, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — VideoForge AI" }] }),
  component: () => (
    <AuthShell title="Create your studio" subtitle="Start free. Upgrade when you outgrow it.">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Abid" className="!pl-10" /></div></Field>
          <Field label="Last name"><Input placeholder="Ali" /></Field>
        </div>
        <Field label="Email"><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="you@studio.com" className="!pl-10" /></div></Field>
        <Field label="Password" hint="At least 8 characters with one number"><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" className="!pl-10" /></div></Field>
        <label className="flex items-start gap-2 text-[12px] text-muted-foreground"><input type="checkbox" className="accent-[#227850] mt-0.5" /> I agree to the <a className="text-primary font-semibold">Terms</a> and <a className="text-primary font-semibold">Privacy Policy</a>.</label>
        <PrimaryButton className="w-full !h-12 !text-[14px]">Create account</PrimaryButton>
      </form>
      <div className="mt-5 text-[12px] text-muted-foreground space-y-1.5">
        {["3 free renders per day", "Watermark-free exports", "Cancel anytime"].map(p => (<div key={p} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {p}</div>))}
      </div>
      <div className="text-center text-[12.5px] text-muted-foreground mt-6">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link></div>
    </AuthShell>
  ),
});
