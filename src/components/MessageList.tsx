import { For, Show, Accessor } from "solid-js";
import { DisplayItem } from "../types";
import { Config } from "../config/schema";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  displayItems: Accessor<DisplayItem[]>;
  config: Accessor<Config | null>;
  isStreaming: Accessor<boolean>;
}

export function MessageList(props: MessageListProps) {
  return (
    <scrollbox flexGrow={1} padding={1}>
      <Show
        when={props.displayItems().length > 0}
        fallback={
          <box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <text fg="#666666">Welcome to TaiLuGe TUI Agent</text>
            <text fg="#444444" marginTop={1}>
              Type a message to start or /help for commands
            </text>
          </box>
        }
      >
        <For each={props.displayItems()}>
          {(item) => (
            <box flexDirection="column">
              <MessageItem
                item={item}
                config={props.config}
                isStreaming={props.isStreaming}
              />
            </box>
          )}
        </For>
      </Show>
    </scrollbox>
  );
}
