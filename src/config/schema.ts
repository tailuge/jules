/**
 * Configuration Schema
 * Zod schema for config validation
 */

import { z } from 'zod';

export const configSchema = z.object({
  model: z.object({
    provider: z.enum(['anthropic', 'openai', 'google', 'groq', 'mistral', 'custom']),
    name: z.string(),
    apiKey: z.string().optional(),
    baseUrl: z.string().optional(),
  }),

  agent: z.object({
    maxIterations: z.number().default(10),
    systemPrompt: z.string().optional(),
    temperature: z.number().min(0).max(2).default(0.7),
  }),

  tools: z.object({
    enabled: z.array(z.string()).default(['shell', 'read_file', 'write_file', 'list_dir']),
    shell: z.object({
      allowedCommands: z.array(z.string()).optional(),
      sandbox: z.boolean().default(true),
    }).optional(),
  }),

  tui: z.object({
    theme: z.enum(['dark', 'light']).default('dark'),
    showTokenCount: z.boolean().default(true),
    showToolCalls: z.boolean().default(true),
  }),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Default configuration
 */
export const defaultConfig: Config = {
  model: {
    provider: 'anthropic',
    name: 'claude-sonnet-4-20250514',
  },
  agent: {
    maxIterations: 10,
    temperature: 0.7,
  },
  tools: {
    enabled: ['shell', 'read_file', 'write_file', 'list_dir'],
    shell: {
      sandbox: true,
    },
  },
  tui: {
    theme: 'dark',
    showTokenCount: true,
    showToolCalls: true,
  },
};
