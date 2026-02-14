import { render, useRenderer } from "@opentui/solid";
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

console.log("TOP OF FILE - before initConsoleCapture");
initConsoleCapture();
console.log("TOP OF FILE - after initConsoleCapture");

function App() {
  const renderer = useRenderer();
  const [version, setVersion] = createSignal("...");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<TimestampedMessage[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);

  console.log("App component created");

  const displayItems = createMemo(() => {
    const msgs = messages();
    const consoleMsgs = getCapturedMessages()();
    console.log("displayItems recomputed - chat:", msgs.length, "console:", consoleMsgs.length);

    const chatItems: DisplayItem[] = msgs.map((msg) => ({
      type: "chat" as const,
      message: msg,
    }));
    const consoleItems: DisplayItem[] = consoleMsgs.map((msg) => ({
      type: "console" as const,
      message: msg,
    }));
    const sorted = [...chatItems, ...consoleItems].sort((a, b) => {
      return a.message.timestamp.getTime() - b.message.timestamp.getTime();
    });
    console.log("displayItems sorted, total:", sorted.length);
    return sorted;
  });

  onMount(async () => {
    console.log("onMount - loading config...");
    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
    console.log("onMount - config loaded:", cfg?.model.name);
  });

  const handleSubmit = async () => {
    console.log("handleSubmit called, inputValue:", inputValue());
    const trimmed = inputValue().trim();
    if (!trimmed || isStreaming() || !config()) {
      console.log("handleSubmit early return - trimmed:", !!trimmed, "streaming:", isStreaming(), "config:", !!config());
      return;
    }

    if (trimmed === "/clear") {
      console.log("handleSubmit - /clear command");
      setMessages([]);
      clearCapturedMessages();
      setInputValue("");
      return;
    }

    if (trimmed === "/help") {
      console.log("handleSubmit - /help command");
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

    console.log("handleSubmit - sending message:", trimmed);
    const userMessage: TimestampedMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);

    const assistantIndex = messages().length;
    console.log("handleSubmit - assistantIndex:", assistantIndex);
    
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const provider = createProvider(config()!.model);
      console.log("handleSubmit - calling streamChat...");
      const generator = streamChat(messages().slice(0, -1), provider);

      let chunkCount = 0;
      for await (const chunk of generator) {
        chunkCount++;
        console.log("handleSubmit - chunk", chunkCount, ":", chunk.substring(0, 30));
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
      console.log("handleSubmit - streaming complete, chunks:", chunkCount);
    } catch (error: any) {
      console.log("handleSubmit - error:", error.message);
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

console.log("Before render() call");
render(() => <App />, { exitOnCtrlC: true });
console.log("After render() call");
