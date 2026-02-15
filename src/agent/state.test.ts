import { describe, test, expect } from "bun:test";
import { createPanelState } from "./state";
import { createRoot } from "solid-js";

describe("panel state", () => {
  test("initializes with empty values", () => {
    createRoot((dispose) => {
      const { state } = createPanelState();
      expect(state.memory).toEqual([]);
      expect(state.goals).toEqual([]);
      expect(state.self).toBe("");
      expect(state.activity).toEqual([]);
      dispose();
    });
  });

  test("updates state correctly", () => {
    createRoot((dispose) => {
      const { state, setState } = createPanelState();
      setState("memory", (m) => [...m, "test memory"]);
      expect(state.memory).toEqual(["test memory"]);

      setState("self", "I am loopy");
      expect(state.self).toBe("I am loopy");
      dispose();
    });
  });
});
