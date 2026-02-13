import { createSignal } from "solid-js";

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

function captureMessage(level: LogLevel, ...args: unknown[]): void {
  const message = formatArgs(args);
  const entry: CapturedMessage = {
    level,
    message,
    timestamp: new Date(),
  };
  setCapturedMessages((prev) => [...prev, entry]);
}

export function initConsoleCapture(): void {
  if (isCapturing) return;

  originalConsoleLog = console.log;
  originalConsoleError = console.error;
  originalConsoleWarn = console.warn;

  console.log = (...args: unknown[]) => {
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
