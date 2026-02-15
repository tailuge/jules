import { box } from "@opentui/solid";
import { JSX, createMemo } from "solid-js";
import { getOrientation } from "../utils/layout";

interface MainLayoutProps {
  memory: JSX.Element;
  goals: JSX.Element;
  self: JSX.Element;
  activity: JSX.Element;
  width: number;
  height: number;
}

/**
 * MainLayout provides a responsive four-panel TUI layout.
 * In "wide" mode, Memory/Goals/Self are on the left side.
 * In "tall" mode, Memory/Goals/Self are on the top.
 */
export function MainLayout(props: MainLayoutProps) {
  const orientation = createMemo(() =>
    getOrientation(props.width, props.height)
  );

  return (
    <box
      flexDirection={orientation() === "wide" ? "row" : "column"}
      width="100%"
      height="100%"
    >
      <box
        flexDirection={orientation() === "wide" ? "column" : "row"}
        flexBasis={orientation() === "wide" ? "40%" : "50%"}
        flexShrink={0}
      >
        <box flexGrow={1} flexBasis="0" borderStyle="single" title="Memory">
          {props.memory}
        </box>
        <box flexGrow={1} flexBasis="0" borderStyle="single" title="Goals">
          {props.goals}
        </box>
        <box flexGrow={1} flexBasis="0" borderStyle="single" title="Self">
          {props.self}
        </box>
      </box>
      <box flexGrow={1} borderStyle="single" title="Activity">
        {props.activity}
      </box>
    </box>
  );
}
