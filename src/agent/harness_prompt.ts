/**
 * Harness Prompt
 * System prompt instructions for reading context files
 */

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
