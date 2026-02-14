# src/

This is the main source directory for the TUI Agent application.

- `index.tsx`: Application entry point.
- `app.tsx`: Main application component.
- `constants.ts`: Global constants.
- `types.ts`: Shared TypeScript type definitions.
- `agent/`: Agentic loop and AI provider integration.
- `commands/`: Command system (registry, built-in commands).
- `components/`: Reusable TUI components.
- `config/`: Configuration handling.
- `context/`: Solid.js context providers for shared state.
- `hooks/`: Custom hooks for state management (useChat, useSession).
- `tools/`: Agent tool definitions.
- `utils/`: Common utilities.

## Architecture

- **Session Layer**: Creates timestamped session files in `~/.tui-agent/sessions/` for each application run.
