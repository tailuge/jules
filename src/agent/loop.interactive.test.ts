import { describe, test, expect, mock } from "bun:test";
import { agentLoop } from "./loop";

const mockGenerateText = mock(async () => ({
  text: "Response",
  toolCalls: [],
  toolResults: [],
  finishReason: "stop",
  usage: { promptTokens: 10, completionTokens: 10 },
}));

mock.module("ai", () => ({
  generateText: mockGenerateText,
}));

describe("agentLoop interactive", () => {
  test("should pick up messages from userInputQueue and yield thinking", async () => {
    const mockProvider = {
      model: {} as any,
      name: "test",
      provider: "anthropic" as const,
    };

    const userInputQueue: string[] = [];
    const config = {
      provider: mockProvider,
      tools: {},
      maxIterations: 5,
      userInputQueue,
    };

    const loop = agentLoop("First", config as any);
    
    // 1. Thinking
    let result = await loop.next();
    expect(result.value.type).toBe("thinking");

    // 2. Text (First response)
    result = await loop.next();
    expect(result.value.type).toBe("text");

    // Inject "Second" AFTER first response
    userInputQueue.push("Second");

    // 3. Thinking (picked up "Second")
    result = await loop.next();
    expect(result.value.type).toBe("thinking");
    expect(result.value.data.iteration).toBe(1); // It reset iteration to 1

    // 4. Text (Second response)
    result = await loop.next();
    expect(result.value.type).toBe("text");
    
    // Should be done now
    result = await loop.next();
    expect(result.value.type).toBe("done");
  });
});
