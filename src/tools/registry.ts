/**
 * Tool Registry
 * Central management for agent tools
 */

import { z } from 'zod';
import type { AgentTool } from '../agent/loop';

export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  /**
   * Register a new tool
   */
  register(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   */
  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): Record<string, AgentTool> {
    return Object.fromEntries(this.tools);
  }

  /**
   * List tool names
   */
  list(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Remove a tool
   */
  remove(name: string): boolean {
    return this.tools.delete(name);
  }
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry();

export function createAgentTool<T extends z.ZodType<any>>(
  config: {
    name: string;
    description: string;
    parameters: T;
    execute: (args: z.infer<T>) => Promise<any>;
  }
): AgentTool {
  return {
    name: config.name,
    description: config.description,
    parameters: config.parameters,
    execute: config.execute,
  };
}

/**
 * @deprecated Use createAgentTool instead
 */
export const defineTool = createAgentTool;
