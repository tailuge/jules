/**
 * LLM Provider Abstraction Layer
 * Unified interface for multiple LLM vendors
 */

import type { LanguageModel } from "ai";
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
  model: LanguageModel;
  name: string;
  provider: ProviderType;
}

function resolveApiKey(config: ModelConfig): string {
  const apiKey = config.apiKey || process.env[getApiKeyEnv(config.provider)];
  if (!apiKey) {
    throw new Error(
      `API key required for ${config.provider}. Set ${getApiKeyEnv(config.provider)} env var.`,
    );
  }
  return apiKey;
}

export function createProvider(config: ModelConfig): Provider {
  const apiKey = resolveApiKey(config);

  switch (config.provider) {
    case "anthropic": {
      const anthropicModel = anthropic(config.name);
      return {
        model: anthropicModel as unknown as LanguageModel,
        name: config.name,
        provider: "anthropic",
      };
    }

    case "openai": {
      const openaiModel = openai(config.name);
      return {
        model: openaiModel as unknown as LanguageModel,
        name: config.name,
        provider: "openai",
      };
    }

    case "google": {
      const googleModel = google(config.name);
      return {
        model: googleModel as unknown as LanguageModel,
        name: config.name,
        provider: "google",
      };
    }

    case "groq": {
      const groqModel = groq(config.name);
      return {
        model: groqModel as unknown as LanguageModel,
        name: config.name,
        provider: "groq",
      };
    }

    case "mistral": {
      const mistralModel = mistral(config.name);
      return {
        model: mistralModel as unknown as LanguageModel,
        name: config.name,
        provider: "mistral",
      };
    }

    case "custom": {
      if (!config.baseUrl) {
        throw new Error("baseUrl is required for custom provider");
      }
      const customProvider = createOpenAICompatible({
        name: "custom",
        baseURL: config.baseUrl,
        apiKey,
      });
      return {
        model: customProvider(config.name) as unknown as LanguageModel,
        name: config.name,
        provider: "custom",
      };
    }

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

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
