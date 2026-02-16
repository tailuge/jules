import { createSignal } from "solid-js";
import { appendFileSync, writeFileSync } from "node:fs";

export type LogLevel = "log" | "error" | "warn";

export interface CapturedMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
}

const DEBUG_LOG_PATH = "/tmp/tailuge-debug.log";

const [capturedMessages, setCapturedMessages] = createSignal<CapturedMessage[]>(
  [],
);

let originalConsoleLog: typeof console.log | null = null;
let originalConsoleError: typeof console.error | null = null;
let originalConsoleWarn: typeof console.warn | null = null;
let unhandledRejectionHandler:
  | ((reason: unknown, promise: Promise<unknown>) => void)
  | null = null;
let uncaughtExceptionHandler:
  | ((error: Error, origin: NodeJS.UncaughtExceptionOrigin) => void)
  | null = null;
let isCapturing = false;

function stringifyArg(arg: unknown): string {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (typeof arg === "string") return arg;
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
  }
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

function formatArgs(args: unknown[]): string {
  return args.map(stringifyArg).join(" ");
}

export function addCapturedMessage(level: LogLevel, message: string): void {
  const timestamp = new Date();
  const entry: CapturedMessage = {
    level,
    message,
    timestamp,
  };

  // Immediate write to debug log file
  try {
    const logLine = `[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    appendFileSync(DEBUG_LOG_PATH, logLine);
  } catch (err) {
    // Ignore log file errors
  }

  setCapturedMessages((prev) => {
    return [...prev, entry];
  });
}

function captureMessage(level: LogLevel, ...args: unknown[]): void {
  addCapturedMessage(level, formatArgs(args));
}

export function initConsoleCapture(): void {
  if (isCapturing) {
    return;
  }

  // Clear/Initialize debug log
  try {
    writeFileSync(DEBUG_LOG_PATH, `--- SESSION STARTED ${new Date().toISOString()} ---\n`);
  } catch (err) {
    // Ignore errors
  }

  originalConsoleLog = console.log;
  originalConsoleError = console.error;
  originalConsoleWarn = console.warn;

  console.log = (...args: unknown[]) => {
    const formatted = formatArgs(args);
    addCapturedMessage("log", formatted);
    if (originalConsoleLog) {
      originalConsoleLog.apply(console, args);
    }
  };

  console.error = (...args: unknown[]) => {
    const formatted = formatArgs(args);
    addCapturedMessage("error", formatted);
    if (originalConsoleError) {
      originalConsoleError.apply(console, args);
    }
  };

  console.warn = (...args: unknown[]) => {
    const formatted = formatArgs(args);
    addCapturedMessage("warn", formatted);
    if (originalConsoleWarn) {
      originalConsoleWarn.apply(console, args);
    }
  };

  isCapturing = true;
}

export function restoreConsole(): void {
  if (!isCapturing) return;

  if (originalConsoleLog) console.log = originalConsoleLog;
  if (originalConsoleError) console.error = originalConsoleError;
  if (originalConsoleWarn) console.warn = originalConsoleWarn;

  originalConsoleLog = null;
  originalConsoleError = null;
  originalConsoleWarn = null;
  isCapturing = false;
}

export function getCapturedMessages(): () => CapturedMessage[] {
  return capturedMessages;
}

export function clearCapturedMessages(): void {
  setCapturedMessages([]);
}

export function initRuntimeErrorCapture(): void {
  if (unhandledRejectionHandler || uncaughtExceptionHandler) {
    return;
  }

  unhandledRejectionHandler = (reason: unknown) => {
    addCapturedMessage("error", `Unhandled rejection: ${stringifyArg(reason)}`);
  };
  uncaughtExceptionHandler = (error: Error) => {
    addCapturedMessage("error", `Uncaught exception: ${stringifyArg(error)}`);
  };

  process.on("unhandledRejection", unhandledRejectionHandler);
  process.on("uncaughtException", uncaughtExceptionHandler);
}

export function restoreRuntimeErrorCapture(): void {
  if (unhandledRejectionHandler) {
    process.off("unhandledRejection", unhandledRejectionHandler);
    unhandledRejectionHandler = null;
  }

  if (uncaughtExceptionHandler) {
    process.off("uncaughtException", uncaughtExceptionHandler);
    uncaughtExceptionHandler = null;
  }
}
