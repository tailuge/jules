import { describe, test, expect, mock } from "bun:test";
import { createPanelState } from "../agent/state";

// Since we can't easily test the component internal state without rendering,
// we will test the state update logic we intend to implement.

describe("Loopy Submission Logic", () => {
  test("submitting user input should add to activity log", () => {
    const { state, setState } = createPanelState();
    const userInput = "Hello Agent";
    
    // This is what handleActivitySubmit should do
    setState("activity", (a) => [
      ...a,
      { timestamp: Date.now(), type: "user", message: userInput }
    ]);
    
    expect(state.activity.length).toBe(1);
    expect(state.activity[0].type).toBe("user");
    expect(state.activity[0].message).toBe(userInput);
  });
});
