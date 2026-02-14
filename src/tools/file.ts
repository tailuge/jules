/**
 * File System Tool
 * Read, write, and manage files
 */

import { z } from 'zod';
import { homedir } from 'os';
import { join } from 'path';
import { createAgentTool, toolRegistry } from './registry';

const readFileSchema = z.object({
  path: z.string().describe('The file path to read (supports ~ for home directory)'),
  line_ranges: z.array(z.array(z.number())).optional().describe('Line ranges to read (e.g., [[1, 10], [20, 30]])'),
});

const writeFileSchema = z.object({
  path: z.string().describe('The file path to write'),
  content: z.string().describe('The content to write'),
});

const listDirSchema = z.object({
  path: z.string().describe('The directory path to list'),
});

/**
 * Resolve path, expanding ~ to home directory
 */
function resolvePath(path: string): string {
  if (path.startsWith('~/')) {
    return join(homedir(), path.slice(2));
  }
  if (path === '~') {
    return homedir();
  }
  return path;
}

/**
 * Read file tool
 */
const readFileTool = createAgentTool({
  name: 'read_file',
  description: 'Read the contents of a file, optionally with line ranges',
  parameters: readFileSchema,
  execute: async ({ path, line_ranges }) => {
    if (!path) {
      return { error: 'Path is required', success: false };
    }

    try {
      const resolvedPath = resolvePath(path);
      const file = Bun.file(resolvedPath);
      const exists = await file.exists();

      if (!exists) {
        return { error: 'File not found', path: resolvedPath, success: false };
      }

      let content = await file.text();

      if (line_ranges && line_ranges.length > 0) {
        const lines = content.split('\n');
        const selectedLines: string[] = [];
        
        for (const [start, end] of line_ranges) {
          for (let i = start; i <= end && i <= lines.length; i++) {
            selectedLines.push(lines[i - 1]);
          }
        }
        
        content = selectedLines.join('\n');
      }

      return {
        content,
        path: resolvedPath,
        originalPath: path,
        size: content.length,
        success: true,
      };
    } catch (error: any) {
      return { error: error.message, path: resolvePath(path), success: false };
    }
  },
});

/**
 * Write file tool
 */
const writeFileTool = createAgentTool({
  name: 'write_file',
  description: 'Write content to a file (creates or overwrites)',
  parameters: writeFileSchema,
  execute: async ({ path, content }) => {
    if (!path) {
      return { error: 'Path is required', success: false };
    }

    try {
      const resolvedPath = resolvePath(path);
      await Bun.write(resolvedPath, content);
      return {
        path: resolvedPath,
        originalPath: path,
        bytesWritten: content.length,
        success: true,
      };
    } catch (error: any) {
      return { error: error.message, path: resolvePath(path), success: false };
    }
  },
});

/**
 * List directory tool
 */
const listDirTool = createAgentTool({
  name: 'list_dir',
  description: 'List files and directories in a path',
  parameters: listDirSchema,
  execute: async ({ path }) => {
    if (!path) {
      return { error: 'Path is required', success: false };
    }

    try {
      const resolvedPath = resolvePath(path);
      const dir = await Array.fromAsync(
        new Bun.Glob('*').scan({ cwd: resolvedPath, onlyFiles: false })
      );

      const files = await Promise.all(
        dir.map(async (name) => {
          const fullPath = join(resolvedPath, name);
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
        path: resolvedPath,
        originalPath: path,
        entries: files,
        count: files.length,
        success: true,
      };
    } catch (error: any) {
      return { error: error.message, path: resolvePath(path), success: false };
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
