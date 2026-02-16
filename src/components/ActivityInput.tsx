import { Accessor, Setter, Show } from "solid-js";

interface ActivityInputProps {
  value: Accessor<string>;
  onInput: Setter<string>;
  onSubmit: () => void;
  focused: Accessor<boolean>;
  isThinking?: Accessor<boolean>;
}

export function ActivityInput(props: ActivityInputProps) {
  return (
    <box 
      backgroundColor="#333333" 
      paddingLeft={1} 
      paddingRight={1}
      height={1}
      width="100%"
      flexDirection="row"
    >
      <input
        value={props.value()}
        onInput={props.onInput}
        onSubmit={props.onSubmit as any}
        focused={props.focused() && !props.isThinking?.()}
        flexGrow={1}
      />
      <Show when={props.isThinking?.()}>
        <text fg="#00FFFF" bold> [THINKING...] </text>
      </Show>
    </box>
  );
}
