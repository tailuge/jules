import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { createSignal, onMount, createMemo, onCleanup } from "solid-js";
import { ModelMessage } from "ai";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";
import { streamChat } from "./agent/loop";
import { createProvider } from "./agent/provider";
import {
  initConsoleCapture,
  getCapturedMessages,
  type CapturedMessage,
} from "./utils/console-capture";
import type { KeyEvent } from "@opentui/core";

initConsoleCapture();

type TimestampedMessage = ModelMessage & {
  timestamp: Date;
};

type DisplayItem =
  | { type: "chat"; message: TimestampedMessage }
  | { type: "console"; message: CapturedMessage };

function App() {
  console.log("App component rendering");
  const renderer = useRenderer();
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
      const timeA = a.message.timestamp.getTime();
      const timeB = b.message.timestamp.getTime();
      return timeA - timeB;
    });
  });

  onMount(async () => {
    console.log("onMount called");
    console.log("renderer available:", !!renderer);
    console.log("keyInput available:", !!renderer?.keyInput);

    renderer.keyInput.on("keypress", (key: KeyEvent) => {
      console.log("keyInput event received:", JSON.stringify(key));
      if (key.name === "enter" || key.name === "return") {
        console.log("Enter key detected via keyInput");
        console.log("inputValue:", inputValue(), "isStreaming:", isStreaming());
        const trimmed = inputValue().trim();
        if (trimmed && !isStreaming() && config()) {
          console.log("Calling handleSubmit from keyInput");
          handleSubmit({});
        } else {
          console.log("keyInput: conditions not met, skipping submit");
        }
      }
    });

    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
    console.log("Config loaded:", cfg);
  });

  const handleSubmit = async (_event: unknown) => {
    console.log("handleSubmit triggered, inputValue:", inputValue());
    const trimmed = inputValue().trim();
    console.log(
      "trimmed:",
      trimmed,
      "isStreaming:",
      isStreaming(),
      "config:",
      config(),
    );
    if (!trimmed || isStreaming() || !config()) {
      console.log("Early return from handleSubmit");
      return;
    }

    const userMessage: TimestampedMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    console.log("User submitted:", trimmed);
    setIsStreaming(true);

    const assistantIndex = messages().length + 1;
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

  useKeyboard((key) => {
    console.log("useKeyboard callback triggered, key:", key);
    if (key.name === "enter") {
      console.log("Enter key detected via useKeyboard");
      console.log("inputValue:", inputValue(), "isStreaming:", isStreaming());
      const trimmed = inputValue().trim();
      if (trimmed && !isStreaming() && config()) {
        console.log("Calling handleSubmit from useKeyboard");
        handleSubmit({});
      } else {
        console.log("useKeyboard: conditions not met, skipping submit");
      }
    }
  });

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
        {displayItems().map((item) => (
          <box flexDirection="column">{renderDisplayItem(item)}</box>
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
