import { box } from "@opentui/solid";
import { For } from "solid-js";
import { ActivityLog } from "../agent/state";

export function ActivityPanel(props: { activity: ActivityLog[] }) {
  return (
    <box flexDirection="column" paddingLeft={1}>
      <For each={props.activity}>
        {(log) => {
          const color =
            log.type === "error"
              ? "#FF0000"
              : log.type === "tool"
                ? "#00FF00"
                : log.type === "thought"
                  ? "#AAAAAA"
                  : "#FFFFFF";
          return <text fg={color}>{log.message}</text>;
        }}
      </For>
    </box>
  );
}
