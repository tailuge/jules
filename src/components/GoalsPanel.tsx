import { box } from "@opentui/solid";
import { For } from "solid-js";
import { Goal } from "../agent/state";

export function GoalsPanel(props: { goals: Goal[] }) {
  return (
    <box flexDirection="column" paddingLeft={1}>
      <For each={props.goals}>
        {(goal) => (
          <text>
            {goal.completed ? "[x]" : "[ ]"} {goal.text}
          </text>
        )}
      </For>
    </box>
  );
}
