# Track Specification: Interactive Activity Input

## Overview
Add an interactive text entry area to the bottom of the "Activity" panel. This allows the user to provide real-time instructions or feedback to the agent while the loop is running or between iterations, making the "Loopy" interface truly interactive.

## Functional Requirements
- **Integrated Input Area:** A text entry field positioned inside the bottom border of the Activity panel.
- **Message Submission:** Pressing `Enter` sends the current text to the agent loop as new context/instruction.
- **Activity Logging:** Submitted messages are logged to the Activity panel as "User" input type (color-coded for clarity).
- **Loop Integration:** The submitted text must be passed to the ongoing or next `agentLoop` iteration.
- **Input Clearing:** The input field clears immediately upon submission.
- **Thinking Indicator:** Display a visual indicator (e.g., "Thinking...") when the agent is processing a response.
- **Multi-line Support:** Allow Shift+Enter to insert newlines within the input area.
- **Command History:** Use Up/Down arrow keys to navigate through previously submitted messages.

## User Interface (UI)
- **Styling:** Lighter grey background with a white cursor (inspired by gemini-cli).
- **Layout:** Occupies the bottom-most rows of the Activity panel, fixed in place while activity logs scroll above it.

## Acceptance Criteria
- [ ] Input area is visible at the bottom of the Activity panel.
- [ ] Typing text and pressing Enter adds the text to the log and clears the input.
- [ ] The agent responds to the new input in its next reasoning step.
- [ ] Up/Down arrows cycle through history.
- [ ] Shift+Enter correctly adds a newline.
- [ ] The input area stays fixed at the bottom even as the log grows.

## Out of Scope
- Complex command parsing (e.g., /slash commands) beyond simple text input.
- Persistent history across application restarts (in-memory history only for this track).
