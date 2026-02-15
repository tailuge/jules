# SOLID Analysis Report

## Executive Summary

This document analyzes the codebase for violations of SOLID principles and common code smells. The project is a TUI-based AI agent application built with OpenTUI, Solid.js, and Vercel AI SDK.

---

## SRP (Single Responsibility Principle) Violations

### 1. AppContext.tsx - Multiple Unrelated Concerns

**Location:** [`src/context/AppContext.tsx`](src/context/AppContext.tsx:55-117)

**Issue:** The `AppProvider` component handles too many responsibilities:
- Loading configuration from files
- Loading context files from disk
- Creating session files
- Setting up keyboard handlers (console toggle)
- Managing runtime error capture (init/restore)
- Setting up cleanup handlers

**Refactoring:** Split into separate concerns:
- Create a `ConfigLoader` utility for config loading
- Create a `ContextLoader` for context files
- Create a `SessionManager` for session operations
- Keep AppContext for state provision only

### 2. useChat.ts - Orchestration Complexity

**Location:** [`src/hooks/useChat.ts`](src/hooks/useChat.ts:39-143)

**Issue:** The `sendMessage` function orchestrates:
- Message formatting with context content
- Provider creation
- Harness prompt handling
- Streaming event processing
- Message state updates
- Console logging
- Error handling

**Refactoring:** Extract into smaller functions or create a `ChatService` class that handles the orchestration.

### 3. console-capture.ts - Mixed Concerns

**Location:** [`src/utils/console-capture.ts`](src/utils/console-capture.ts)

**Issue:** Single file handles:
- Console interception (log/error/warn)
- Runtime error capture (unhandledRejection/uncaughtException)
- Message state management (signals)
- Formatting utilities

**Refactoring:** Split into:
- `ConsoleInterceptor` - handles console overriding
- `RuntimeErrorHandler` - handles process error events
- `MessageStore` - state management

---

## OCP (Open/Closed Principle) Violations

### 1. provider.ts - Switch Statement for Providers

**Location:** [`src/agent/provider.ts`](src/agent/provider.ts:45-113)

**Issue:** The `createProvider` function uses a large switch statement. Adding a new provider requires modifying this core function.

```typescript
switch (config.provider) {
  case "anthropic": // ...
  case "openai": // ...
  // etc.
}
```

**Refactoring:** Use a provider registry pattern:
```typescript
interface ProviderFactory {
  create(config: ModelConfig): Provider;
}

const providers = new Map<ProviderType, ProviderFactory>();
// Register providers at startup
```

### 2. Commands Registry - Runtime Registration

**Location:** [`src/commands/index.ts`](src/commands/index.ts:34-38)

**Issue:** The `resolveCommand` function creates a new registry on every call:
```typescript
export function resolveCommand(input: string): string | null {
  const registry = createCommandRegistry(); // Creates new instance!
  const command = registry.resolve(input);
  return command ? command.name : null;
}
```

**Refactoring:** Use a singleton or memoized registry.

---

## ISP (Interface Segregation) Issues

### 1. AgentTool Parameters

**Location:** [`src/agent/loop.ts`](src/agent/loop.ts:10-15)

**Issue:** Using `z.ZodType<any>` for parameters is too broad:
```typescript
export interface AgentTool {
  name: string;
  description: string;
  parameters: z.ZodType<any>; // Too generic
  execute: (args: any) => Promise<any>;
}
```

**Refactoring:** Use a more specific generic type or create tool-specific interfaces.

### 2. StreamChatConfig Callbacks

**Location:** [`src/agent/loop.ts`](src/agent/loop.ts:247-259)

**Issue:** Four optional callback functions, most callers only use some:
```typescript
export interface StreamChatConfig {
  tools: Record<string, AgentTool>;
  onLogRequest?: (...) => void;
  onLogToolCall?: (...) => void;
  onLogToolResult?: (...) => void;
  onLogResponse?: (...) => void;
}
```

**Refactoring:** Split into separate interfaces or use a logging configuration object.

---

## DIP (Dependency Inversion) Violations

### 1. useChat Direct Provider Creation

**Location:** [`src/hooks/useChat.ts`](src/hooks/useChat.ts:72)

**Issue:** High-level `useChat` hook directly depends on concrete `createProvider`:
```typescript
const provider = createProvider(config.model);
```

**Refactoring:** Accept provider as a parameter or use dependency injection.

---

## Common Code Smells

### 1. Magic Numbers/Strings

| Location | Issue |
|----------|-------|
| [`src/tools/shell.ts:11`](src/tools/shell.ts:11) | `default(30000)` - timeout without constant |
| [`src/tools/shell.ts:23`](src/tools/shell.ts:23) | `1024 * 1024` - maxBuffer without constant |
| [`src/constants.ts`](src/constants.ts) | Some colors defined, but not all |

**Refactoring:** Create a `constants.ts` for tool configuration:
```typescript
export const SHELL_TOOL = {
  DEFAULT_TIMEOUT: 30000,
  MAX_BUFFER: 1024 * 1024,
} as const;
```

### 2. Long Methods

| Function | Lines | Issue |
|----------|-------|-------|
| [`agentLoop`](src/agent/loop.ts:42) | ~170 | Multiple nesting levels, many responsibilities |
| [`sendMessage`](src/hooks/useChat.ts:39) | ~100 | Too many steps in one function |

### 3. Feature Envy

**Location:** [`useChat.ts`](src/hooks/useChat.ts)

The hook manipulates message content extensively, showing envy for the message data structure.

### 4. Deprecated Code

| Item | Location | Issue |
|------|----------|-------|
| `Tool` type | [`loop.ts:20`](src/agent/loop.ts:20) | Deprecated alias still exported |
| `streamChat` | [`loop.ts:199`](src/agent/loop.ts:199) | Deprecated function |
| `defineTool` | [`registry.ts:77`](src/tools/registry.ts:77) | Deprecated alias |

### 5. Performance Issue - Command Registry

**Location:** [`src/app.tsx:29`](src/app.tsx:29)

```typescript
const commandRegistry = createCommandRegistry();
```

Creates a new registry on every render. Should be memoized or moved outside component.

---

## Recommendations Priority

### High Priority (Should Fix)
1. Fix command registry creation in `app.tsx` (performance)
2. Remove deprecated code exports
3. Extract magic numbers into constants
4. Fix `resolveCommand` in `commands/index.ts`

### Medium Priority (Should Consider)
5. Split `AppContext.tsx` responsibilities
6. Implement provider registry pattern in `provider.ts`
7. Extract orchestration logic from `useChat.ts`
8. Split `console-capture.ts` concerns

### Lower Priority (Nice to Have)
9. Improve type specificity in `AgentTool`
10. Split `StreamChatConfig` callbacks
11. Implement dependency injection in hooks
