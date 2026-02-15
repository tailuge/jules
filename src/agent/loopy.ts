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
) {
  const loop = agentLoop(prompt, {
    provider,
    tools,
    maxIterations,
  });

  for await (const event of loop) {
    handleLoopEvent(event, context);
  }
}

function handleLoopEvent(event: LoopEvent, { setState }: LoopyContext) {
  switch (event.type) {
    case "text":
      setState("activity", (a) => [
        ...a,
        { timestamp: event.timestamp, type: "thought", message: event.data },
      ]);
      break;
    case "tool_call":
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
      setState("activity", (a) => [
        ...a,
        {
          timestamp: event.timestamp,
          type: "error",
          message: event.data.message,
        },
      ]);
      break;
  }
}
