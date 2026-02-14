import type { Command, CommandContext } from "./types";
import {
  listAvailableModelsForProvider,
  formatAvailableModelsMessage,
} from "@/agent/models";

const HELP_TEXT = `Available commands:
  /help     - Show this help message
  /sessions - View past session logs
  /models   - List available models for current provider
  /clear    - Clear the conversation history
  /exit     - Exit the application
  /quit     - Exit the application
  /q        - Exit the application

Shortcuts:
  /h /s /m /c /e /ex /q`;

export const helpCommand: Command = {
  name: "/help",
  aliases: ["/h"],
  description: "Show available commands",
  execute(ctx: CommandContext) {
    ctx.setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: "/help",
        timestamp: new Date(),
      },
      {
        role: "assistant",
        content: HELP_TEXT,
        timestamp: new Date(),
      },
    ]);
  },
};

export const clearCommand: Command = {
  name: "/clear",
  aliases: ["/c"],
  description: "Clear conversation history",
  execute(ctx: CommandContext) {
    ctx.setMessages([]);
    ctx.clearCapturedMessages();
  },
};

export const exitCommand: Command = {
  name: "/exit",
  aliases: ["/quit", "/q", "/e", "/ex"],
  description: "Exit the application",
  execute(ctx: CommandContext) {
    ctx.exitApp();
  },
};

export const modelsCommand: Command = {
  name: "/models",
  aliases: ["/m"],
  description: "List available models for current provider",
  async execute(ctx: CommandContext) {
    const activeConfig = ctx.config();
    if (!activeConfig) {
      ctx.addCapturedMessage("error", "No config loaded");
      return;
    }

    ctx.addCapturedMessage(
      "log",
      `Fetching models for provider ${activeConfig.model.provider}`,
    );

    try {
      const models = await listAvailableModelsForProvider(
        activeConfig.model.provider,
      );
      ctx.setMessages((prev) => [
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown models error";
      ctx.addCapturedMessage("error", `Failed to fetch models: ${message}`);
      ctx.setMessages((prev) => [
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
  },
};

export const sessionsCommand: Command = {
  name: "/sessions",
  aliases: ["/s"],
  description: "View past session logs",
  execute(ctx: CommandContext) {
    ctx.openSessionSelector();
  },
};

export const builtinCommands: Command[] = [
  helpCommand,
  clearCommand,
  exitCommand,
  modelsCommand,
  sessionsCommand,
];
