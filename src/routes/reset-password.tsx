import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Field, Input, PrimaryButton } from "@/components/app-shell";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — VideoForge AI" }] }),
  component: () => (
    <AuthShell title="Set a new password" subtitle="Pick something strong — at least 8 characters.">
      <form className="space-y-4">
        <Field label="New password"><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" className="!pl-10" /></div></Field>
        <Field label="Confirm password"><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" className="!pl-10" /></div></Field>
        <PrimaryButton className="w-full !h-12 !text-[14px]">Update password</PrimaryButton>
      </form>
      <div className="text-center text-[12.5px] text-muted-foreground mt-6"><Link to="/login" className="text-primary font-semibold hover:underline">← Back to sign in</Link></div>
    </AuthShell>
  ),
});
