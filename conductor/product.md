# Initial Concept
A simple, model-agnostic TUI CLI designed to facilitate the investigation of agentic loops. The system enables an agent to interact with its own memory, goals, and identity (self) to autonomously improve the 'loopy' codebase itself.

# Product Definition - loopy

## Target Audience
- Developers and AI researchers investigating self-improving agentic loops.
- Users who prefer a lightweight, responsive TUI for AI interaction.

## Core Goals
- **Self-Improvement:** The ultimate goal is for 'loopy' to be used by an agent to modify and enhance its own source code.
- **Agentic Loop Investigation:** Provide a transparent feedback loop where goals, memory, and identity state are visible.
- **Model Agnostic:** Ensure the system works across different LLM providers via a unified interface.

## Key Features
- **Four-Panel TUI Layout:**
    - **Memory:** Displays persistent state and learned context.
    - **Goals:** Shows high-level objectives and their decomposition into sub-tasks.
    - **Self (Identity):** Defines the persona, constraints, and core behavioral logic.
    - **Activity:** Real-time log of tool usage, model thoughts, and system events.
- **Responsive Flex Layout:** The TUI automatically adjusts its layout to look great on both tall and wide terminal windows.
- **Agentic Tooling:** A set of built-in tools for the agent to read and write files, allowing it to interact with the project directory.

## Success Criteria
- A functional TUI with four distinct, updating panels.
- An agentic loop that can successfully read its own source code using provided tools.
- The ability for the agent to propose and execute improvements to the 'loopy' codebase.