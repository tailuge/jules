import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { existsSync } from "fs";
import { rm, writeFile } from "fs/promises";
import { join } from "path";
import {
  createSessionFile,
  getDefaultSessionsDir,
  listSessionFiles,
} from "./session";

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

  describe("listSessionFiles", () => {
    it("returns empty array when directory doesn't exist", async () => {
      const files = await listSessionFiles(join(TEMP_DIR, "nonexistent"));
      expect(files).toEqual([]);
    });

    it("returns empty array when no session files exist", async () => {
      await rm(TEMP_DIR, { recursive: true }).catch(() => {});
      const { mkdir } = await import("fs/promises");
      await mkdir(TEMP_DIR, { recursive: true });
      await writeFile(join(TEMP_DIR, "other.txt"), "test");

      const files = await listSessionFiles(TEMP_DIR);
      expect(files).toEqual([]);
    });

    it("returns session files sorted by date descending", async () => {
      await rm(TEMP_DIR, { recursive: true }).catch(() => {});
      const { mkdir } = await import("fs/promises");
      await mkdir(TEMP_DIR, { recursive: true });

      await writeFile(
        join(TEMP_DIR, "session_2026-02-14T10-00-00.md"),
        "first",
      );
      await writeFile(
        join(TEMP_DIR, "session_2026-02-14T12-30-00.md"),
        "second",
      );
      await writeFile(
        join(TEMP_DIR, "session_2026-02-13T09-00-00.md"),
        "third",
      );

      const files = await listSessionFiles(TEMP_DIR);

      expect(files.length).toBe(3);
      expect(files[0].filename).toBe("session_2026-02-14T12-30-00.md");
      expect(files[1].filename).toBe("session_2026-02-14T10-00-00.md");
      expect(files[2].filename).toBe("session_2026-02-13T09-00-00.md");
    });

    it("includes full path in result", async () => {
      await rm(TEMP_DIR, { recursive: true }).catch(() => {});
      const { mkdir } = await import("fs/promises");
      await mkdir(TEMP_DIR, { recursive: true });
      await writeFile(join(TEMP_DIR, "session_2026-02-14T10-00-00.md"), "test");

      const files = await listSessionFiles(TEMP_DIR);

      expect(files.length).toBe(1);
      expect(files[0].path).toBe(
        join(TEMP_DIR, "session_2026-02-14T10-00-00.md"),
      );
    });

    it("ignores files not matching session pattern", async () => {
      await rm(TEMP_DIR, { recursive: true }).catch(() => {});
      const { mkdir } = await import("fs/promises");
      await mkdir(TEMP_DIR, { recursive: true });

      await writeFile(
        join(TEMP_DIR, "session_2026-02-14T10-00-00.md"),
        "valid",
      );
      await writeFile(join(TEMP_DIR, "not-a-session.md"), "invalid");
      await writeFile(join(TEMP_DIR, "session_invalid.md"), "invalid");
      await writeFile(join(TEMP_DIR, "readme.txt"), "invalid");

      const files = await listSessionFiles(TEMP_DIR);
      expect(files.length).toBe(1);
      expect(files[0].filename).toBe("session_2026-02-14T10-00-00.md");
    });
  });
});
