/**
 * LLM Provider Abstraction Layer
 * Unified interface for multiple LLM vendors
 */

import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { mistral } from "@ai-sdk/mistral";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export type ProviderType =
  | "anthropic"
  | "openai"
  | "google"
  | "groq"
  | "mistral"
  | "custom";

export interface ModelConfig {
  provider: ProviderType;
  name: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface Provider {
  model: any;
  name: string;
  provider: ProviderType;
}

/**
 * Create a model instance based on configuration
 */
export function createProvider(config: ModelConfig): Provider {
  switch (config.provider) {
    case "anthropic":
      return {
        model: anthropic(config.name),
        name: config.name,
        provider: "anthropic",
      };

    case "openai":
      return {
        model: openai(config.name),
        name: config.name,
        provider: "openai",
      };

    case "google":
      return {
        model: google(config.name),
        name: config.name,
        provider: "google",
      };

    case "groq":
      return {
        model: groq(config.name),
        name: config.name,
        provider: "groq",
      };

    case "mistral":
      return {
        model: mistral(config.name),
        name: config.name,
        provider: "mistral",
      };

    case "custom":
      if (!config.baseUrl) {
        throw new Error("baseUrl is required for custom provider");
      }
      const customProvider = createOpenAICompatible({
        name: "custom",
        baseURL: config.baseUrl,
        apiKey: config.apiKey,
      });
      return {
        model: customProvider(config.name),
        name: config.name,
        provider: "custom",
      };

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Get default model for each provider
 */
export function getDefaultModel(provider: ProviderType): string {
  const defaults: Record<ProviderType, string> = {
    anthropic: "claude-sonnet-4-20250514",
    openai: "gpt-4o",
    google: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    mistral: "mistral-large-latest",
    custom: "default",
  };
  return defaults[provider];
}

/**
 * Get API key environment variable for each provider
 */
export function getApiKeyEnv(provider: ProviderType): string {
  const envVars: Record<ProviderType, string> = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    google: "GOOGLE_GENERATIVE_AI_API_KEY",
    groq: "GROQ_API_KEY",
    mistral: "MISTRAL_API_KEY",
    custom: "CUSTOM_API_KEY",
  };
  return envVars[provider];
}
