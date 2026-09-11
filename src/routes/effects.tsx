import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/effects")({
  beforeLoad: () => {
    throw redirect({ to: "/subtitle-studio", search: { tab: "effects" } });
  },
});
