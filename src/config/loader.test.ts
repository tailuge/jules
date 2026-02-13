import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { configSchema, defaultConfig, type Config } from "./schema";

describe("configSchema", () => {
  test("validates complete config", () => {
    const validConfig: Config = {
      model: {
        provider: "anthropic",
        name: "claude-sonnet-4-20250514",
      },
      agent: {
        maxIterations: 10,
        temperature: 0.7,
      },
      tools: {
        enabled: ["shell"],
        shell: {
          sandbox: true,
        },
      },
      tui: {
        theme: "dark",
        showTokenCount: true,
        showToolCalls: true,
      },
    };

    const result = configSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  test("validates all provider types", () => {
    const providers = [
      "anthropic",
      "openai",
      "google",
      "groq",
      "mistral",
      "custom",
    ];

    for (const provider of providers) {
      const config = {
        model: {
          provider,
          name: "test-model",
        },
        agent: {
          maxIterations: 10,
        },
        tools: {
          enabled: [],
        },
        tui: {
          theme: "dark",
        },
      };

      const result = configSchema.safeParse(config);
      expect(result.success).toBe(true);
    }
  });

  test("rejects invalid provider", () => {
    const config = {
      model: {
        provider: "invalid_provider",
        name: "test-model",
      },
      agent: {
        maxIterations: 10,
      },
      tools: {
        enabled: [],
      },
      tui: {
        theme: "dark",
      },
    };

    const result = configSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  test("applies defaults for optional fields", () => {
    const minimalConfig = {
      model: {
        provider: "anthropic",
        name: "claude-sonnet-4-20250514",
      },
      agent: {},
      tools: {},
      tui: {},
    };

    const result = configSchema.safeParse(minimalConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agent.maxIterations).toBe(10);
      expect(result.data.agent.temperature).toBe(0.7);
      expect(result.data.tui.theme).toBe("dark");
    }
  });

  test("validates temperature range", () => {
    const configWithHighTemp = {
      model: { provider: "anthropic", name: "test" },
      agent: { temperature: 3 },
      tools: {},
      tui: {},
    };

    const result = configSchema.safeParse(configWithHighTemp);
    expect(result.success).toBe(false);
  });

  test("validates theme values", () => {
    const lightTheme = {
      model: { provider: "anthropic", name: "test" },
      agent: {},
      tools: {},
      tui: { theme: "light" },
    };

    const result = configSchema.safeParse(lightTheme);
    expect(result.success).toBe(true);

    const invalidTheme = {
      model: { provider: "anthropic", name: "test" },
      agent: {},
      tools: {},
      tui: { theme: "blue" },
    };

    const invalidResult = configSchema.safeParse(invalidTheme);
    expect(invalidResult.success).toBe(false);
  });
});

describe("defaultConfig", () => {
  test("has all required fields", () => {
    expect(defaultConfig.model).toBeDefined();
    expect(defaultConfig.model.provider).toBeDefined();
    expect(defaultConfig.model.name).toBeDefined();
    expect(defaultConfig.agent).toBeDefined();
    expect(defaultConfig.tools).toBeDefined();
    expect(defaultConfig.tui).toBeDefined();
  });

  test("is valid according to schema", () => {
    const result = configSchema.safeParse(defaultConfig);
    expect(result.success).toBe(true);
  });

  test("has sensible defaults", () => {
    expect(defaultConfig.agent.maxIterations).toBeGreaterThan(0);
    expect(defaultConfig.agent.maxIterations).toBeLessThanOrEqual(100);
    expect(defaultConfig.tools.enabled.length).toBeGreaterThan(0);
    expect(defaultConfig.tools.shell?.sandbox).toBe(true);
  });
});
