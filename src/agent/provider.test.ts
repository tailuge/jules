import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createProvider, type ModelConfig } from "./provider";

// Mocking the AI SDK providers
const mockAnthropic = mock(() => ({}));
const mockOpenAI = mock(() => ({}));

mock.module("@ai-sdk/anthropic", () => ({ anthropic: mockAnthropic }));
mock.module("@ai-sdk/openai", () => ({ openai: mockOpenAI }));

describe("provider", () => {
  beforeEach(() => {
    mockAnthropic.mockClear();
    mockOpenAI.mockClear();
  });

  test("creates anthropic provider correctly", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const config: ModelConfig = {
      provider: "anthropic",
      name: "claude-3-sonnet-20240229",
    };
    const provider = createProvider(config);
    expect(provider.provider).toBe("anthropic");
    expect(provider.name).toBe(config.name);
    expect(mockAnthropic).toHaveBeenCalledWith(config.name);
  });

  test("throws error if API key is missing", () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const config: ModelConfig = {
      provider: "openai",
      name: "gpt-4",
    };
    expect(() => createProvider(config)).toThrow(/API key required/);
    process.env.OPENAI_API_KEY = originalKey;
  });
});
