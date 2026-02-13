# TUI Agent CLI - Project Outline

## Overview

A minimal, lightweight TypeScript TUI (Terminal User Interface) project for building AI agents with agentic loop capabilities. Based on the architecture patterns from Kilo CLI and OpenCode.

## Architecture

```
tui-agent-cli/
├── bin/
│   └── cli.ts              # CLI entry point
├── src/
│   ├── index.ts            # Main application entry
│   ├── tui/
│   │   ├── app.tsx         # Main TUI app component
│   │   ├── components/
│   │   │   ├── Chat.tsx    # Chat message display
│   │   │   ├── Input.tsx   # User input component
│   │   │   ├── Sidebar.tsx # Agent/tool sidebar
│   │   │   └── Status.tsx  # Status bar
│   │   └── styles.ts       # TUI styling utilities
│   ├── agent/
│   │   ├── loop.ts         # Agentic loop implementation
│   │   ├── provider.ts     # LLM provider abstraction
│   │   ├── tools.ts        # Tool definitions & execution
│   │   └── context.ts      # Conversation context management
│   ├── providers/
│   │   ├── anthropic.ts    # Claude provider
│   │   ├── openai.ts       # OpenAI provider
│   │   ├── google.ts       # Gemini provider
│   │   ├── groq.ts         # Groq provider
│   │   └── custom.ts       # Custom OpenAI-compatible
│   ├── tools/
│   │   ├── registry.ts     # Tool registry
│   │   ├── shell.ts        # Shell execution tool
│   │   ├── file.ts         # File operations tool
│   │   └── web.ts          # Web search/fetch tool
│   ├── config/
│   │   ├── schema.ts       # Config schema (zod)
│   │   └── loader.ts       # Config file loading
│   └── utils/
│       ├── logger.ts       # Logging utilities
│       └── format.ts       # Text formatting
├── package.json
├── tsconfig.json
└── README.md
```

## Key Dependencies Explained

### TUI Framework: OpenTUI vs Ink

| Feature | OpenTUI | Ink |
|---------|---------|-----|
| React-style components | ✓ (Solid.js) | ✓ (React) |
| Flexbox layouts | ✓ | ✓ |
| Mouse support | ✓ | Limited |
| Bundle size | Smaller | Larger |
| Maturity | Newer | More mature |
| Used by | OpenCode, Kilo CLI | Claude Code, Gemini CLI |

**Recommendation**: OpenTUI for cutting-edge features, Ink for ecosystem maturity.

### LLM Abstraction: Vercel AI SDK

The `ai` package provides:
- Unified API across all LLM providers
- Streaming responses
- Tool/function calling
- Structured output with Zod schemas

### Provider Packages

Each `@ai-sdk/*` package enables a specific vendor:

```typescript
// Anthropic Claude
import { anthropic } from '@ai-sdk/anthropic';
const model = anthropic('claude-sonnet-4-20250514');

// OpenAI GPT
import { openai } from '@ai-sdk/openai';
const model = openai('gpt-4o');

// Google Gemini
import { google } from '@ai-sdk/google';
const model = google('gemini-2.0-flash');

// Groq (fast inference)
import { groq } from '@ai-sdk/groq';
const model = groq('llama-3.3-70b-versatile');

// OpenAI-compatible (local models, custom endpoints)
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
const ollama = createOpenAICompatible({
  name: 'ollama',
  base: 'http://localhost:11434/v1'
});
```

## Agentic Loop Pattern

```typescript
// src/agent/loop.ts
import { generateText, tool } from 'ai';
import { z } from 'zod';

interface AgentLoopConfig {
  model: any;
  tools: Record<string, any>;
  maxIterations: number;
  onToolCall?: (name: string, args: any) => void;
  onResponse?: (text: string) => void;
}

export async function* agentLoop(
  prompt: string,
  config: AgentLoopConfig
): AsyncGenerator<{ type: 'text' | 'tool_call' | 'done'; data: any }> {
  const messages = [{ role: 'user' as const, content: prompt }];
  let iterations = 0;

  while (iterations < config.maxIterations) {
    iterations++;

    const result = await generateText({
      model: config.model,
      messages,
      tools: config.tools,
      maxSteps: 1,
    });

    // Yield text response
    if (result.text) {
      yield { type: 'text', data: result.text };
      messages.push({ role: 'assistant', content: result.text });
    }

    // Handle tool calls
    if (result.toolCalls?.length) {
      for (const toolCall of result.toolCalls) {
        yield { type: 'tool_call', data: toolCall };
        config.onToolCall?.(toolCall.toolName, toolCall.args);

        // Execute tool and add result
        const toolResult = await executeToolCall(toolCall, config.tools);
        messages.push({
          role: 'assistant',
          content: [{ type: 'tool-call', ...toolCall }]
        });
        messages.push({
          role: 'tool',
          content: [{ type: 'tool-result', ...toolResult }]
        });
      }
      continue; // Continue loop for more reasoning
    }

    // No tool calls = done
    yield { type: 'done', data: { iterations } };
    break;
  }
}
```

## Configuration Schema

```typescript
// src/config/schema.ts
import { z } from 'zod';

export const configSchema = z.object({
  model: z.object({
    provider: z.enum(['anthropic', 'openai', 'google', 'groq', 'custom']),
    name: z.string(),
    apiKey: z.string().optional(),
    baseUrl: z.string().optional(),
  }),
  agent: z.object({
    maxIterations: z.number().default(10),
    systemPrompt: z.string().optional(),
  }),
  tools: z.object({
    enabled: z.array(z.string()).default(['shell', 'file']),
    shell: z.object({
      allowedCommands: z.array(z.string()).optional(),
      sandbox: z.boolean().default(true),
    }).optional(),
  }),
  tui: z.object({
    theme: z.enum(['dark', 'light']).default('dark'),
    showTokenCount: z.boolean().default(true),
  }),
});

export type Config = z.infer<typeof configSchema>;
```

## Getting Started

1. **Clone and install**:
   ```bash
   cd tui-agent-cli
   bun install
   ```

2. **Configure** (create `~/.tui-agent/config.json`):
   ```json
   {
     "model": {
       "provider": "anthropic",
       "name": "claude-sonnet-4-20250514"
     },
     "agent": {
       "maxIterations": 10
     }
   }
   ```

3. **Set API key**:
   ```bash
   export ANTHROPIC_API_KEY=your-key
   # or
   export OPENAI_API_KEY=your-key
   ```

4. **Run**:
   ```bash
   bun run dev
   ```

## Design Principles

1. **Minimal**: Only essential dependencies
2. **TypeScript-first**: Full type safety
3. **Provider-agnostic**: Easy to swap LLM vendors
4. **Tool-based**: MCP-compatible tool system
5. **Streaming-first**: Real-time response display
6. **Linux-native**: Designed for terminal workflows

## Next Steps

1. Implement core TUI components
2. Build provider abstraction layer
3. Create agentic loop with tool execution
4. Add MCP server support
5. Implement shell tool with safety controls
6. Add file system tools
7. Create configuration system
