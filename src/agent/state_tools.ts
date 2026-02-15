import { z } from "zod";
import { type AgentTool } from "./loop";
import { type LoopyContext } from "./loopy";

/**
 * createStatusTools creates a set of tools that allow the agent to update its own panel state.
 */
export function createStatusTools({
  setState,
}: LoopyContext): Record<string, AgentTool> {
  return {
    update_memory: {
      name: "update_memory",
      description: "Add a new item to the agent's persistent memory.",
      parameters: z.object({ item: z.string() }),
      execute: async ({ item }) => {
        setState("memory", (m) => [...m, item]);
        return { success: true, item };
      },
    },
    update_goals: {
      name: "update_goals",
      description: "Set or update the agent's goals.",
      parameters: z.object({
        goals: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
            completed: z.boolean(),
          }),
        ),
      }),
      execute: async ({ goals }) => {
        setState("goals", goals);
        return { success: true, count: goals.length };
      },
    },
    update_self: {
      name: "update_self",
      description: "Update the agent's identity/self-description.",
      parameters: z.object({ identity: z.string() }),
      execute: async ({ identity }) => {
        setState("self", identity);
        return { success: true, identity };
      },
    },
  };
}
