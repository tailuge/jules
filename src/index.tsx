import { render } from "@opentui/solid";
import { createSignal, onMount, createMemo, Show, For } from "solid-js";
import { ModelMessage } from "ai";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";
import { streamChat } from "./agent/loop";
import { createProvider } from "./agent/provider";
import {
  initConsoleCapture,
  getCapturedMessages,
  clearCapturedMessages,
  type CapturedMessage,
} from "./utils/console-capture";

initConsoleCapture();

type TimestampedMessage = ModelMessage & {
  timestamp: Date;
};

type DisplayItem =
  | { type: "chat"; message: TimestampedMessage }
  | { type: "console"; message: CapturedMessage };

function App() {
  const [version, setVersion] = createSignal("...");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<TimestampedMessage[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);

  const displayItems = createMemo(() => {
    const chatItems: DisplayItem[] = messages().map((msg) => ({
      type: "chat" as const,
      message: msg,
    }));
    const consoleItems: DisplayItem[] = getCapturedMessages()().map((msg) => ({
      type: "console" as const,
      message: msg,
    }));
    return [...chatItems, ...consoleItems].sort((a, b) => {
      const timeA =
        a.type === "chat"
          ? a.message.timestamp.getTime()
          : a.message.timestamp.getTime();
      const timeB =
        b.type === "chat"
          ? b.message.timestamp.getTime()
          : b.message.timestamp.getTime();
      return timeA - timeB;
    });
  });

  onMount(async () => {
    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
  });

  const handleSubmit = async (_event: unknown) => {
    const trimmed = inputValue().trim();
    if (!trimmed || isStreaming() || !config()) return;

    if (trimmed === "/clear") {
      setMessages([]);
      clearCapturedMessages();
      setInputValue("");
      return;
    }

    if (trimmed === "/help") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: "/help",
          timestamp: new Date(),
        },
        {
          role: "assistant",
          content:
            "Available commands:\n  /help  - Show this help message\n  /clear - Clear the conversation history\n  Ctrl+C - Exit the application",
          timestamp: new Date(),
        },
      ]);
      setInputValue("");
      return;
    }

    const userMessage: TimestampedMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);

    const assistantIndex = messages().length;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date() },
    ]);

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
          timestamp: new Date(),
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

  const renderDisplayItem = (item: DisplayItem) => {
    if (item.type === "console") {
      const levelColors = {
        error: "#FF0000",
        warn: "#FFFF00",
        log: "#00FFFF",
      };
      const levelPrefixes = {
        error: "[ERROR]",
        warn: "[WARN]",
        log: "[LOG]",
      };
      return (
        <box flexDirection="row">
          <text fg={levelColors[item.message.level]}>
            {levelPrefixes[item.message.level]}{" "}
          </text>
          <text fg="#FFFFFF">{item.message.message}</text>
        </box>
      );
    }

    const msg = item.message;
    if (msg.role === "user") {
      return (
        <box flexDirection="row">
          <text fg="#888888">{"> "}</text>
          <text fg="#FFFFFF">{msg.content as string}</text>
        </box>
      );
    }

    return (
      <box flexDirection="row">
        <text
          fg={providerColors[config()?.model.provider || "custom"] || "#00FFFF"}
        >
          {config()?.model.name}:{" "}
        </text>
        <text fg="#FFFFFF">
          {(msg.content as string) || (isStreaming() ? "..." : "")}
        </text>
      </box>
    );
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
        <Show
          when={displayItems().length > 0}
          fallback={
            <box
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <text fg="#666666">Welcome to TaiLuGe TUI Agent</text>
              <text fg="#444444" marginTop={1}>
                Type a message to start or /help for commands
              </text>
            </box>
          }
        >
          <For each={displayItems()}>
            {(item) => <box flexDirection="column">{renderDisplayItem(item)}</box>}
          </For>
        </Show>
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
      <box flexDirection="row" paddingX={1} marginBottom={1}>
        <text fg="#444444">Help: </text>
        <text fg="#666666">/help </text>
        <text fg="#444444" marginLeft={2}>
          Clear:{" "}
        </text>
        <text fg="#666666">/clear </text>
        <text fg="#444444" marginLeft={2}>
          Exit:{" "}
        </text>
        <text fg="#666666">Ctrl+C</text>
      </box>
    </box>
  );
}

render(() => <App />, { exitOnCtrlC: true });
