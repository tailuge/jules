# Product Guidelines

## Architectural Principles
- **Modular Design:** The Bash harness will be split into logical scripts (e.g., core logic, tool definitions, LLM interfacing) to ensure maintainability and readability as the project evolves.
- **Understandability:** Code should be well-commented and structured to serve as a research-grade reference for the RLM architecture.

## Development Standards
- **Interoperability:** Integration with Simon Willison's `llm` package is mandatory for model flexibility.
- **Dependency Management:** Scripts must verify the existence of external dependencies (`llm`, `grep`, `sed`, etc.) at runtime and provide helpful installation guidance if they are missing.
- **Logging & Transparency:** By default, the harness will provide informative logging of tool executions and their results to stderr to facilitate debugging and research.

## Testing Strategy
- **Integration-First:** Primary verification will be through end-to-end integration tests that run the RLM loop against mock context files and simulated LLM responses to ensure the control plane functions correctly.

## Content Management
- **Externalized Prompts:** All LLM system prompts and instruction templates will be stored in a dedicated `prompts/` directory to allow for easy iteration and versioning without modifying core script logic.
