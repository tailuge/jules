/**
 * Logging Utilities
 * Simple structured logging for the agent
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Simple logger with colors
 */
export const logger = {
  debug(message: string, data?: any) {
    log('debug', message, data);
  },

  info(message: string, data?: any) {
    log('info', message, data);
  },

  warn(message: string, data?: any) {
    log('warn', message, data);
  },

  error(message: string, data?: any) {
    log('error', message, data);
  },
};

function log(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];

  const prefix = `${color}[${level.toUpperCase()}]${RESET}`;
  const time = `\x1b[90m${timestamp}\x1b[0m`;

  if (data) {
    console.log(`${prefix} ${time} ${message}`, data);
  } else {
    console.log(`${prefix} ${time} ${message}`);
  }
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
