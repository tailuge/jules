/**
 * Agentic Loop Implementation
 * Core reasoning and action execution cycle
 */

import { generateText, streamText, CoreMessage } from "ai";
import { z } from "zod";
import type { Provider } from "./provider";

export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodType<any>;
  execute: (args: any) => Promise<any>;
}

export interface AgentLoopConfig {
  provider: Provider;
  tools: Record<string, Tool>;
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
  const messages: CoreMessage[] = [];

  // Add system prompt if provided
  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }

  // Add user prompt
  messages.push({ role: "user", content: prompt });

  let iteration = 0;

  while (iteration < config.maxIterations) {
    iteration++;
    config.onStep?.(iteration, config.maxIterations);

    try {
      // Convert tools to AI SDK format
      const toolsSchema = Object.fromEntries(
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
        // @ts-expect-error - Tool schema format needs updating for AI SDK v5
        tools: toolsSchema,
        maxSteps: 1,
      });

      // Yield text response if present
      if (result.text) {
        yield {
          type: "text",
          data: result.text,
          timestamp: Date.now(),
        };
      }

      // Handle tool calls
      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const toolCall of result.toolCalls) {
          // Yield tool call event
          yield {
            type: "tool_call",
            data: {
              name: toolCall.toolName,
              // @ts-expect-error - Tool call args type needs updating
              args: toolCall.args,
              callId: toolCall.toolCallId,
            },
            timestamp: Date.now(),
          };

          // @ts-expect-error - Tool call args type needs updating
          config.onToolCall?.(toolCall.toolName, toolCall.args);

          // Execute tool
          const tool = config.tools[toolCall.toolName];
          if (tool) {
            try {
              // @ts-expect-error - Tool call args type needs updating
              const result_data = await tool.execute(toolCall.args);
              yield {
                type: "tool_result",
                data: {
                  name: toolCall.toolName,
                  result: result_data,
                  success: true,
                },
                timestamp: Date.now(),
              };
            } catch (error: any) {
              yield {
                type: "tool_result",
                data: {
                  name: toolCall.toolName,
                  error: error.message,
                  success: false,
                },
                timestamp: Date.now(),
              };
            }
          }
        }

        // Add assistant message with tool calls
        messages.push({
          role: "assistant",
          // @ts-expect-error - Tool call content mapping needs updating for AI SDK v5
          content: result.toolCalls.map((tc) => ({
            type: "tool-call",
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            // @ts-expect-error - Tool call args type needs updating
            args: tc.args,
          })),
        });

        // Add tool results
        // Note: In real implementation, you'd collect all results
        continue;
      }

      // No tool calls - we're done
      yield {
        type: "done",
        data: { iterations: iteration },
        timestamp: Date.now(),
      };
      return;
    } catch (error: any) {
      yield {
        type: "error",
        data: { message: error.message, iteration },
        timestamp: Date.now(),
      };

      // Decide whether to retry or abort
      if (error.message.includes("rate limit")) {
        // Wait and retry
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      break;
    }
  }

  // Max iterations reached
  yield {
    type: "done",
    data: { iterations: iteration, maxReached: true },
    timestamp: Date.now(),
  };
}

/**
 * Simple non-streaming agent call
 */
export async function simpleAgentCall(
  prompt: string,
  provider: Provider,
  systemPrompt?: string,
): Promise<string> {
  const messages: CoreMessage[] = [];

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

export async function* streamChat(
  messages: CoreMessage[],
  provider: Provider,
  systemPrompt?: string,
): AsyncGenerator<string> {
  const allMessages: CoreMessage[] = [];

  if (systemPrompt) {
    allMessages.push({ role: "system", content: systemPrompt });
  }

  allMessages.push(...messages);

  const result = await streamText({
    model: provider.model,
    messages: allMessages,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}
