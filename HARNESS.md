# Harness Prompt Implementation Plan

## Overview

Create a `harness_prompt.ts` module that injects instructions into the agent's system prompt, directing the LLM to use the `read_file` tool to read `self.md` and `memories.md` from `~/.tui-agent/`. The implementation includes logging of tool usage and LLM responses to the TUI output area.

## Files to Create/Modify

### 1. Create: `src/agent/harness_prompt.ts`

**Purpose**: Define the harness system prompt that instructs the LLM to use tools.

**Content**:

```typescript
export const HARNESS_PROMPT = `
Before responding to any user request, you must:

1. Use the read_file tool to read ~/.tui-agent/self.md
2. Use the read_file tool to read ~/.tui-agent/memories.md

These files contain important context about your identity and past interactions.

After reading these files, proceed with the user's request while incorporating relevant context from what you've read.
`.trim();

export function getHarnessPrompt(): string {
  return HARNESS_PROMPT;
}
```

### 2. Modify: `src/hooks/useChat.ts`

**Changes**:

- Import `getHarnessPrompt` from `harness_prompt.ts`
- Prepend harness prompt to the existing system prompt
- Add logging for tool usage detection in streamed response

**Integration point**: The `sendMessage` function calls `streamChat` with `config.agent.systemPrompt`. This needs to combine the harness prompt with any user-configured system prompt.

### 3. Create: `src/utils/harness-logger.ts`

**Purpose**: Utility for logging harness-specific events (tool calls, responses) to the TUI output.

**Content**:

- Function to log when harness-related tools are called
- Function to log response summaries
- Integration with existing `console-capture.ts` for visibility

### 4. Modify: `src/config/schema.ts`

**Changes**:

- Add optional `harness: { enabled: boolean }` to config schema
- Default to `true` for harness behavior

**Rationale**: Allow users to disable harness prompt if needed.

## Logging Strategy

1. **Tool Usage Logging**: When the agent uses `read_file` on `self.md` or `memories.md`, log:
   - `[Harness] Reading self.md...`
   - `[Harness] Reading memories.md...`

2. **Response Logging**: After the LLM completes its response:
   - `[Harness] Response received (N characters)`

3. **Output Destination**: Use `addCapturedMessage()` from `console-capture.ts` which:
   - Shows in TUI output area
   - Appears in backtick console logs

## Implementation Order

1. Create `src/agent/harness_prompt.ts` with the prompt constant
2. Create `src/utils/harness-logger.ts` with logging utilities
3. Modify `src/config/schema.ts` to add harness config option
4. Modify `src/hooks/useChat.ts` to integrate harness prompt and logging

## Testing Considerations

- Unit test for `getHarnessPrompt()` returning expected string
- Integration test verifying harness prompt is prepended to system prompt
- Test that logging functions are called when harness tools are used

## Open Questions

None - requirements are clear from user answers.
