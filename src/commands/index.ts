import type { Command } from "./types";
import * as builtinCommands from "./builtin";

export type { Command, CommandContext, CommandResult } from "./types";
export * from "./builtin";

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name, command);
    for (const alias of command.aliases) {
      this.commands.set(alias, command);
    }
  }

  resolve(input: string): Command | null {
    return this.commands.get(input) ?? null;
  }
}

export function createCommandRegistry(): CommandRegistry {
  const registry = new CommandRegistry();

  for (const command of Object.values(builtinCommands)) {
    if (typeof command === "object" && "name" in command) {
      registry.register(command as Command);
    }
  }

  return registry;
}

export function resolveCommand(input: string): string | null {
  const registry = createCommandRegistry();
  const command = registry.resolve(input);
  return command ? command.name : null;
}
