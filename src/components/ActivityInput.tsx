import { Accessor, Setter, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useKeyboard } from "@opentui/solid";

interface ActivityInputProps {
  value: Accessor<string>;
  onInput: Setter<string>;
  onSubmit: () => void;
  focused: Accessor<boolean>;
  isThinking?: Accessor<boolean>;
}

export function ActivityInput(props: ActivityInputProps) {
  const [history, setHistory] = createSignal<string[]>([]);
  const [historyIndex, setHistoryIndex] = createSignal(-1);
  const [tempInput, setTempInput] = createSignal("");

  const handleSubmit = () => {
    const val = props.value().trim();
    if (val) {
      setHistory((prev) => [...prev, val]);
      setHistoryIndex(-1);
      setTempInput("");
      props.onSubmit();
    }
  };

  useKeyboard((event) => {
    if (!props.focused() || props.isThinking?.()) return;

    if (event.name === "return") {
      if (event.shift) {
        // Shift+Enter -> Newline
        props.onInput(props.value() + "\n");
      } else {
        // Regular Enter -> Submit
        // (Handled by <input onSubmit> but we can also handle it here if needed)
      }
    } else if (event.name === "up") {
      const h = history();
      if (h.length === 0) return;

      if (historyIndex() === -1) {
        setTempInput(props.value());
      }

      const nextIndex = Math.min(historyIndex() + 1, h.length - 1);
      setHistoryIndex(nextIndex);
      props.onInput(h[h.length - 1 - nextIndex]);
    } else if (event.name === "down") {
      const h = history();
      if (historyIndex() === -1) return;

      const nextIndex = historyIndex() - 1;
      setHistoryIndex(nextIndex);

      if (nextIndex === -1) {
        props.onInput(tempInput());
      } else {
        props.onInput(h[h.length - 1 - nextIndex]);
      }
    }
  });

  return (
    <box 
      backgroundColor="#333333" 
      paddingLeft={1} 
      paddingRight={1}
      minHeight={1}
      width="100%"
      flexDirection="row"
    >
      <input
        value={props.value()}
        onInput={props.onInput}
        onSubmit={handleSubmit as any}
        focused={props.focused() && !props.isThinking?.()}
        flexGrow={1}
      />
      <Show when={props.isThinking?.()}>
        <text fg="#00FFFF" bold> [THINKING...] </text>
      </Show>
    </box>
  );
}
