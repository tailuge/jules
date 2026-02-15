import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createPanelState } from "./state";
import { runLoopy } from "./loopy";

// Mocking the agentLoop
const mockAgentLoop = mock(async function* () {
  yield {
    type: "text",
    data: "I will check the files.",
    timestamp: Date.now(),
  };
  yield {
    type: "tool_call",
    data: { name: "ls", args: {} },
    timestamp: Date.now(),
  };
  yield {
    type: "tool_result",
    data: { name: "ls", result: "file1.ts", success: true },
    timestamp: Date.now(),
  };
  yield { type: "done", data: { iterations: 1 }, timestamp: Date.now() };
});

mock.module("./loop", () => ({
  agentLoop: mockAgentLoop,
}));

describe("runLoopy", () => {
  beforeEach(() => {
    mockAgentLoop.mockClear();
  });

  test("populates activity log from loop events", async () => {
    const { state, setState } = createPanelState();
    const mockProvider = {
      model: {} as any,
      name: "test",
      provider: "anthropic" as const,
    };

    await runLoopy("Hello", mockProvider, { state, setState }, {});

    expect(state.activity.length).toBe(3); // text, tool_call, tool_result
    expect(state.activity[0].message).toBe("I will check the files.");
    expect(state.activity[1].message).toContain("ls");
    expect(state.activity[2].message).toContain("file1.ts");
  });
});
