## 2025-05-15 - TUI Discoverability and Session Management
**Learning:** In a terminal-based agent, users can feel lost with a blank screen. Providing a welcome screen with initial instructions and a persistent status bar for keyboard shortcuts significantly reduces friction. Slash commands like `/clear` and `/help` provide expected CLI-like session management.
**Action:** Always include a welcome state for empty message lists and a status bar for discoverability in TUI agent interfaces.

## 2025-02-14 - TUI Chat Readability
**Learning:** In a terminal conversation, distinct labels like "You:" vs "ModelName:" and vertical breathing room between turns significantly improve the "feel" of a chat interface compared to raw command-line style prefixes like ">". Using box-drawing characters like "│" in the footer creates a professional status bar appearance that helps users quickly parse shortcuts.
**Action:** Use role-based labels and margin-based turn separation in TUI chat components. Use "│" as a separator for multi-command status bars.
