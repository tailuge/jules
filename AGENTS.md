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
