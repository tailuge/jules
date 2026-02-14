import { useRenderer, useSelectionHandler } from "@opentui/solid";
import { createSignal, onMount, createMemo, onCleanup, Show } from "solid-js";
import { type ModelMessage } from "ai";
import clipboard from "clipboardy";
import { getVersion } from "./utils/version";
import { loadConfig } from "./config/loader";
import type { Config } from "./config/schema";
import {
  createSessionFile,
  listSessionFiles,
  type SessionFile,
} from "./utils/session";
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
import { SessionSelector } from "./components/SessionSelector";

const CONTEXT_FILES = ["soul.md", "memories.md"];

async function loadContextFiles(): Promise<string> {
  const contexts: string[] = [];
  for (const filename of CONTEXT_FILES) {
    try {
      const file = Bun.file(filename);
      const exists = await file.exists();
      if (exists) {
        const content = await file.text();
        if (content.trim()) {
          contexts.push(`\n\n=== ${filename} ===\n${content}`);
        }
      }
    } catch {
      // File doesn't exist, skip
    }
  }
  return contexts.join("");
}

export interface AppProps {
  skipStartup?: boolean;
}

const COMMAND_ALIASES: Record<string, string> = {
  "/sessions": "/sessions",
  "/s": "/sessions",
  "/models": "/models",
  "/m": "/models",
  "/clear": "/clear",
  "/c": "/clear",
  "/help": "/help",
  "/h": "/help",
  "/exit": "/exit",
  "/ex": "/exit",
  "/e": "/exit",
  "/quit": "/quit",
  "/q": "/quit",
};

function resolveCommand(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  return COMMAND_ALIASES[normalized] || null;
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
  const [sessionFilePath, setSessionFilePath] = createSignal<string | null>(
    null,
  );
  const [contextFiles, setContextFiles] = createSignal("");
  const [inputValue, setInputValue] = createSignal("");
  const [messages, setMessages] = createSignal<TimestampedMessage[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [inputFocused, setInputFocused] = createSignal(true);
  const [sessionSelectorOpen, setSessionSelectorOpen] = createSignal(false);
  const [sessions, setSessions] = createSignal<SessionFile[]>([]);
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

    const [v, cfg, sessionPath, context] = await Promise.all([
      getVersion(),
      loadConfig(),
      createSessionFile(),
      loadContextFiles(),
    ]);
    setVersion(v);
    setConfig(cfg);
    setSessionFilePath(sessionPath);
    setContextFiles(context);
    if (context) {
      addCapturedMessage(
        "log",
        `Loaded context files: ${CONTEXT_FILES.join(", ")}`,
      );
    }
    addCapturedMessage(
      "log",
      `Loaded config for ${cfg.model.provider}:${cfg.model.name}`,
    );
    addCapturedMessage("log", `Created session file: ${sessionPath}`);
  });

  const handleSubmit = async () => {
    const trimmed = inputValue().trim();
    const activeConfig = config();
    if (!trimmed || isStreaming() || !activeConfig) {
      return;
    }

    const resolved = resolveCommand(trimmed);

    if (resolved === "/clear") {
      setMessages([]);
      clearCapturedMessages();
      setInputValue("");
      return;
    }

    if (resolved === "/exit" || resolved === "/quit" || resolved === "/q") {
      renderer.destroy();
      return;
    }

    if (resolved === "/models") {
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

    if (resolved === "/help") {
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
            "Available commands:\n  /help     - Show this help message\n  /sessions - View past session logs\n  /models   - List available models for current provider\n  /clear    - Clear the conversation history\n  /exit     - Exit the application\n  /quit     - Exit the application\n  /q        - Exit the application\n\nShortcuts:\n  /h /s /m /c /e /ex /q",
          timestamp: new Date(),
        },
      ]);
      setInputValue("");
      return;
    }

    if (resolved === "/sessions") {
      setInputValue("");
      setInputFocused(false);
      try {
        const files = await listSessionFiles();
        setSessions(files);
        setSessionSelectorOpen(true);
      } catch (error: any) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        addCapturedMessage("error", `Failed to list sessions: ${message}`);
        setInputFocused(true);
      }
      return;
    }

    const contextContent = contextFiles();
    const userMessageContent = contextContent
      ? `${contextContent}\n\n---\n\nUser request: ${trimmed}`
      : trimmed;

    const userMessage: TimestampedMessage = {
      role: "user",
      content: userMessageContent,
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

  const handleSessionSelect = async (path: string) => {
    try {
      const content = await Bun.file(path).text();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Session: ${path}\n\n${content || "(empty file)"}`,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addCapturedMessage("error", `Failed to read session: ${message}`);
    }
    setSessionSelectorOpen(false);
    setInputFocused(true);
  };

  const handleSessionSelectorClose = () => {
    setSessionSelectorOpen(false);
    setInputFocused(true);
  };

  return (
    <box flexDirection="column" height="100%" width="100%">
      <Header config={config} version={version} />
      <MessageList
        displayItems={displayItems}
        config={config}
        isStreaming={isStreaming}
        hideScrollbar={true}
      />
      <InputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isStreaming={isStreaming}
        inputFocused={inputFocused}
        setInputFocused={setInputFocused}
      />
      <Footer />
      <Show when={sessionSelectorOpen()}>
        <SessionSelector
          sessions={sessions}
          onSelect={handleSessionSelect}
          onClose={handleSessionSelectorClose}
        />
      </Show>
    </box>
  );
}
