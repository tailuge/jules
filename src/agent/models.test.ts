import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetAvailableModels = mock();

mock.module("ai", () => ({
  gateway: {
    getAvailableModels: mockGetAvailableModels,
  },
}));

import {
  listAvailableModelsForProvider,
  formatAvailableModelsMessage,
} from "./models";

describe("listAvailableModelsForProvider", () => {
  beforeEach(() => {
    mockGetAvailableModels.mockReset();
  });

  test("filters by provider and language model type and sorts by id", async () => {
    mockGetAvailableModels.mockResolvedValue({
      models: [
        {
          id: "openai/gpt-5",
          name: "GPT-5",
          description: null,
          modelType: "language",
        },
        {
          id: "openai/text-embedding-3-large",
          name: "Embedding",
          description: null,
          modelType: "embedding",
        },
        {
          id: "openai/gpt-4o-mini",
          name: "GPT-4o Mini",
          description: "mini",
          modelType: null,
        },
        {
          id: "anthropic/claude-sonnet-4",
          name: "Claude Sonnet 4",
          description: null,
          modelType: "language",
        },
      ],
    });

    const models = await listAvailableModelsForProvider("openai");

    expect(models).toEqual([
      {
        id: "openai/gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "mini",
      },
      {
        id: "openai/gpt-5",
        name: "GPT-5",
        description: null,
      },
    ]);
  });

  test("returns empty list for custom provider without gateway request", async () => {
    const models = await listAvailableModelsForProvider("custom");

    expect(models).toEqual([]);
    expect(mockGetAvailableModels).not.toHaveBeenCalled();
  });

  test("propagates gateway errors", async () => {
    mockGetAvailableModels.mockRejectedValue(new Error("gateway failure"));

    await expect(listAvailableModelsForProvider("openai")).rejects.toThrow(
      "gateway failure",
    );
  });
});

describe("formatAvailableModelsMessage", () => {
  test("formats populated model list", () => {
    const output = formatAvailableModelsMessage("openai", [
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", description: null },
      { id: "openai/gpt-5", name: "GPT-5", description: null },
    ]);

    expect(output).toBe(
      "Available models for openai:\n  - openai/gpt-4o-mini\n  - openai/gpt-5",
    );
  });

  test("formats empty model list", () => {
    const output = formatAvailableModelsMessage("openai", []);

    expect(output).toBe("No models found for openai in AI Gateway catalog.");
  });
});
