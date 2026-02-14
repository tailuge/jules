# src/hooks/

Custom Solid.js hooks for state management.

- `useChat.ts`: Manages chat messages and streaming state.
- `useSession.ts`: Manages session file creation and selection.

## Conventions

- Each hook should export an interface `UseXxxReturn` describing its return type
- Hooks use Solid.js signals for reactive state
- Business logic is encapsulated within hooks for testability
