import { createSignal, type Accessor, type Setter } from "solid-js";
import { type ModelMessage } from "ai";
import { type TimestampedMessage, type Config } from "@/types";
import { streamChatWithTools } from "@/agent/loop";
import { createProvider } from "@/agent/provider";
import { addCapturedMessage } from "@/utils/console-capture";
import { getHarnessPrompt } from "@/agent/harness_prompt";
import {
  logHarnessRequest,
  logHarnessToolCall,
  logHarnessToolResult,
  logHarnessResponse,
} from "@/utils/harness-logger";
import { toolRegistry } from "@/tools/registry";

export interface UseChatReturn {
  messages: Accessor<TimestampedMessage[]>;
  setMessages: Setter<TimestampedMessage[]>;
  isStreaming: Accessor<boolean>;
  sendMessage: (
    content: string,
    config: Config,
    contextContent: string,
  ) => Promise<void>;
  clearMessages: () => void;
}

function toModelMessages(messages: TimestampedMessage[]): ModelMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as ModelMessage[];
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = createSignal<TimestampedMessage[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);

  const sendMessage = async (
    content: string,
    config: Config,
    contextContent: string,
  ): Promise<void> => {
    const userMessageContent = contextContent
      ? `${contextContent}\n\n---\n\nUser request: ${content}`
      : content;

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
    setIsStreaming(true);
    addCapturedMessage(
      "log",
      `Request started with ${config.model.provider}:${config.model.name}`,
    );

    try {
      const provider = createProvider(config.model);
      let hasResponseText = false;
      const isHarnessEnabled = config.harness?.enabled !== false;
      let fullResponse = "";

      const harnessPrompt = isHarnessEnabled ? getHarnessPrompt() : "";
      const userSystemPrompt = config.agent.systemPrompt || "";
      const combinedSystemPrompt = harnessPrompt
        ? userSystemPrompt
          ? `${harnessPrompt}\n\n${userSystemPrompt}`
          : harnessPrompt
        : userSystemPrompt;

      for await (const event of streamChatWithTools(
        conversationForModel,
        provider,
        combinedSystemPrompt,
        {
          tools: toolRegistry.getAll(),
          onLogRequest: isHarnessEnabled ? logHarnessRequest : undefined,
          onLogToolCall: isHarnessEnabled ? logHarnessToolCall : undefined,
          onLogToolResult: isHarnessEnabled ? logHarnessToolResult : undefined,
          onLogResponse: isHarnessEnabled ? logHarnessResponse : undefined,
        },
      )) {
        if (event.type === "text" && event.data) {
          hasResponseText = true;
          fullResponse += event.data;
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            const lastMsg = updated[lastIndex];
            if (lastMsg && lastMsg.role === "assistant") {
              updated[lastIndex] = {
                ...lastMsg,
                content: (lastMsg.content as string) + event.data,
              };
            }
            return updated;
          });
        }
        if (event.type === "done") {
          break;
        }
      }

      if (!hasResponseText) {
        addCapturedMessage("warn", "Model returned an empty response.");
      }
      addCapturedMessage("log", "Request completed.");
    } catch (error: unknown) {
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

  const clearMessages = (): void => {
    setMessages([]);
  };

  return {
    messages,
    setMessages,
    isStreaming,
    sendMessage,
    clearMessages,
  };
}
