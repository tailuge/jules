# /sessions Command Implementation Plan

## Overview

Add a `/sessions` command that displays session files in a selector with keyboard navigation for viewing past session logs.

## Requirements

- List `session*.md` files from `~/.tui-agent/sessions/` in date order (newest first)
- Arrow keys to navigate selection
- ESC key to close without action
- Enter key to display selected file contents
- Footer bar simplified to show `/help /q` on main screen

## File Changes

### 1. `src/utils/session.ts`

Add `listSessionFiles()` function:

```typescript
export interface SessionFile {
  filename: string; // e.g., "session_2026-02-14T13-26-27.md"
  path: string; // Full path to file
  date: Date; // Parsed from filename
}

export async function listSessionFiles(): Promise<SessionFile[]>;
```

- Read directory `~/.tui-agent/sessions/`
- Filter files matching `session*.md` pattern
- Parse timestamp from filename format: `session_YYYY-MM-DDTHH-MM-DD.md`
- Sort by date descending (newest first)
- Return array of `SessionFile` objects

### 2. `src/components/SessionSelector.tsx` (New File)

```typescript
interface SessionSelectorProps {
  sessions: Accessor<SessionFile[]>;
  onSelect: (path: string) => Promise<void>;
  onClose: () => void;
}
```

- Use OpenTUI `<select>` component for list display
- Options format: `{ name: formattedDate, description: filename, value: path }`
- `useKeyboard` hook captures ESC key → calls `onClose()`
- Arrow key navigation handled automatically by `<select>`
- Enter key triggers `onSelect()` via `onSelect` prop on `<select>`

### 3. `src/app.tsx`

Add state and command handling:

```typescript
// New state
const [sessionSelectorOpen, setSessionSelectorOpen] = createSignal(false);
const [sessions, setSessions] = createSignal<SessionFile[]>([]);

// In handleSubmit, add case:
if (trimmed === "/sessions") {
  const files = await listSessionFiles();
  setSessions(files);
  setSessionSelectorOpen(true);
  setInputValue("");
  return;
}

// Handler when session selected
const handleSessionSelect = async (path: string) => {
  const content = await Bun.file(path).text();
  setMessages(prev => [...prev, {
    role: "assistant",
    content: `Session: ${path}\n\n${content}`,
    timestamp: new Date(),
  }]);
  setSessionSelectorOpen(false);
};

// In render, conditionally show selector
<Show when={sessionSelectorOpen()}>
  <SessionSelector
    sessions={sessions}
    onSelect={handleSessionSelect}
    onClose={() => setSessionSelectorOpen(false)}
  />
</Show>
```

### 4. `src/components/Footer.tsx`

Simplify to minimal display:

```tsx
export function Footer() {
  return (
    <box flexDirection="row" paddingX={1} marginBottom={1}>
      <text fg="#666666">/help</text>
      <text fg="#444444"> </text>
      <text fg="#666666">/q</text>
    </box>
  );
}
```

## Interaction Flow

1. User types `/sessions` → command handler loads files, opens selector
2. Selector displays sessions sorted newest-first
3. Arrow Up/Down navigates list (built into `<select>`)
4. ESC → `onClose()` called → selector closes, returns to chat
5. Enter → `onSelect()` called → file read, content displayed as message, selector closes

## Testing

- Unit tests for `listSessionFiles()` in `src/utils/session.test.ts`
- Test parsing of filenames, sorting, empty directory handling
- Integration test for command flow (optional)
