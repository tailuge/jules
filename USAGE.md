# USAGE.md

Quick reference for running this project.

## Setup

```bash
bun install
```

## Development

```bash
bun run dev      # Run in development mode
bun run start    # Same as dev
```

## Build

```bash
bun run build    # Compile to dist/loopy
```

## Code Quality

```bash
bun run typecheck  # Type check
bun run lint       # Lint
bun run format     # Format with Prettier
```

## Configuration

Create `~/.tui-agent/config.json` and set your API key:

```bash
export ANTHROPIC_API_KEY=your-key
```

See README.md for full configuration options.
