import { appendFileSync, writeFileSync } from "node:fs";
import { createSignal } from "solid-js";

const LOG_FILE = "/tmp/tailuge-debug.log";

export type LogLevel = "log" | "error" | "warn";

export interface CapturedMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
}

const [capturedMessages, setCapturedMessages] = createSignal<CapturedMessage[]>(
  [],
);

let originalConsoleLog: typeof console.log | null = null;
let originalConsoleError: typeof console.error | null = null;
let originalConsoleWarn: typeof console.warn | null = null;
let isCapturing = false;

function debugLog(msg: string): void {
  const line = `${new Date().toISOString()} [DEBUG] ${msg}\n`;
  appendFileSync(LOG_FILE, line);
}

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
  debugLog(`about to call setCapturedMessages, current length: ${capturedMessages().length}`);
  setCapturedMessages((prev) => {
    debugLog(`setCapturedMessages callback, prev length: ${prev.length}`);
    return [...prev, entry];
  });
  debugLog(`setCapturedMessages done, new length: ${capturedMessages().length}`);
  
  const logLine = `${timestamp.toISOString()} [${level.toUpperCase()}] ${message}\n`;
  debugLog(`writing to file: ${logLine.trim()}`);
  appendFileSync(LOG_FILE, logLine);
}

function captureMessage(level: LogLevel, ...args: unknown[]): void {
  debugLog(`captureMessage called: ${level}`);
  addCapturedMessage(level, formatArgs(args));
}

export function initConsoleCapture(): void {
  debugLog("initConsoleCapture called, isCapturing: " + isCapturing);
  if (isCapturing) {
    console.log("Console capture already active, skipping re-init");
    return;
  }

  try {
    writeFileSync(LOG_FILE, "");
    debugLog("log file cleared");
  } catch (e) {
    debugLog("failed to clear log file: " + e);
  }

  originalConsoleLog = console.log;
  originalConsoleError = console.error;
  originalConsoleWarn = console.warn;
  debugLog("original console saved");

  console.log = (...args: unknown[]) => {
    debugLog("custom console.log called with " + args.length + " args");
    captureMessage("log", ...args);
    originalConsoleLog!.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    captureMessage("error", ...args);
    originalConsoleError!.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    captureMessage("warn", ...args);
    originalConsoleWarn!.apply(console, args);
  };

  isCapturing = true;
  debugLog("about to call console.log('Console capture active')");
  console.log("Console capture active");
  debugLog("done calling console.log");
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
