/**
 * Configuration Loader
 * Load and merge config from multiple sources
 */

import { homedir } from 'os';
import { join } from 'path';
import { configSchema, defaultConfig, type Config } from './schema';

const CONFIG_FILE_NAME = 'config.json';
const CONFIG_DIRS = [
  '.tui-agent',
  '.config/tui-agent',
];

/**
 * Find config file in standard locations
 */
async function findConfigFile(): Promise<string | null> {
  const home = homedir();

  for (const dir of CONFIG_DIRS) {
    const configPath = join(home, dir, CONFIG_FILE_NAME);
    const file = Bun.file(configPath);
    if (await file.exists()) {
      return configPath;
    }
  }

  return null;
}

/**
 * Load configuration from file
 */
async function loadConfigFile(path: string): Promise<Partial<Config> | null> {
  try {
    const file = Bun.file(path);
    const content = await file.text();
    const json = JSON.parse(content);
    return json;
  } catch (error) {
    console.warn(`Warning: Failed to load config from ${path}`);
    return null;
  }
}

/**
 * Apply environment variable overrides
 */
function applyEnvOverrides(config: Config): Config {
  const envMappings: Record<string, (value: string) => Partial<Config>> = {
    'TUI_AGENT_PROVIDER': (v) => ({ model: { ...config.model, provider: v as any } }),
    'TUI_AGENT_MODEL': (v) => ({ model: { ...config.model, name: v } }),
    'TUI_AGENT_MAX_ITERATIONS': (v) => ({ agent: { ...config.agent, maxIterations: parseInt(v) } }),
  };

  let result = config;

  for (const [envKey, apply] of Object.entries(envMappings)) {
    const value = process.env[envKey];
    if (value) {
      result = { ...result, ...apply(value) } as Config;
    }
  }

  // API keys from environment
  const apiKeys: Record<string, string> = {
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    openai: process.env.OPENAI_API_KEY || '',
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    mistral: process.env.MISTRAL_API_KEY || '',
    custom: process.env.CUSTOM_API_KEY || '',
  };

  if (apiKeys[config.model.provider] && !config.model.apiKey) {
    result.model.apiKey = apiKeys[config.model.provider];
  }

  return result;
}

/**
 * Load and merge configuration
 */
export async function loadConfig(): Promise<Config> {
  let config = defaultConfig;

  // Try to load from file
  const configPath = await findConfigFile();
  if (configPath) {
    const fileConfig = await loadConfigFile(configPath);
    if (fileConfig) {
      config = { ...config, ...fileConfig };
    }
  }

  // Apply environment overrides
  config = applyEnvOverrides(config);

  // Validate
  const parsed = configSchema.safeParse(config);
  if (!parsed.success) {
    console.error('Config validation errors:', parsed.error.issues);
    throw new Error('Invalid configuration');
  }

  return parsed.data;
}

/**
 * Create a sample config file
 */
export async function createSampleConfig(): Promise<void> {
  const home = homedir();
  const configDir = join(home, CONFIG_DIRS[0]);
  const configPath = join(configDir, CONFIG_FILE_NAME);

  // Create directory
  await Bun.write(configPath, JSON.stringify(defaultConfig, null, 2));

  console.log(`Created sample config at: ${configPath}`);
}
