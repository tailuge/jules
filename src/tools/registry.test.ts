import { describe, test, expect, beforeEach } from "bun:test";
import { ToolRegistry, defineTool } from "./registry";
import { z } from "zod";
import type { Tool } from "../agent/loop";

describe("ToolRegistry", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe("register", () => {
    test("registers a tool", () => {
      const tool: Tool = {
        name: "test_tool",
        description: "A test tool",
        parameters: z.object({ input: z.string() }),
        execute: async () => "result",
      };

      registry.register(tool);

      expect(registry.has("test_tool")).toBe(true);
    });

    test("overwrites existing tool with same name", () => {
      const tool1: Tool = {
        name: "duplicate",
        description: "First",
        parameters: z.object({}),
        execute: async () => "first",
      };
      const tool2: Tool = {
        name: "duplicate",
        description: "Second",
        parameters: z.object({}),
        execute: async () => "second",
      };

      registry.register(tool1);
      registry.register(tool2);

      const retrieved = registry.get("duplicate");
      expect(retrieved?.description).toBe("Second");
    });
  });

  describe("get", () => {
    test("returns tool by name", () => {
      const tool: Tool = {
        name: "fetch",
        description: "Fetch URL",
        parameters: z.object({ url: z.string() }),
        execute: async () => "content",
      };

      registry.register(tool);

      expect(registry.get("fetch")).toBe(tool);
    });

    test("returns undefined for non-existent tool", () => {
      expect(registry.get("nonexistent")).toBeUndefined();
    });
  });

  describe("getAll", () => {
    test("returns empty object when no tools registered", () => {
      expect(registry.getAll()).toEqual({});
    });

    test("returns all registered tools as object", () => {
      const tool1: Tool = {
        name: "tool1",
        description: "First tool",
        parameters: z.object({}),
        execute: async () => null,
      };
      const tool2: Tool = {
        name: "tool2",
        description: "Second tool",
        parameters: z.object({}),
        execute: async () => null,
      };

      registry.register(tool1);
      registry.register(tool2);

      const all = registry.getAll();
      expect(Object.keys(all)).toHaveLength(2);
      expect(all["tool1"]).toBe(tool1);
      expect(all["tool2"]).toBe(tool2);
    });
  });

  describe("list", () => {
    test("returns empty array when no tools", () => {
      expect(registry.list()).toEqual([]);
    });

    test("returns array of tool names", () => {
      registry.register({
        name: "alpha",
        description: "",
        parameters: z.object({}),
        execute: async () => null,
      });
      registry.register({
        name: "beta",
        description: "",
        parameters: z.object({}),
        execute: async () => null,
      });

      const names = registry.list();
      expect(names).toContain("alpha");
      expect(names).toContain("beta");
    });
  });

  describe("has", () => {
    test("returns true for registered tool", () => {
      registry.register({
        name: "exists",
        description: "",
        parameters: z.object({}),
        execute: async () => null,
      });

      expect(registry.has("exists")).toBe(true);
    });

    test("returns false for unregistered tool", () => {
      expect(registry.has("missing")).toBe(false);
    });
  });

  describe("remove", () => {
    test("removes registered tool", () => {
      registry.register({
        name: "removable",
        description: "",
        parameters: z.object({}),
        execute: async () => null,
      });

      expect(registry.has("removable")).toBe(true);

      const result = registry.remove("removable");

      expect(result).toBe(true);
      expect(registry.has("removable")).toBe(false);
    });

    test("returns false when tool does not exist", () => {
      expect(registry.remove("nonexistent")).toBe(false);
    });
  });
});

describe("defineTool", () => {
  test("creates tool with inferred types", () => {
    const schema = z.object({
      path: z.string(),
      recursive: z.boolean().optional(),
    });

    const tool = defineTool({
      name: "read_file",
      description: "Read a file from disk",
      parameters: schema,
      execute: async (args) => {
        return `Reading ${args.path}`;
      },
    });

    expect(tool.name).toBe("read_file");
    expect(tool.description).toBe("Read a file from disk");
    expect(tool.parameters).toBe(schema);
  });

  test("tool execute receives validated args", async () => {
    const tool = defineTool({
      name: "echo",
      description: "Echo input",
      parameters: z.object({ message: z.string() }),
      execute: async (args) => args.message,
    });

    const result = await tool.execute({ message: "hello" });
    expect(result).toBe("hello");
  });
});
