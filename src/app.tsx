import { useRenderer, useSelectionHandler } from "@opentui/solid";
import { createSignal, onMount, createMemo, onCleanup } from "solid-js";
import { type ModelMessage } from "ai";
import clipboard from "clipboardy";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";
import { streamChat } from "./agent/loop";
import { createProvider } from "./agent/provider";
import {
  listAvailableModelsForProvider,
  formatAvailableModelsMessage,
} from "./agent/models";
import {
  addCapturedMessage,
  getCapturedMessages,
  clearCapturedMessages,
  restoreRuntimeErrorCapture,
} from "./utils/console-capture";
import { TimestampedMessage, DisplayItem } from "./types";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { InputArea } from "./components/InputArea";
import { Footer } from "./components/Footer";

export interface AppProps {
  skipStartup?: boolean;
}

function toModelMessages(messages: TimestampedMessage[]): ModelMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as ModelMessage[];
}

export function App(props: AppProps = {}) {
  const renderer = useRenderer();
  const [version, setVersion] = createSignal("...");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<TimestampedMessage[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);
  const capturedMessages = getCapturedMessages();
  let lastCopiedSelection = "";

  useSelectionHandler((selection) => {
    const selectedText = selection.getSelectedText();
    if (!selectedText || selectedText === lastCopiedSelection) {
      return;
    }

    lastCopiedSelection = selectedText;
    const copiedToTerminalClipboard =
      renderer.copyToClipboardOSC52(selectedText);

    if (!copiedToTerminalClipboard) {
      clipboard.write(selectedText).catch(() => {});
      return;
    }

    clipboard.write(selectedText).catch(() => {});
  });

  const displayItems = createMemo(() => {
    const msgs = messages();
    const consoleMsgs = capturedMessages();
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
    return sorted;
  });

  onMount(async () => {
    if (props.skipStartup) {
      return;
    }

    const toggleConsoleHandler = (sequence: string) => {
      if (sequence === "`") {
        renderer.console.toggle();
        return true;
      }
      return false;
    };
    renderer.prependInputHandler(toggleConsoleHandler);
    onCleanup(() => {
      renderer.removeInputHandler(toggleConsoleHandler);
      restoreRuntimeErrorCapture();
    });

    const [v, cfg] = await Promise.all([getVersion(), loadConfig()]);
    setVersion(v);
    setConfig(cfg);
    addCapturedMessage(
      "log",
      `Loaded config for ${cfg.model.provider}:${cfg.model.name}`,
    );
  });

  const handleSubmit = async () => {
    const trimmed = inputValue().trim();
    const activeConfig = config();
    if (!trimmed || isStreaming() || !activeConfig) {
      return;
    }

    if (trimmed === "/clear") {
      setMessages([]);
      clearCapturedMessages();
      setInputValue("");
      return;
    }

    if (trimmed === "/exit" || trimmed === "/quit" || trimmed === "/q") {
      renderer.destroy();
      return;
    }

    if (trimmed === "/models") {
      setInputValue("");
      addCapturedMessage(
        "log",
        `Fetching models for provider ${activeConfig.model.provider}`,
      );
      try {
        const models = await listAvailableModelsForProvider(
          activeConfig.model.provider,
        );
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: "/models",
            timestamp: new Date(),
          },
          {
            role: "assistant",
            content: formatAvailableModelsMessage(
              activeConfig.model.provider,
              models,
            ),
            timestamp: new Date(),
          },
        ]);
      } catch (error: any) {
        const message =
          error instanceof Error ? error.message : "Unknown models error";
        addCapturedMessage("error", `Failed to fetch models: ${message}`);
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: "/models",
            timestamp: new Date(),
          },
          {
            role: "assistant",
            content: `Error: ${message}\nSet AI_GATEWAY_API_KEY to use /models.`,
            timestamp: new Date(),
          },
        ]);
      }
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
            "Available commands:\n  /help   - Show this help message\n  /models - List available models for current provider\n  /clear  - Clear the conversation history\n  /exit   - Exit the application\n  /quit   - Exit the application\n  /q      - Exit the application",
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
    const currentMessages = messages();
    const conversationForModel = toModelMessages([
      ...currentMessages,
      userMessage,
    ]);

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "", timestamp: new Date() },
    ]);
    setInputValue("");
    setIsStreaming(true);
    addCapturedMessage(
      "log",
      `Request started with ${activeConfig.model.provider}:${activeConfig.model.name}`,
    );

    try {
      const provider = createProvider(activeConfig.model);
      let hasResponseText = false;
      for await (const chunk of streamChat(
        conversationForModel,
        provider,
        activeConfig.agent.systemPrompt,
      )) {
        if (!chunk) {
          continue;
        }
        hasResponseText = true;
        setMessages((prev) => {
          if (prev.length === 0) {
            return prev;
          }
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          const lastMsg = updated[lastIndex];
          if (lastMsg && lastMsg.role === "assistant") {
            updated[lastIndex] = {
              ...lastMsg,
              content: (lastMsg.content as string) + chunk,
            };
          }
          return updated;
        });
      }
      if (!hasResponseText) {
        addCapturedMessage("warn", "Model returned an empty response.");
      }
      addCapturedMessage("log", "Request completed.");
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Unknown streaming error";
      addCapturedMessage("error", `Request failed: ${message}`);
      setMessages((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          role: "assistant",
          content: `Error: ${message}`,
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
        hideScrollbar={props.skipStartup}
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
