import { render } from "@opentui/solid";
import { createSignal, onMount } from "solid-js";
import { CoreMessage } from "ai";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";
import { streamChat } from "./agent/loop";
import { createProvider } from "./agent/provider";

function App() {
  const [version, setVersion] = createSignal("...");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<CoreMessage[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);

  onMount(async () => {
    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
  });

  const handleSubmit = async (_event: unknown) => {
    const trimmed = inputValue().trim();
    if (!trimmed || isStreaming() || !config()) return;

    const userMessage: CoreMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);

    const assistantIndex = messages().length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const provider = createProvider(config()!.model);
      const generator = streamChat(messages().slice(0, -1), provider);

      for await (const chunk of generator) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[assistantIndex];
          if (lastMsg && lastMsg.role === "assistant") {
            updated[assistantIndex] = {
              ...lastMsg,
              content: (lastMsg.content as string) + chunk,
            };
          }
          return updated;
        });
      }
    } catch (error: any) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: "assistant",
          content: `Error: ${error.message}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
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
          <box flexDirection="column">
            {msg.role === "user" ? (
              <box flexDirection="row">
                <text fg="#888888">{"> "}</text>
                <text fg="#FFFFFF">{msg.content as string}</text>
              </box>
            ) : (
              <box flexDirection="row">
                <text
                  fg={
                    providerColors[config()?.model.provider || "custom"] ||
                    "#00FFFF"
                  }
                >
                  {config()?.model.name}:{" "}
                </text>
                <text fg="#FFFFFF">
                  {(msg.content as string) || (isStreaming() ? "..." : "")}
                </text>
              </box>
            )}
          </box>
        ))}
      </scrollbox>
      <box flexDirection="row" padding={1}>
        <text fg="#888888">{"> "}</text>
        <input
          value={inputValue()}
          onInput={setInputValue}
          onSubmit={handleSubmit as any}
          focused={!isStreaming()}
          flexGrow={1}
        />
        {isStreaming() && <text fg="#888888"> streaming...</text>}
      </box>
    </box>
  );
}

render(() => <App />, { exitOnCtrlC: true });
