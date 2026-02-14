import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { toolRegistry, createAgentTool } from "./registry";
import { registerFileTools } from "./file";
import { homedir } from "os";
import { join } from "path";
import { unlink, mkdir, rmdir } from "fs/promises";

describe("File Tools", () => {
  beforeEach(() => {
    registerFileTools();
  });

  describe("read_file", () => {
    const testFilePath = join(homedir(), "test_file_jules.txt");

    beforeEach(async () => {
      await Bun.write(testFilePath, "Hello World from Jules");
    });

    afterEach(async () => {
      try {
        await unlink(testFilePath);
      } catch {}
    });

    test("expands ~ in path", async () => {
      const readFileTool = toolRegistry.get("read_file");
      expect(readFileTool).toBeDefined();

      const result = await readFileTool!.execute({ path: "~/test_file_jules.txt" });
      expect(result.success).toBe(true);
      expect(result.content).toBe("Hello World from Jules");
      expect(result.path).toBe(testFilePath);
    });

    test("handles missing path with error", async () => {
      const readFileTool = toolRegistry.get("read_file");
      // Use any to bypass type check for testing runtime behavior
      const result = await readFileTool!.execute({} as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Path is required");
    });

    test("returns error for non-existent file with expanded path", async () => {
        const readFileTool = toolRegistry.get("read_file");
        const result = await readFileTool!.execute({ path: "~/non_existent_file_jules.txt" });
        expect(result.success).toBe(false);
        expect(result.error).toBe("File not found");
        expect(result.path).toBe(join(homedir(), "non_existent_file_jules.txt"));
    });
  });

  describe("write_file", () => {
    const testFilePath = join(homedir(), "test_write_jules.txt");

    afterEach(async () => {
      try {
        await unlink(testFilePath);
      } catch {}
    });

    test("expands ~ in path for write_file", async () => {
      const writeFileTool = toolRegistry.get("write_file");
      const result = await writeFileTool!.execute({
        path: "~/test_write_jules.txt",
        content: "New Content"
      });

      expect(result.success).toBe(true);
      expect(result.path).toBe(testFilePath);

      const savedContent = await Bun.file(testFilePath).text();
      expect(savedContent).toBe("New Content");
    });
  });

  describe("list_dir", () => {
      const dummyFile = join(homedir(), "dummy_jules.txt");

      beforeEach(async () => {
          await Bun.write(dummyFile, "dummy");
      });

      afterEach(async () => {
          try {
              await unlink(dummyFile);
          } catch {}
      });

      test("expands ~ in path for list_dir", async () => {
          const listDirTool = toolRegistry.get("list_dir");
          const result = await listDirTool!.execute({ path: "~" });

          expect(result.success).toBe(true);
          expect(result.path).toBe(homedir());
          expect(result.entries.length).toBeGreaterThan(0);
      });
  });
});
