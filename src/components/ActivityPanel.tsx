import { box } from "@opentui/solid";
import { For, Accessor, Setter, Show } from "solid-js";
import { ActivityLog } from "../agent/state";
import { ActivityInput } from "./ActivityInput";

interface ActivityPanelProps {
  activity: ActivityLog[];
  inputValue?: Accessor<string>;
  onInput?: Setter<string>;
  onSubmit?: () => void;
  inputFocused?: Accessor<boolean>;
}

export function ActivityPanel(props: ActivityPanelProps) {
  return (
    <box flexDirection="column" height="100%">
      <box flexGrow={1} flexDirection="column" paddingLeft={1} overflowY="scroll">
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
      <Show when={props.inputValue && props.onInput && props.onSubmit}>
        <ActivityInput
          value={props.inputValue!}
          onInput={props.onInput!}
          onSubmit={props.onSubmit!}
          focused={props.inputFocused || (() => false)}
        />
      </Show>
    </box>
  );
}
