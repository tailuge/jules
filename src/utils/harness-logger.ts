import { addCapturedMessage } from "./console-capture";
import type { ModelMessage } from "ai";

export function isHarnessFile(path: string): boolean {
  const fileName = path.split("/").pop() ?? "";
  return fileName === "self.md" || fileName === "memories.md";
}

export function logHarnessRequest(
  systemPrompt: string | undefined,
  messages: ModelMessage[],
): void {
  addCapturedMessage("log", "[Harness] === REQUEST PAYLOAD ===");
  if (systemPrompt) {
    addCapturedMessage("log", `[Harness] System Prompt:\n${systemPrompt}`);
  }
  addCapturedMessage(
    "log",
    `[Harness] Messages:\n${JSON.stringify(messages, null, 2)}`,
  );
}

export function logHarnessToolCall(
  toolName: string,
  args: Record<string, unknown>,
): void {
  addCapturedMessage(
    "log",
    `[Harness] Tool Call: ${toolName}\nArgs: ${JSON.stringify(args, null, 2)}`,
  );
}

export function logHarnessToolResult(toolName: string, result: unknown): void {
  addCapturedMessage(
    "log",
    `[Harness] Tool Result: ${toolName}\n${JSON.stringify(result, null, 2)}`,
  );
}

export function logHarnessResponse(response: {
  text?: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
}): void {
  addCapturedMessage("log", "[Harness] === RESPONSE PAYLOAD ===");
  if (response.text) {
    addCapturedMessage("log", `[Harness] Text Response:\n${response.text}`);
  }
  if (response.toolCalls && response.toolCalls.length > 0) {
    addCapturedMessage(
      "log",
      `[Harness] Tool Calls:\n${JSON.stringify(response.toolCalls, null, 2)}`,
    );
  }
}
