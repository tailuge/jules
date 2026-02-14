import { Accessor, Show, createMemo } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import type { SessionFile } from "../utils/session";

interface SessionSelectorProps {
  sessions: Accessor<SessionFile[]>;
  onSelect: (path: string) => Promise<void>;
  onClose: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SessionSelector(props: SessionSelectorProps) {
  useKeyboard((key) => {
    if (key.name === "escape") {
      props.onClose();
    }
  });

  const options = createMemo(() => {
    return props.sessions().map((session) => ({
      name: formatDate(session.date),
      description: session.filename,
      value: session.path,
    }));
  });

  return (
    <box
      position="absolute"
      top={2}
      left={2}
      right={2}
      bottom={2}
      backgroundColor="#1a1a1a"
      border
      borderColor="#444444"
    >
      <box flexDirection="column" padding={1} height="100%">
        <text fg="#888888" marginBottom={1}>
          Sessions (ESC to close, Enter to view)
        </text>
        <Show
          when={options().length > 0}
          fallback={<text fg="#666666">No sessions found</text>}
        >
          <select
            options={options()}
            onSelect={(_index, option) => {
              if (option) {
                props.onSelect(option.value as string);
              }
            }}
            focused
            height={20}
            selectedBackgroundColor="#333333"
            selectedTextColor="#ffffff"
          />
        </Show>
      </box>
    </box>
  );
}
