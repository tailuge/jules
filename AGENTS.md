# AGENTS.md

Project conventions for AI agents working on this codebase.

## Prerequisites

### Install Bun

This project uses **Bun** as the package manager. Install it first:

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# or using Homebrew
brew install bun

# verify installation
bun --version
```

## Package Manager

This project uses **Bun** exclusively. Do not use npm, yarn, or pnpm.

```bash
bun install        # Install dependencies
bun add <package>  # Add dependency
bun remove <package>  # Remove dependency
```

## Commands

Run these commands before committing changes:

```bash
bun run typecheck  # Type check (required)
bun run test       # Run tests (required)
bun run lint       # Lint code (required)
bun run build      # Build standalone binary
```

## Code Style

- TypeScript with strict mode enabled
- ES modules (`"type": "module"`)
- Path alias: `@/*` maps to `./src/*`
- No comments unless requested
- All files should end with a single newline character.

## Project Structure

```
src/
├── index.tsx         # Entry point (TUI Application)
├── agent/            # Agentic loop and provider logic
├── tools/            # Tool definitions and registry
├── config/           # Config schema and loader
└── utils/            # Utilities
```

## Required Skills

Always load these skills before working with relevant code:

- **opentui**: Load when working on TUI components, keyboard handling, or any `@opentui/*` imports
- **ai-sdk**: Load when working with LLM integration, providers, or any `ai` package imports

```
Use the skill tool with name: "opentui" or "ai-sdk"
```

## Architecture

- **TUI Layer**: Built with OpenTUI and Solid.js for reactive terminal interfaces.
- **Agent Layer**: Implements a ReAct-style agentic loop using the Vercel AI SDK.
- **Provider Layer**: Multi-provider support (Anthropic, OpenAI, etc.) via AI SDK.
- **Tool Layer**: Modular tool system for shell, file operations, etc.

## Testing Best Practices

- **Unit Testing**: Target core logic in `agent/`, `config/`, and `tools/`. Use `bun test`.
- **Mocking**: Always mock external APIs (like LLM providers) using `mock.module("ai", ...)` or similar.
- **TUI Testing**: When possible, test TUI components by isolating logic from rendering or mocking the renderer components.
- **Tool Testing**: Each tool should have tests for successful execution, failure modes, and edge cases.
- **Property-Based Testing**: Consider for configuration validation and complex data processing.

## TUI Development Principles

- **Reactivity**: Leverage Solid.js signals and memos for efficient UI updates. Avoid direct DOM/terminal manipulation.
- **Non-blocking I/O**: Long-running operations (LLM calls, shell tools) MUST be async to keep the TUI responsive.
- **Visual Feedback**: Provide clear indicators for agent states: "Thinking", "Streaming", "Executing [Tool]".
- **Keyboard First**: Ensure the app is fully navigable via keyboard. Use `focused` prop on the active input.
- **Error Handling**: Display errors gracefully within the TUI (e.g., in the chat or a status bar).
- **Graceful Exit**: Always use `renderer.destroy()` to clean up the terminal state.

## Tool Development

- **Safety First**: Tools that interact with the host system (like `shell`) should have safety controls (allowlists, timeouts, sandboxing).
- **Clear Descriptions**: Tool and parameter descriptions are used by the LLM for reasoning. Keep them concise and accurate.
- **Atomic Operations**: Favor small, well-defined tools over complex, multi-purpose ones.
- **Error Reporting**: Tools should return structured error information that the agent can use to recover.

## OpenTUI Notes

### Input Component

The `<input>` component has specific behavior for form submission:

- **`onSubmit`**: Receives a `SubmitEvent` (empty object `{}`), NOT the input value directly
- To get the submitted text, use the controlled input value from state:

  ```tsx
  const [inputValue, setInputValue] = createSignal("");

  const handleSubmit = (_event: SubmitEvent) => {
    const value = inputValue().trim();
    // handle submission
    setInputValue("");
  };

  <input
    value={inputValue()}
    onInput={setInputValue}
    onSubmit={handleSubmit as any} // type cast needed due to TS mismatch
    focused
  />;
  ```

### Keyboard Handling

- **Focused inputs consume regular characters** but special keys (Enter, Escape, etc.) still fire on `useKeyboard`
- To handle Enter key globally with a focused input, either:
  - Use `onSubmit` on the input component (preferred for form submission)
  - Use `useKeyboard` which will still receive Enter events
- Never call `process.exit()` directly - use `renderer.destroy()` to clean up properly

### Keyboard Events (Core API)

Access keyboard events via `renderer.keyInput` EventEmitter:

```typescript
import { type KeyEvent } from "@opentui/core";

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  console.log("Key name:", key.name);
  console.log("Ctrl pressed:", key.ctrl);
  console.log("Shift pressed:", key.shift);
  console.log("Alt pressed:", key.meta);

  if (key.name === "escape") {
    renderer.destroy();
  }
});
```

### Debugging

OpenTUI captures console.log output. Toggle the built-in console with backtick (\`) key.

### Terminal Compatibility (OSC 66)

Some terminals show artifacts with "66" due to OSC 66 escape sequences. Fix:

```bash
export OPENTUI_FORCE_EXPLICIT_WIDTH=false
```

Or in code before creating renderer:

```typescript
process.env.OPENTUI_FORCE_EXPLICIT_WIDTH = "false";
```

Affected: GNOME Terminal, Konsole (older), xterm (older), VT100/VT220 emulators.

### Solid.js Component Names

OpenTUI Solid uses underscores for multi-word components:

- `<ascii_font>` (not `<ascii-font>`)
- `<tab_select>` (not `<tab-select>`)
- `<line_number>` (not `<line-number>`)

### Running JSX Scripts

When running standalone `.tsx` scripts that use JSX, you must preload the OpenTUI Solid JSX runtime:

```bash
bun run --preload @opentui/solid/preload scripts/example.tsx
```

Without this preload, you'll get `Export named 'jsxDEV' not found` errors.

## Documentation Maintenance

- **Subdirectory AGENTS.md**: Each major subdirectory contains its own `AGENTS.md` file describing its contents.
- **Maintenance**: When adding new files, changing the purpose of a directory, or creating new subdirectories, ensure the corresponding `AGENTS.md` files are updated or created.
