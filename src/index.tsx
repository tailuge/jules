import { render } from "@opentui/solid";
import { createSignal, onMount } from "solid-js";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";

function App() {
  const [version, setVersion] = createSignal("...");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<string[]>([]);

  onMount(async () => {
    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
  });

  const handleSubmit = (value: unknown) => {
    const trimmed = String(value).trim() || inputValue().trim();
    if (trimmed) {
      setMessages((prev) => [...prev, trimmed]);
      setInputValue("");
    }
  };

  const providerColors: Record<string, string> = {
    anthropic: "#FF6B6B",
    openai: "#10A37F",
    google: "#4285F4",
    groq: "#F55036",
    mistral: "#FF7000",
    custom: "#9B59B6",
  };

  return (
    <box flexDirection="column" height="100%" width="100%">
      <box flexDirection="row" justifyContent="space-between" padding={1}>
        <box flexDirection="row">
          <ascii_font text="TaiLuGe" color="#FFFF00" font="tiny" />
          {config() && (
            <box flexDirection="row" marginLeft={2}>
              <text fg={providerColors[config()!.model.provider] || "#00FFFF"}>
                {config()!.model.provider}:{config()!.model.name}
              </text>
            </box>
          )}
        </box>
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
