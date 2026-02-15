import { describe, test, expect, beforeEach } from "bun:test";
import { toolRegistry } from "./registry";
import { registerShellTool } from "./shell";

describe("Shell Tool", () => {
  beforeEach(() => {
    registerShellTool();
  });

  test("executes a simple command", async () => {
    const shellTool = toolRegistry.get("shell");
    expect(shellTool).toBeDefined();

    const result = await shellTool!.execute({ command: "echo 'hello'" });
    expect(result.success).toBe(true);
    expect(result.stdout.trim()).toBe("hello");
  });

  test("returns exit code for invalid command", async () => {
    const shellTool = toolRegistry.get("shell");
    const result = await shellTool!.execute({
      command: "non_existent_command_12345",
    });
    // Bun.spawnSync for non-existent command might return exitCode 127 or similar
    expect(result.success).toBe(false);
    expect(result.exitCode).not.toBe(0);
  });

  test("respects allowedCommands list", async () => {
    // Re-register with allowlist
    registerShellTool(["ls", "echo"]);
    const shellTool = toolRegistry.get("shell");

    const okResult = await shellTool!.execute({ command: "ls" });
    expect(okResult.success).toBe(true);

    const failResult = await shellTool!.execute({ command: "rm -rf /" });
    expect(failResult.success).toBe(false);
    expect(failResult.error).toContain("Command not allowed");
  });
});
