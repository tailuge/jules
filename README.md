# TUI Agent CLI

## Initial Screen

```text

 ▀█▀ ▄▀█ █ █   █ █ █▀▀ █▀▀                                                                     v...
  █  █▀█ █ █▄▄ █▄█ █▄█ ██▄







                                    Welcome to TaiLuGe TUI Agent

                           Type a message to start or /help for commands








 >
 Help: /help   Clear: /clear   Models: /models   Console: `   Exit: /exit, /quit, or /q
```

## Install

### Prerequisites

- **Bun** (required) - Install via:
  ```bash
  # macOS/Linux
  curl -fsSL https://bun.sh/install | bash
  
  # or using Homebrew
  brew install bun
  
  # verify installation
  bun --version
  ```

### Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Configure API keys:**
   
   The CLI requires at least one LLM provider. Set environment variables before running:
   
   ```bash
   # Anthropic (Claude)
   export ANTHROPIC_API_KEY=your-key
   
   # OpenAI
   export OPENAI_API_KEY=your-key
   
   # Google Gemini
   export GOOGLE_GENERATIVE_AI_API_KEY=your-key
   
   # Groq
   export GROQ_API_KEY=your-key
   
   # Mistral
   export MISTRAL_API_KEY=your-key
   ```

   Or create `~/.tui-agent/config.json` with your preferred model.

### Run

```bash
bun run dev
# or
bun run start
```

## Build

```bash
bun run build
```

This creates a standalone binary at `dist/tui-agent`.

## Configuration

See [USAGE.md](USAGE.md) for detailed configuration options.
