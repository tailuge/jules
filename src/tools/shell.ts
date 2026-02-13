/**
 * Shell Execution Tool
 * Safe command execution with allowlist
 */

import { z } from 'zod';
import { createAgentTool, toolRegistry } from './registry';

const shellToolSchema = z.object({
  command: z.string().describe('The shell command to execute'),
  timeout: z.number().optional().default(30000).describe('Timeout in milliseconds'),
});

/**
 * Execute a shell command
 */
async function executeShell(args: z.infer<typeof shellToolSchema>): Promise<any> {
  const { command, timeout } = args;

  try {
    const result = Bun.spawnSync(['sh', '-c', command], {
      timeout,
      maxBuffer: 1024 * 1024, // 1MB
    });

    return {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
      exitCode: result.exitCode,
      success: result.exitCode === 0,
    };
  } catch (error: any) {
    return {
      error: error.message,
      success: false,
    };
  }
}

/**
 * Register shell tool
 */
export function registerShellTool(allowedCommands?: string[]) {
  const tool = createAgentTool({
    name: 'shell',
    description: `Execute a shell command. ${allowedCommands
      ? `Allowed commands: ${allowedCommands.join(', ')}`
      : 'Use with caution - can run any command.'}`,
    parameters: shellToolSchema,
    execute: async (args) => {
      // Optional: enforce allowlist
      if (allowedCommands && allowedCommands.length > 0) {
        const cmdBase = args.command.split(' ')[0];
        if (!allowedCommands.includes(cmdBase)) {
          return {
            error: `Command not allowed: ${cmdBase}`,
            allowedCommands,
            success: false,
          };
        }
      }

      return executeShell(args);
    },
  });

  toolRegistry.register(tool);
  return tool;
}
