import { ModelMessage } from "ai";
import { CapturedMessage } from "./utils/console-capture";

export type { AgentTool, AgentLoopConfig, LoopEvent } from "./agent/loop";
export type { Provider, ProviderType, ModelConfig } from "./agent/provider";
export type { Config } from "./config/schema";

export type TimestampedMessage = ModelMessage & {
  timestamp: Date;
};

export type DisplayItem =
  | { type: "chat"; message: TimestampedMessage }
  | { type: "console"; message: CapturedMessage };
