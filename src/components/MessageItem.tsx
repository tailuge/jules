import { DisplayItem } from "../types";
import { providerColors } from "../constants";
import { Config } from "../config/schema";
import { Accessor } from "solid-js";

interface MessageItemProps {
  item: DisplayItem;
  config: Accessor<Config | null>;
  isStreaming: Accessor<boolean>;
}

export function MessageItem(props: MessageItemProps) {
  const item = props.item;

  if (item.type === "console") {
    const levelColors = {
      error: "#FF0000",
      warn: "#FFFF00",
      log: "#00FFFF",
    };
    const levelPrefixes = {
      error: "[ERROR]",
      warn: "[WARN]",
      log: "[LOG]",
    };
    return (
      <box flexDirection="row">
        <text fg={levelColors[item.message.level]}>
          {levelPrefixes[item.message.level]}{" "}
        </text>
        <text fg="#FFFFFF">{item.message.message}</text>
      </box>
    );
  }

  const msg = item.message;
  if (msg.role === "user") {
    return (
      <box flexDirection="row">
        <text fg="#888888">{"You: "}</text>
        <text fg="#FFFFFF">{msg.content as string}</text>
      </box>
    );
  }

  return (
    <box flexDirection="row">
      <text
        fg={
          providerColors[props.config()?.model.provider || "custom"] ||
          "#00FFFF"
        }
      >
        {props.config()?.model.name}:{" "}
      </text>
      <text fg="#FFFFFF">
        {(msg.content as string) || (props.isStreaming() ? "..." : "")}
      </text>
    </box>
  );
}
