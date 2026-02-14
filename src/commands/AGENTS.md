# src/commands/

Command system for the TUI Agent application.

- `index.ts`: Command registry and resolver functions.
- `types.ts`: Command interfaces (Command, CommandContext).
- `builtin.ts`: Built-in commands (/help, /clear, /exit, /models, /sessions).

## Adding Commands

1. Create a new command implementing the `Command` interface
2. Export it from `builtin.ts`
3. Add it to the `builtinCommands` array

## Command Interface

```typescript
interface Command {
  name: string;
  aliases: string[];
  description: string;
  execute: (ctx: CommandContext) => Promise<void> | void;
}
```
