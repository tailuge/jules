# Implementation Plan: Modular RLM Harness

## Phase 1: Foundation and Tooling
- [x] Task: Create project structure (`src/`, `prompts/`) ddf6bd4
- [ ] Task: Implement LLM adapter using Simon Willison's `llm` package
    - [ ] Write integration test for llm adapter
    - [ ] Implement `src/llm_adapter.sh`
- [ ] Task: Implement modular tool definitions
    - [ ] Write tests for shell tool wrappers
    - [ ] Implement `src/tools.sh`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation and Tooling' (Protocol in workflow.md)

## Phase 2: Core Logic and Modularization
- [ ] Task: Extract and externalize prompts
    - [ ] Create system prompts in `prompts/`
- [ ] Task: Implement modular core loop
    - [ ] Write integration test for the full loop
    - [ ] Implement `src/core.sh`
- [ ] Task: Refactor `rlm.sh` to use modular components
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Logic and Modularization' (Protocol in workflow.md)

## Phase 3: Final Integration and Cleanup
- [ ] Task: Verify recursive sub-calls in the modular architecture
- [ ] Task: Final end-to-end testing against `tests/context.md`
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Integration and Cleanup' (Protocol in workflow.md)
