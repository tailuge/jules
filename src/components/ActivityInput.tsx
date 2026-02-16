import { Accessor, Setter } from "solid-js";

interface ActivityInputProps {
  value: Accessor<string>;
  onInput: Setter<string>;
  onSubmit: () => void;
  focused: Accessor<boolean>;
}

export function ActivityInput(props: ActivityInputProps) {
  return (
    <box 
      backgroundColor="#333333" 
      paddingLeft={1} 
      paddingRight={1}
      height={1}
      width="100%"
    >
      <input
        value={props.value()}
        onInput={props.onInput}
        onSubmit={props.onSubmit as any}
        focused={props.focused()}
        flexGrow={1}
      />
    </box>
  );
}
