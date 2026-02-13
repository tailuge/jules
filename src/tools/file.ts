/**
 * File System Tool
 * Read, write, and manage files
 */

import { z } from 'zod';
import { defineTool, toolRegistry } from './registry';

const readFileSchema = z.object({
  path: z.string().describe('The file path to read'),
});

const writeFileSchema = z.object({
  path: z.string().describe('The file path to write'),
  content: z.string().describe('The content to write'),
});

const listDirSchema = z.object({
  path: z.string().describe('The directory path to list'),
});

/**
 * Read file tool
 */
const readFileTool = defineTool({
  name: 'read_file',
  description: 'Read the contents of a file',
  parameters: readFileSchema,
  execute: async ({ path }) => {
    try {
      const file = Bun.file(path);
      const exists = await file.exists();

      if (!exists) {
        return { error: 'File not found', path, success: false };
      }

      const content = await file.text();
      return {
        content,
        path,
        size: content.length,
        success: true,
      };
    } catch (error: any) {
      return { error: error.message, path, success: false };
    }
  },
});

/**
 * Write file tool
 */
const writeFileTool = defineTool({
  name: 'write_file',
  description: 'Write content to a file (creates or overwrites)',
  parameters: writeFileSchema,
  execute: async ({ path, content }) => {
    try {
      await Bun.write(path, content);
      return {
        path,
        bytesWritten: content.length,
        success: true,
      };
    } catch (error: any) {
      return { error: error.message, path, success: false };
    }
  },
});

/**
 * List directory tool
 */
const listDirTool = defineTool({
  name: 'list_dir',
  description: 'List files and directories in a path',
  parameters: listDirSchema,
  execute: async ({ path }) => {
    try {
      const dir = await Array.fromAsync(
        new Bun.Glob('*').scan({ cwd: path, onlyFiles: false })
      );

      const files = await Promise.all(
        dir.map(async (name) => {
          const fullPath = `${path}/${name}`;
          const file = Bun.file(fullPath);
          const isDir = file.size === undefined;
          return {
            name,
            isDirectory: isDir,
            path: fullPath,
          };
        })
      );

      return {
        path,
        entries: files,
        count: files.length,
        success: true,
      };
    } catch (error: any) {
      return { error: error.message, path, success: false };
    }
  },
});

/**
 * Register all file tools
 */
export function registerFileTools() {
  toolRegistry.register(readFileTool);
  toolRegistry.register(writeFileTool);
  toolRegistry.register(listDirTool);
}
