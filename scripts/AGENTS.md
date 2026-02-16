# scripts/

This directory contains utility scripts used for development and building project assets.

- `generate-initial-screen.tsx`: A script that captures a frame of the TUI and updates the README and docs.
- `demo-loop.tsx`: Demonstrates the agent loop by simulating status updates (memory, goals, self, activity). It automatically exits after the demonstration completes.

## Running JSX Scripts

When running `.tsx` scripts that use JSX, you must preload the OpenTUI Solid JSX runtime:

```bash
bun run --preload @opentui/solid/preload scripts/generate-initial-screen.tsx
```

Or use the npm script:

```bash
bun run docs:screen
```

Without the preload, you'll get `Export named 'jsxDEV' not found` errors.
