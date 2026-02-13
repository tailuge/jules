import { render } from "@opentui/solid";
import { createSignal, onMount } from "solid-js";
import { getVersion } from "./utils/version";

function App() {
  const [version, setVersion] = createSignal("...");
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<string[]>([]);

  onMount(async () => {
    const v = await getVersion();
    setVersion(v);
  });

  const handleSubmit = (value: unknown) => {
    const trimmed = String(value).trim() || inputValue().trim();
    if (trimmed) {
      setMessages((prev) => [...prev, trimmed]);
      setInputValue("");
    }
  };

  return (
    <box flexDirection="column" height="100%" width="100%">
      <box flexDirection="row" justifyContent="space-between" padding={1}>
        <ascii_font text="TaiLuGe" color="#FFFF00" font="tiny" />
        <text fg="#666666">v{version()}</text>
      </box>
      <scrollbox flexGrow={1} padding={1}>
        {messages().map((msg) => (
          <text fg="#FFFFFF">{msg}</text>
        ))}
      </scrollbox>
      <box flexDirection="row" padding={1}>
        <text fg="#888888">{"> "}</text>
        <input
          value={inputValue()}
          onInput={setInputValue}
          onSubmit={handleSubmit as any}
          focused
          flexGrow={1}
        />
      </box>
    </box>
  );
}

render(() => <App />, { exitOnCtrlC: true });
