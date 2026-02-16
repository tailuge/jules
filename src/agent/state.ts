import { createStore } from "solid-js/store";

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface ActivityLog {
  timestamp: number;
  type: "info" | "tool" | "thought" | "error" | "user";
  message: string;
}

export interface PanelState {
  memory: string[];
  goals: Goal[];
  self: string;
  activity: ActivityLog[];
  isThinking: boolean;
}

/**
 * createPanelState initializes the reactive store for the four loopy panels.
 */
export function createPanelState() {
  const [state, setState] = createStore<PanelState>({
    memory: [],
    goals: [],
    self: "",
    activity: [],
    isThinking: false,
  });

  return { state, setState };
}
