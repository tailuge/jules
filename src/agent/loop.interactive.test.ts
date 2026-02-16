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

    // 3. Done (waiting for input)
    result = await loop.next();
    expect(result.value.type).toBe("done");

    // Inject "Second" AFTER loop is waiting
    userInputQueue.push("Second");

    // 4. Thinking (picked up "Second")
    result = await loop.next();
    expect(result.value.type).toBe("thinking");
    expect(result.value.data.iteration).toBe(1);

    // 5. Text (Second response)
    result = await loop.next();
    expect(result.value.type).toBe("text");
    
    // 6. Done (waiting again)
    result = await loop.next();
    expect(result.value.type).toBe("done");
  });
});
