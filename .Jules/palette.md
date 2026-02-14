## 2025-05-15 - TUI Discoverability and Session Management
**Learning:** In a terminal-based agent, users can feel lost with a blank screen. Providing a welcome screen with initial instructions and a persistent status bar for keyboard shortcuts significantly reduces friction. Slash commands like `/clear` and `/help` provide expected CLI-like session management.
**Action:** Always include a welcome state for empty message lists and a status bar for discoverability in TUI agent interfaces.

## 2025-05-16 - TUI Status Bar Scannability
**Learning:** In a terminal status bar, using box-drawing characters like "│" to separate command hints creates a much more professional and scannable interface than using simple spaces or commas. It provides clear visual boundaries that help users quickly identify the available shortcuts.
**Action:** Use "│" as a separator for multi-command status bars in TUI applications.
