import { ModelMessage } from "ai";
import { CapturedMessage } from "./utils/console-capture";

export type TimestampedMessage = ModelMessage & {
  timestamp: Date;
};

export type DisplayItem =
  | { type: "chat"; message: TimestampedMessage }
  | { type: "console"; message: CapturedMessage };
