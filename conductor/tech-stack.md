# Technology Stack - loopy

## Core Runtime & Language
- **Runtime:** Bun (v1.3.9 or later)
- **Language:** TypeScript (v5.9.3 or later)

## TUI Framework
- **Framework:** OpenTUI with SolidJS
- **Reconciliation:** `@opentui/solid` and `@opentui/core` for building the reactive terminal user interface.

## AI & Agentic Loop
- **AI SDK:** Vercel AI SDK (`ai` package)
- **Model Providers:** Model-agnostic support via providers such as Anthropic, Google, and OpenAI.
- **Tooling:** Direct execution of Linux shell commands and file operations to interact with the system and codebase.

## Development Tools
- **Build/Dev:** Bun's built-in dev server and build tools.
- **Linting & Formatting:** Prettier and ESLint (via TypeScript type-checking).
- **Testing:** Bun's built-in test runner.