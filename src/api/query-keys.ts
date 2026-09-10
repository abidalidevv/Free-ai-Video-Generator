/**
 * Centralized TanStack Query keys so invalidations stay symmetric.
 */

export const queryKeys = {
  health: ["health"] as const,
  systemStatus: ["system", "status"] as const,
  encoders: ["system", "encoders"] as const,

  config: ["config"] as const,
  providers: ["providers"] as const,
  providerModels: (id: string) => ["providers", id, "models"] as const,

  voices: ["voices"] as const,
  fonts: ["fonts"] as const,
  bgm: ["bgm"] as const,
  subtitleTemplates: ["subtitle", "templates"] as const,

  tasks: ["tasks"] as const,
  task: (id: string) => ["tasks", id] as const,

  outputs: ["outputs"] as const,
  output: (id: string) => ["outputs", id] as const,

  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,

  logs: ["logs"] as const,
};
