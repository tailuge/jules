import { box } from "@opentui/solid";
import { For } from "solid-js";

export function MemoryPanel(props: { memory: string[] }) {
  return (
    <box flexDirection="column" paddingLeft={1}>
      <For each={props.memory}>{(item) => <text>- {item}</text>}</For>
    </box>
  );
}
