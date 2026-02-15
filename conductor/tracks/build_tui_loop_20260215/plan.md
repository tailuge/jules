# Implementation Plan - Build the core four-panel TUI layout and basic agentic loop shell.

## Phase 1: TUI Foundation
- [x] Task: Implement responsive flex layout shell (b609680)
    - [x] Write tests for layout resizing
    - [x] Create core container components
- [x] Task: Create the four panels (Memory, Goals, Self, Activity) (3a00d92)
    - [x] Write tests for panel state updates
    - [x] Implement individual panel components
- [ ] Task: Conductor - User Manual Verification 'TUI Foundation' (Protocol in workflow.md)

## Phase 2: Agentic Loop & Tools
- [ ] Task: Setup model-agnostic provider interface
    - [ ] Write tests for provider abstraction
    - [ ] Implement Vercel AI SDK integration
- [ ] Task: Implement Shell Tool
    - [ ] Write tests for shell command execution safety
    - [ ] Implement file read/write and command execution tools
- [ ] Task: Implement Basic Agentic Loop
    - [ ] Write tests for loop execution and tool usage
    - [ ] Connect agent output to the Activity panel and update state panels
- [ ] Task: Conductor - User Manual Verification 'Agentic Loop & Tools' (Protocol in workflow.md)