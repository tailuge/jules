import { describe, test, expect } from "bun:test";
import { createPanelState } from "./state";
import { createStatusTools } from "./state_tools";
import { createRoot } from "solid-js";

describe("status tools", () => {
  test("update_memory adds item to memory state", async () => {
    await createRoot(async (dispose) => {
      const { state, setState } = createPanelState();
      const tools = createStatusTools({ state, setState });

      await tools.update_memory.execute({ item: "remember this" });
      expect(state.memory).toEqual(["remember this"]);
      dispose();
    });
  });

  test("update_self updates self state", async () => {
    await createRoot(async (dispose) => {
      const { state, setState } = createPanelState();
      const tools = createStatusTools({ state, setState });

      await tools.update_self.execute({ identity: "I am loopy" });
      expect(state.self).toBe("I am loopy");
      dispose();
    });
  });
});
