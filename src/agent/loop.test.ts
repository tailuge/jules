import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { agentLoop, type Tool, type LoopEvent } from "./loop";
import type { Provider } from "./provider";
import { z } from "zod";

const mockGenerateText = mock();

mock.module("ai", () => ({
  generateText: mockGenerateText,
  CoreMessage: {},
}));

function createMockProvider(): Provider {
  return {
    model: "mock-model",
    name: "mock-model",
    provider: "anthropic",
  } as any;
}

function createMockTool(executeResult: any = "tool result"): Tool {
  return {
    name: "mock_tool",
    description: "A mock tool for testing",
    parameters: z.object({ input: z.string().optional() }),
    execute: mock(async () => executeResult),
  };
}

async function collectEvents(
  generator: AsyncGenerator<LoopEvent>,
): Promise<LoopEvent[]> {
  const events: LoopEvent[] = [];
  for await (const event of generator) {
    events.push(event);
  }
  return events;
}

describe("agentLoop", () => {
  let mockProvider: Provider;
  let mockTool: Tool;

  beforeEach(() => {
    mockGenerateText.mockClear();
    mockTool = createMockTool("executed");
    mockProvider = createMockProvider();
  });

  afterEach(() => {
    mockGenerateText.mockClear();
  });

  test("yields text response and done event", async () => {
    mockGenerateText.mockResolvedValue({
      text: "Hello, I am the assistant.",
      toolCalls: [],
    });

    const generator = agentLoop("Hello", {
      provider: mockProvider,
      tools: {},
      maxIterations: 5,
    });

    const events = await collectEvents(generator);

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("text");
    expect(events[0].data).toBe("Hello, I am the assistant.");
    expect(events[1].type).toBe("done");
  });

  test("yields tool_call and tool_result events", async () => {
    mockGenerateText
      .mockResolvedValueOnce({
        text: "",
        toolCalls: [{ toolName: "mock_tool", toolCallId: "call_1", args: {} }],
      })
      .mockResolvedValueOnce({
        text: "Done after tool",
        toolCalls: [],
      });

    const generator = agentLoop("Test", {
      provider: mockProvider,
      tools: { mock_tool: mockTool },
      maxIterations: 5,
    });

    const events = await collectEvents(generator);

    expect(events.some((e) => e.type === "tool_call")).toBe(true);
    expect(events.some((e) => e.type === "tool_result")).toBe(true);

    const toolCall = events.find((e) => e.type === "tool_call");
    expect(toolCall?.data.name).toBe("mock_tool");

    const toolResult = events.find((e) => e.type === "tool_result");
    expect(toolResult?.data.success).toBe(true);
  });

  test("calls onToolCall callback", async () => {
    const onToolCall = mock();
    mockGenerateText
      .mockResolvedValueOnce({
        text: "",
        toolCalls: [
          {
            toolName: "mock_tool",
            toolCallId: "call_1",
            args: { input: "test" },
          },
        ],
      })
      .mockResolvedValueOnce({
        text: "Done",
        toolCalls: [],
      });

    const generator = agentLoop("Test", {
      provider: mockProvider,
      tools: { mock_tool: mockTool },
      maxIterations: 5,
      onToolCall,
    });

    await collectEvents(generator);

    expect(onToolCall).toHaveBeenCalledWith("mock_tool", { input: "test" });
  });

  test("calls onStep callback for each iteration", async () => {
    const onStep = mock();
    mockGenerateText
      .mockResolvedValueOnce({
        text: "First",
        toolCalls: [{ toolName: "mock_tool", toolCallId: "1", args: {} }],
      })
      .mockResolvedValueOnce({
        text: "Second",
        toolCalls: [],
      });

    const generator = agentLoop("Test", {
      provider: mockProvider,
      tools: { mock_tool: mockTool },
      maxIterations: 5,
      onStep,
    });

    await collectEvents(generator);

    expect(onStep).toHaveBeenCalledTimes(2);
    expect(onStep).toHaveBeenNthCalledWith(1, 1, 5);
    expect(onStep).toHaveBeenNthCalledWith(2, 2, 5);
  });

  test("yields error event on failure", async () => {
    mockGenerateText.mockRejectedValue(new Error("API error"));

    const generator = agentLoop("Test", {
      provider: mockProvider,
      tools: {},
      maxIterations: 5,
    });

    const events = await collectEvents(generator);

    expect(events.some((e) => e.type === "error")).toBe(true);
  });

  test("stops at maxIterations", async () => {
    mockGenerateText.mockResolvedValue({
      text: "",
      toolCalls: [{ toolName: "mock_tool", toolCallId: "1", args: {} }],
    });

    const generator = agentLoop("Test", {
      provider: mockProvider,
      tools: { mock_tool: mockTool },
      maxIterations: 2,
    });

    const events = await collectEvents(generator);
    const doneEvent = events.find((e) => e.type === "done");

    expect(doneEvent?.data.maxReached).toBe(true);
    expect(doneEvent?.data.iterations).toBe(2);
  });

  test("includes system prompt in messages", async () => {
    const systemPrompt = "You are a helpful assistant.";
    mockGenerateText.mockResolvedValue({
      text: "Response",
      toolCalls: [],
    });

    const generator = agentLoop("Hello", {
      provider: mockProvider,
      tools: {},
      maxIterations: 5,
      systemPrompt,
    });

    await collectEvents(generator);

    expect(mockGenerateText).toHaveBeenCalled();
    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.messages[0]).toEqual({
      role: "system",
      content: systemPrompt,
    });
  });

  test("handles tool execution error gracefully", async () => {
    const failingTool: Tool = {
      name: "failing_tool",
      description: "A tool that fails",
      parameters: z.object({}),
      execute: async () => {
        throw new Error("Tool execution failed");
      },
    };

    mockGenerateText
      .mockResolvedValueOnce({
        text: "",
        toolCalls: [
          { toolName: "failing_tool", toolCallId: "call_1", args: {} },
        ],
      })
      .mockResolvedValueOnce({
        text: "Recovered",
        toolCalls: [],
      });

    const generator = agentLoop("Test", {
      provider: mockProvider,
      tools: { failing_tool: failingTool },
      maxIterations: 5,
    });

    const events = await collectEvents(generator);

    const toolResult = events.find((e) => e.type === "tool_result");
    expect(toolResult?.data.success).toBe(false);
    expect(toolResult?.data.error).toBe("Tool execution failed");
  });
});

describe("LoopEvent", () => {
  test("events have timestamps", async () => {
    const provider = createMockProvider();
    mockGenerateText.mockResolvedValue({
      text: "Response",
      toolCalls: [],
    });

    const generator = agentLoop("Test", {
      provider,
      tools: {},
      maxIterations: 5,
    });

    const events = await collectEvents(generator);

    for (const event of events) {
      expect(event.timestamp).toBeGreaterThan(0);
      expect(typeof event.timestamp).toBe("number");
    }
  });
});
