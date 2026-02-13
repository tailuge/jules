# TUI Agent CLI

A minimal, lightweight TypeScript TUI (Terminal User Interface) project for building AI agents with agentic loop capabilities.

## 📥 Download

**[Download ZIP](download.zip)** - Get the complete project ready to use.

After downloading:
```bash
unzip download.zip
cd tui-agent-project
bun install
bun run dev
```

---

## Features

- 🖥️ **Rich TUI** - Built with OpenTUI for beautiful terminal interfaces
- 🤖 **Agentic Loop** - ReAct-style reasoning and action execution
- 🔌 **Multi-Provider** - Support for Anthropic, OpenAI, Google, Groq, Mistral, and custom endpoints
- 🛠️ **Tool System** - Built-in tools for shell, files, and more
- ⚡ **Bun Runtime** - Fast startup and execution
- 📦 **Minimal Dependencies** - Only what you need

## Quick Start

```bash
# Clone and install
cd tui-agent-project
bun install

# Set your API key
export ANTHROPIC_API_KEY=your-key

# Run
bun run dev
```

## Configuration

Create `~/.tui-agent/config.json`:

```json
{
  "model": {
    "provider": "anthropic",
    "name": "claude-sonnet-4-20250514"
  },
  "agent": {
    "maxIterations": 10,
    "systemPrompt": "You are a helpful coding assistant."
  },
  "tools": {
    "enabled": ["shell", "read_file", "write_file", "list_dir"]
  },
  "tui": {
    "theme": "dark",
    "showTokenCount": true
  }
}
```

## Supported Providers

| Provider | Package | Default Model |
|----------|---------|---------------|
| Anthropic | `@ai-sdk/anthropic` | claude-sonnet-4-20250514 |
| OpenAI | `@ai-sdk/openai` | gpt-4o |
| Google | `@ai-sdk/google` | gemini-2.0-flash |
| Groq | `@ai-sdk/groq` | llama-3.3-70b-versatile |
| Mistral | `@ai-sdk/mistral` | mistral-large-latest |
| Custom | `@ai-sdk/openai-compatible` | (configurable) |

## Project Structure

```
src/
├── index.ts          # Main entry point
├── agent/
│   ├── loop.ts       # Agentic loop implementation
│   └── provider.ts   # LLM provider abstraction
├── tools/
│   ├── registry.ts   # Tool management
│   ├── shell.ts      # Shell execution
│   └── file.ts       # File operations
├── config/
│   ├── schema.ts     # Config validation
│   └── loader.ts     # Config loading
└── utils/
    └── logger.ts     # Logging utilities
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google API key |
| `GROQ_API_KEY` | Groq API key |
| `MISTRAL_API_KEY` | Mistral API key |
| `TUI_AGENT_PROVIDER` | Override provider |
| `TUI_AGENT_MODEL` | Override model name |

## Architecture

This project follows patterns from [Kilo CLI](https://github.com/Kilo-Org/kilo) and [OpenCode](https://github.com/opencode-ai/opencode):

1. **TUI Layer** - OpenTUI for terminal rendering with Solid.js reactivity
2. **Agent Layer** - Agentic loop with tool calling
3. **Provider Layer** - Unified LLM interface via Vercel AI SDK
4. **Tool Layer** - Modular, extensible tool system

## Adding Custom Tools

```typescript
import { defineTool, toolRegistry } from './tools/registry';
import { z } from 'zod';

const myTool = defineTool({
  name: 'my_tool',
  description: 'A custom tool',
  parameters: z.object({
    input: z.string().describe('Input to process'),
  }),
  execute: async ({ input }) => {
    // Your logic here
    return { result: `Processed: ${input}` };
  },
});

toolRegistry.register(myTool);
```

## Building

```bash
# Compile to standalone binary
bun run build

# Output: dist/tui-agent
```

## License

MIT
