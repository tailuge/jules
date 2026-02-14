import { useRenderer, useSelectionHandler } from "@opentui/solid";
import { createSignal, createMemo, Show } from "solid-js";
import clipboard from "clipboardy";
import {
  addCapturedMessage,
  getCapturedMessages,
  clearCapturedMessages,
} from "./utils/console-capture";
import { DisplayItem } from "./types";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { InputArea } from "./components/InputArea";
import { Footer } from "./components/Footer";
import { SessionSelector } from "./components/SessionSelector";
import { AppProvider, useAppContext } from "./context/AppContext";
import { useChat } from "./hooks/useChat";
import { useSession } from "./hooks/useSession";
import { createCommandRegistry, type CommandContext } from "./commands";

export interface AppProps {
  skipStartup?: boolean;
}

function AppContent() {
  const renderer = useRenderer();
  const context = useAppContext();
  const chat = useChat();
  const session = useSession();
  const commandRegistry = createCommandRegistry();

  const [inputValue, setInputValue] = createSignal("");
  const [inputFocused, setInputFocused] = createSignal(true);
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
    const msgs = chat.messages();
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

  const handleSubmit = async () => {
    const trimmed = inputValue().trim();
    const activeConfig = context.config();
    if (!trimmed || chat.isStreaming() || !activeConfig) {
      return;
    }

    const command = commandRegistry.resolve(trimmed.toLowerCase());
    if (command) {
      setInputValue("");
      const commandContext: CommandContext = {
        config: context.config,
        messages: chat.messages,
        setMessages: chat.setMessages,
        addCapturedMessage,
        clearCapturedMessages,
        openSessionSelector: () => {
          session.listSessions();
          session.openSelector();
        },
        exitApp: () => renderer.destroy(),
      };
      await command.execute(commandContext);
      return;
    }

    setInputValue("");
    await chat.sendMessage(trimmed, activeConfig, context.contextFiles());
  };

  const handleSessionSelect = async (path: string) => {
    try {
      const content = await Bun.file(path).text();
      chat.setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Session: ${path}\n\n${content || "(empty file)"}`,
          timestamp: new Date(),
        },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addCapturedMessage("error", `Failed to read session: ${message}`);
    }
    session.closeSelector();
    setInputFocused(true);
  };

  const handleSessionSelectorClose = () => {
    session.closeSelector();
    setInputFocused(true);
  };

  return (
    <box flexDirection="column" height="100%" width="100%">
      <Header config={context.config} version={context.version} />
      <MessageList
        displayItems={displayItems}
        config={context.config}
        isStreaming={chat.isStreaming}
        hideScrollbar={true}
      />
      <InputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isStreaming={chat.isStreaming}
        inputFocused={inputFocused}
        setInputFocused={setInputFocused}
      />
      <Footer />
      <Show when={session.selectorOpen()}>
        <SessionSelector
          sessions={session.sessions}
          onSelect={handleSessionSelect}
          onClose={handleSessionSelectorClose}
        />
      </Show>
    </box>
  );
}

export function App(props: AppProps = {}) {
  return (
    <AppProvider skipStartup={props.skipStartup}>
      <AppContent />
    </AppProvider>
  );
}
