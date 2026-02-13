import { render } from "@opentui/solid";
import { createSignal, onMount, createMemo } from "solid-js";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";
import { streamChat } from "./agent/loop";
import { createProvider } from "./agent/provider";
import {
  initConsoleCapture,
  getCapturedMessages,
  clearCapturedMessages,
} from "./utils/console-capture";
import { TimestampedMessage, DisplayItem } from "./types";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { InputArea } from "./components/InputArea";
import { Footer } from "./components/Footer";

initConsoleCapture();

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
      return a.message.timestamp.getTime() - b.message.timestamp.getTime();
    });
  });

  onMount(async () => {
    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
  });

  const handleSubmit = async () => {
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

  return (
    <box flexDirection="column" height="100%" width="100%">
      <Header config={config} version={version} />
      <MessageList
        displayItems={displayItems}
        config={config}
        isStreaming={isStreaming}
      />
      <InputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isStreaming={isStreaming}
      />
      <Footer />
    </box>
  );
}

render(() => <App />, { exitOnCtrlC: true });
