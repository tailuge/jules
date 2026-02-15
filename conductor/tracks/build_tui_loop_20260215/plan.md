# Implementation Plan - Build the core four-panel TUI layout and basic agentic loop shell.

## Phase 1: TUI Foundation [checkpoint: c173ec3]
- [x] Task: Implement responsive flex layout shell (b609680)
    - [x] Write tests for layout resizing
    - [x] Create core container components
- [x] Task: Create the four panels (Memory, Goals, Self, Activity) (3a00d92)
    - [x] Write tests for panel state updates
    - [x] Implement individual panel components
- [x] Task: Conductor - User Manual Verification 'TUI Foundation' (Protocol in workflow.md) (c173ec3)

## Phase 2: Agentic Loop & Tools [checkpoint: 317c253]
- [x] Task: Setup model-agnostic provider interface (f3de845)
    - [x] Write tests for provider abstraction
    - [x] Implement Vercel AI SDK integration
- [x] Task: Implement Shell Tool (d937d9e)
    - [x] Write tests for shell command execution safety
    - [x] Implement file read/write and command execution tools
- [x] Task: Implement Basic Agentic Loop (3867b42)
    - [x] Write tests for loop execution and tool usage
    - [x] Connect agent output to the Activity panel and update state panels
- [x] Task: Conductor - User Manual Verification 'Agentic Loop & Tools' (Protocol in workflow.md) (317c253)