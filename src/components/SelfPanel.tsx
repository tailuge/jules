import { box } from "@opentui/solid";

export function SelfPanel(props: { self: string }) {
  return (
    <box flexDirection="column" paddingLeft={1}>
      <text>{props.self}</text>
    </box>
  );
}
