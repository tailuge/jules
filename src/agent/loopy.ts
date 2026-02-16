import { agentLoop, type LoopEvent, type AgentTool } from "./loop";
import { type Provider } from "./provider";
import { type PanelState } from "./state";
import { SetStoreFunction } from "solid-js/store";

export interface LoopyContext {
  state: PanelState;
  setState: SetStoreFunction<PanelState>;
}

/**
 * runLoopy starts the agentic loop and connects its events to the TUI panel state.
 */
export async function runLoopy(
  prompt: string,
  provider: Provider,
  context: LoopyContext,
  tools: Record<string, AgentTool>,
  maxIterations: number = 10,
  userInputQueue: string[] = [],
) {
  context.setState("activity", (a) => [
    ...a,
    { timestamp: Date.now(), type: "info", message: "Agent loop initialized and running." },
  ]);
  const loop = agentLoop(prompt, {
    provider,
    tools,
    maxIterations,
    userInputQueue,
  });

  for await (const event of loop) {
    handleLoopEvent(event, context);
  }
}

function handleLoopEvent(event: LoopEvent, { setState }: LoopyContext) {
  console.log(`[LoopEvent] ${event.type}`, event.data);
  switch (event.type) {
    case "thinking":
      setState("isThinking", true);
      break;
    case "text":
      setState("isThinking", false);
      setState("activity", (a) => [
        ...a,
        { timestamp: event.timestamp, type: "thought", message: event.data },
      ]);
      break;
    case "tool_call":
      setState("isThinking", false);
      setState("activity", (a) => [
        ...a,
        {
          timestamp: event.timestamp,
          type: "tool",
          message: `Calling ${event.data.name}(${JSON.stringify(event.data.args)})`,
        },
      ]);
      break;
    case "tool_result":
      setState("activity", (a) => [
        ...a,
        {
          timestamp: event.timestamp,
          type: "info",
          message: event.data.success
            ? `Tool result: ${JSON.stringify(event.data.result)}`
            : `Tool error: ${event.data.error}`,
        },
      ]);
      break;
    case "error":
      setState("isThinking", false);
      setState("activity", (a) => [
        ...a,
        {
          timestamp: event.timestamp,
          type: "error",
          message: event.data.message,
        },
      ]);
      break;
    case "done":
      setState("isThinking", false);
      setState("activity", (a) => [
        ...a,
        {
          timestamp: event.timestamp,
          type: "info",
          message: event.data.maxReached ? "Loop reached max iterations." : "Loop idle, waiting for input...",
        },
      ]);
      break;
  }
}
