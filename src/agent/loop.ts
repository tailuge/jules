/**
 * Agentic Loop Implementation
 * Core reasoning and action execution cycle
 */

import { generateText, streamText, ModelMessage } from "ai";
import { z } from "zod";
import type { Provider } from "./provider";

export interface AgentTool {
  name: string;
  description: string;
  parameters: z.ZodType<any>;
  execute: (args: any) => Promise<any>;
}

/**
 * @deprecated Use AgentTool instead
 */
export type Tool = AgentTool;

export interface AgentLoopConfig {
  provider: Provider;
  tools: Record<string, AgentTool>;
  maxIterations: number;
  systemPrompt?: string;
  onToolCall?: (name: string, args: any) => void;
  onToken?: (token: string) => void;
  onStep?: (step: number, total: number) => void;
}

export interface LoopEvent {
  type: "text" | "tool_call" | "tool_result" | "thinking" | "done" | "error";
  data: any;
  timestamp: number;
}

/**
 * Main agentic loop generator
 * Yields events for each step of the reasoning process
 */
export async function* agentLoop(
  prompt: string,
  config: AgentLoopConfig,
): AsyncGenerator<LoopEvent> {
  const messages: ModelMessage[] = [];

  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  let iteration = 0;

  while (iteration < config.maxIterations) {
    iteration++;
    config.onStep?.(iteration, config.maxIterations);

    try {
      const toolsObject = Object.fromEntries(
        Object.entries(config.tools).map(([name, tool]) => [
          name,
          {
            description: tool.description,
            parameters: tool.parameters,
          },
        ]),
      );

      const result = await generateText({
        model: config.provider.model,
        messages,
        tools: toolsObject as any,
      } as any);

      if (result.text) {
        yield {
          type: "text",
          data: result.text,
          timestamp: Date.now(),
        };
      }

      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const toolCall of result.toolCalls) {
          const toolName = toolCall.toolName as string;
          const toolCallArgs = (toolCall as any).args ?? {};

          yield {
            type: "tool_call",
            data: {
              name: toolName,
              args: toolCallArgs,
              callId: toolCall.toolCallId,
            },
            timestamp: Date.now(),
          };

          config.onToolCall?.(toolName, toolCallArgs);

          const tool = config.tools[toolName];
          if (tool) {
            try {
              const result_data = await tool.execute(toolCallArgs);
              yield {
                type: "tool_result",
                data: {
                  name: toolName,
                  result: result_data,
                  success: true,
                },
                timestamp: Date.now(),
              };
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : String(error);
              yield {
                type: "tool_result",
                data: {
                  name: toolName,
                  error: message,
                  success: false,
                },
                timestamp: Date.now(),
              };
            }
          }
        }

        const toolCallContent = result.toolCalls.map((tc) => ({
          type: "tool-call" as const,
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: (tc as any).args ?? {},
        }));
        messages.push({
          role: "assistant",
          content: toolCallContent as any,
        });

        continue;
      }

      yield {
        type: "done",
        data: { iterations: iteration },
        timestamp: Date.now(),
      };
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      yield {
        type: "error",
        data: { message, iteration },
        timestamp: Date.now(),
      };

      if (message.includes("rate limit")) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      break;
    }
  }

  yield {
    type: "done",
    data: { iterations: iteration, maxReached: true },
    timestamp: Date.now(),
  };
}

export async function simpleAgentCall(
  prompt: string,
  provider: Provider,
  systemPrompt?: string,
): Promise<string> {
  const messages: ModelMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  const result = await generateText({
    model: provider.model,
    messages,
  });

  return result.text;
}

/**
 * @deprecated Use streamChatWithTools instead for tool support and event-based streaming
 */
export async function* streamChat(
  messages: ModelMessage[],
  provider: Provider,
  systemPrompt?: string,
): AsyncGenerator<string> {
  const allMessages: ModelMessage[] = [];

  if (systemPrompt) {
    allMessages.push({ role: "system", content: systemPrompt });
  }

  allMessages.push(...messages);

  const result = await streamText({
    model: provider.model,
    messages: allMessages,
  });

  let emitted = false;
  const textStream = (result as { textStream?: AsyncIterable<string> })
    .textStream;
  if (
    textStream &&
    typeof (textStream as { [Symbol.asyncIterator]?: unknown })[
      Symbol.asyncIterator
    ] === "function"
  ) {
    for await (const chunk of textStream) {
      emitted = true;
      yield chunk;
    }
  }

  const finalText = await (result as { text?: string | PromiseLike<string> })
    .text;
  if (!emitted && typeof finalText === "string") {
    const fullText = finalText;
    if (fullText) {
      yield fullText;
    }
  }
}

export interface StreamChatEvent {
  type: "text" | "tool_call" | "tool_result" | "done";
  data: any;
}

export interface StreamChatConfig {
  tools: Record<string, AgentTool>;
  onLogRequest?: (
    systemPrompt: string | undefined,
    messages: ModelMessage[],
  ) => void;
  onLogToolCall?: (name: string, args: Record<string, unknown>) => void;
  onLogToolResult?: (name: string, result: unknown) => void;
  onLogResponse?: (response: {
    text?: string;
    toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  }) => void;
}

export async function* streamChatWithTools(
  messages: ModelMessage[],
  provider: Provider,
  systemPrompt: string | undefined,
  config: StreamChatConfig,
): AsyncGenerator<StreamChatEvent> {
  const allMessages: ModelMessage[] = [];

  if (systemPrompt) {
    allMessages.push({ role: "system", content: systemPrompt });
  }

  allMessages.push(...messages);

  config.onLogRequest?.(systemPrompt, allMessages);

  const toolsObject = Object.fromEntries(
    Object.entries(config.tools).map(([name, tool]) => [
      name,
      {
        description: tool.description,
        parameters: tool.parameters,
      },
    ]),
  );

  const result = await streamText({
    model: provider.model,
    messages: allMessages,
    tools: Object.keys(config.tools).length > 0 ? toolsObject : undefined,
  } as any);

  const toolCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  let fullText = "";

  const fullStream = (result as { fullStream?: AsyncIterable<any> }).fullStream;
  if (
    fullStream &&
    typeof (fullStream as { [Symbol.asyncIterator]?: unknown })[
      Symbol.asyncIterator
    ] === "function"
  ) {
    for await (const part of fullStream) {
      if (part.type === "text-delta") {
        const chunk = part.textDelta;
        fullText += chunk;
        yield { type: "text", data: chunk };
      } else if (part.type === "tool-call") {
        const toolName = part.toolName as string;
        const toolArgs = part.args ?? {};
        toolCalls.push({ name: toolName, args: toolArgs });

        config.onLogToolCall?.(toolName, toolArgs);
        yield { type: "tool_call", data: { name: toolName, args: toolArgs } };

        const tool = config.tools[toolName];
        if (tool) {
          try {
            const toolResult = await tool.execute(toolArgs);
            config.onLogToolResult?.(toolName, toolResult);
            yield {
              type: "tool_result",
              data: { name: toolName, result: toolResult, success: true },
            };
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            config.onLogToolResult?.(toolName, { error: message });
            yield {
              type: "tool_result",
              data: { name: toolName, error: message, success: false },
            };
          }
        }
      }
    }
  }

  config.onLogResponse?.({
    text: fullText || undefined,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
  });
  yield { type: "done", data: { text: fullText, toolCalls } };
}
