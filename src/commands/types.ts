import type { Accessor, Setter } from "solid-js";
import type { Config } from "@/config/schema";
import type { TimestampedMessage } from "@/types";

export interface CommandContext {
  config: Accessor<Config | null>;
  messages: Accessor<TimestampedMessage[]>;
  setMessages: Setter<TimestampedMessage[]>;
  addCapturedMessage: (type: "log" | "warn" | "error", message: string) => void;
  clearCapturedMessages: () => void;
  openSessionSelector: () => void;
  exitApp: () => void;
}

export interface Command {
  name: string;
  aliases: string[];
  description: string;
  execute: (ctx: CommandContext) => Promise<void> | void;
}

export interface CommandResult {
  handled: boolean;
  shouldContinue?: boolean;
}
