import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import { join } from "path";
import { createSessionFile, getDefaultSessionsDir } from "./session";

const TEMP_DIR = join(import.meta.dir, ".temp-session-test");

describe("session", () => {
  beforeEach(async () => {
    if (existsSync(TEMP_DIR)) {
      await rm(TEMP_DIR, { recursive: true });
    }
  });

  afterEach(async () => {
    if (existsSync(TEMP_DIR)) {
      await rm(TEMP_DIR, { recursive: true });
    }
  });

  it("getDefaultSessionsDir returns expected path", () => {
    const path = getDefaultSessionsDir();
    expect(path).toContain(".tui-agent");
    expect(path).toContain("sessions");
  });

  it("createSessionFile creates file with correct naming pattern", async () => {
    const filePath = await createSessionFile(TEMP_DIR);

    expect(existsSync(filePath)).toBe(true);

    const fileName = filePath.split("/").pop()!;
    expect(fileName).toMatch(
      /^session_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.md$/,
    );
  });

  it("createSessionFile creates directory if it doesn't exist", async () => {
    expect(existsSync(TEMP_DIR)).toBe(false);

    const filePath = await createSessionFile(TEMP_DIR);

    expect(existsSync(TEMP_DIR)).toBe(true);
    expect(existsSync(filePath)).toBe(true);
  });

  it("createSessionFile returns the path to the created file", async () => {
    const filePath = await createSessionFile(TEMP_DIR);

    expect(filePath).toContain(TEMP_DIR);
    expect(filePath).toMatch(/\.md$/);
  });
});
