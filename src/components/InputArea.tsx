import { Accessor, Setter } from "solid-js";

interface InputAreaProps {
  inputValue: Accessor<string>;
  setInputValue: Setter<string>;
  handleSubmit: (event: any) => void;
  isStreaming: Accessor<boolean>;
}

export function InputArea(props: InputAreaProps) {
  return (
    <box flexDirection="row" padding={1}>
      <text fg="#888888">{"> "}</text>
      <input
        value={props.inputValue()}
        onInput={props.setInputValue}
        onSubmit={props.handleSubmit as any}
        focused={!props.isStreaming()}
        flexGrow={1}
      />
      {props.isStreaming() && <text fg="#888888"> streaming...</text>}
    </box>
  );
}
