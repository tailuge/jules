import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { createRoot } from "solid-js";
import {
  initConsoleCapture,
  restoreConsole,
  getCapturedMessages,
  clearCapturedMessages,
  type CapturedMessage,
} from "./console-capture";

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe("console-capture", () => {
  beforeEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  afterEach(() => {
    restoreConsole();
  });

  it("captureMessage updates signal correctly", () => {
    createRoot((dispose) => {
      clearCapturedMessages();
      initConsoleCapture();
      clearCapturedMessages();

      console.log("test message");

      const messages = getCapturedMessages()();
      expect(messages.length).toBe(1);
      expect(messages[0].message).toBe("test message");
      expect(messages[0].level).toBe("log");

      dispose();
    });
  });

  it("console.log is intercepted and messages appear in getCapturedMessages", () => {
    createRoot((dispose) => {
      clearCapturedMessages();
      initConsoleCapture();
      clearCapturedMessages();

      console.log("hello world");

      const messages = getCapturedMessages()();
      expect(messages.length).toBe(1);
      expect(messages[0].message).toBe("hello world");
      expect(messages[0].level).toBe("log");

      dispose();
    });
  });

  it("multiple messages are captured in order", () => {
    createRoot((dispose) => {
      clearCapturedMessages();
      initConsoleCapture();
      clearCapturedMessages();

      console.log("first");
      console.error("second");
      console.warn("third");

      const messages = getCapturedMessages()();
      expect(messages.length).toBe(3);
      expect(messages[0].message).toBe("first");
      expect(messages[0].level).toBe("log");
      expect(messages[1].message).toBe("second");
      expect(messages[1].level).toBe("error");
      expect(messages[2].message).toBe("third");
      expect(messages[2].level).toBe("warn");

      dispose();
    });
  });

  it("clearCapturedMessages clears the signal", () => {
    createRoot((dispose) => {
      clearCapturedMessages();
      initConsoleCapture();
      clearCapturedMessages();

      console.log("message to clear");

      let messages = getCapturedMessages()();
      expect(messages.length).toBe(1);

      clearCapturedMessages();

      messages = getCapturedMessages()();
      expect(messages.length).toBe(0);

      dispose();
    });
  });
});
