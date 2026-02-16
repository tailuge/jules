# Implementation Plan: Interactive Activity Input

This plan outlines the steps to add a styled, interactive text input area to the bottom of the Activity panel, allowing real-time user-agent interaction.

## Phase 1: UI Component & Layout Integration [checkpoint: 97040e1]

- [x] Task: Create the `ActivityInput` component ff72210
    - [x] Write unit tests for `ActivityInput` rendering, focus behavior, and custom styling.
    - [x] Implement `ActivityInput.tsx` using OpenTUI/SolidJS with the requested styling (grey background, white cursor).
- [x] Task: Integrate `ActivityInput` into the Activity Panel 46f220a
    - [x] Write tests to ensure the input remains fixed at the bottom of the Activity panel while logs scroll above.
    - [x] Update `ActivityPanel.tsx` (or `MainLayout.tsx`) to host the new component.
- [x] Task: Conductor - User Manual Verification 'Phase 1: UI Component & Layout Integration' (Protocol in workflow.md) 97040e1

## Phase 2: Submission & Activity Logging

- [x] Task: Implement message submission logic 800d9bd
    - [x] Write tests for the submission handler (Enter key clears input, triggers callback).
    - [x] Update `LoopyApp.tsx` to handle submissions from `ActivityInput` and log them to the `activity` state as "user" type.
- [x] Task: Add "user" log type styling 800d9bd
    - [x] Write tests for different log type color-coding in `ActivityPanel`.
    - [x] Update `ActivityPanel.tsx` to support a distinct color/prefix for user-submitted messages.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Submission & Activity Logging' (Protocol in workflow.md)

## Phase 3: Agent Loop Integration

- [ ] Task: Update `runLoopy` to support dynamic input
    - [ ] Write tests for `agentLoop` responding to external message injections.
    - [ ] Modify `src/agent/loop.ts` or `loopy.ts` to allow pushing new user messages into the active loop context.
- [ ] Task: Implement Thinking Indicator
    - [ ] Write tests for the visibility of the "Thinking..." status.
    - [ ] Update the UI to display the indicator while the LLM is generating a response.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Agent Loop Integration' (Protocol in workflow.md)

## Phase 4: Advanced Input Interactions

- [ ] Task: Implement Command History
    - [ ] Write tests for Up/Down arrow key history navigation.
    - [ ] Implement an in-memory history stack in `ActivityInput`.
- [ ] Task: Multi-line Support
    - [ ] Write tests for Shift+Enter behavior.
    - [ ] Update the input handling to distinguish between `Enter` (submit) and `Shift+Enter` (newline).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Advanced Input Interactions' (Protocol in workflow.md)
