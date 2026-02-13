# AGENTS.md

Project conventions for AI agents working on this codebase.

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
bun run lint       # Lint code (required)
bun run build      # Build standalone binary
```

## Code Style

- TypeScript with strict mode enabled
- ES modules (`"type": "module"`)
- Path alias: `@/*` maps to `./src/*`
- No comments unless requested

## Project Structure

```
src/
├── index.ts          # Entry point
├── agent/            # Agentic loop and provider logic
├── tools/            # Tool definitions and registry
├── config/           # Config schema and loader
└── utils/            # Utilities
```

## Architecture

- TUI: OpenTUI with Solid.js
- LLM: Vercel AI SDK with multi-provider support
- Agent: ReAct-style agentic loop

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
