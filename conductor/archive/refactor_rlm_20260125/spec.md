# Specification: Modular RLM Harness with llm Integration

## Overview
The goal is to transform the monolithic `rlm.sh` into a modular system of scripts. This will improve maintainability, facilitate research into RLM behaviors, and provide robust model interoperability via Simon Willison's `llm` tool.

## Requirements
- **Modularity:** Separate core logic, tool definitions, and LLM communication.
- **llm Integration:** Use the `llm` CLI for all model queries.
- **Recursive Sub-calls:** Maintain and improve the ability for the harness to call itself or other LLM instances.
- **External Prompts:** Move system prompts and templates into a `prompts/` directory.
- **Logging:** Implement informative logging to stderr.
- **Dependency Checks:** Verify `llm` and standard utilities at runtime.

## Architecture
- `src/core.sh`: Main loop and state management.
- `src/tools.sh`: Definitions for shell-based tools (grep, sed, etc.).
- `src/llm_adapter.sh`: Interface for the `llm` CLI.
- `prompts/`: Directory containing text files for various prompt types.
