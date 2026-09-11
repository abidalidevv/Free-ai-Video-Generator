import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/voices")({
  beforeLoad: () => {
    throw redirect({ to: "/audio-studio", search: { tab: "voices" } });
  },
});
