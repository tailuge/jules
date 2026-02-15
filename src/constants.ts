export const providerColors: Record<string, string> = {
  anthropic: "#FF6B6B",
  openai: "#10A37F",
  google: "#4285F4",
  groq: "#F55036",
  mistral: "#FF7000",
  custom: "#9B59B6",
};

export const SHELL_TOOL = {
  DEFAULT_TIMEOUT_MS: 30000,
  MAX_BUFFER_BYTES: 1024 * 1024,
} as const;
