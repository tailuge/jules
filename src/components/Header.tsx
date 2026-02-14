import { Accessor } from "solid-js";
import { Config } from "../config/schema";
import { providerColors } from "../constants";

interface HeaderProps {
  config: Accessor<Config | null>;
  version: Accessor<string>;
}

export function Header(props: HeaderProps) {
  return (
    <box flexDirection="row" padding={1}>
      <ascii_font text="TaiLuGe" color="#FFFF00" font="tiny" />
      {props.config() && (
        <box flexDirection="column" marginLeft={2} alignSelf="flex-start">
          <text
            fg={providerColors[props.config()!.model.provider] || "#00FFFF"}
          >
            {props.config()!.model.provider}:{props.config()!.model.name}
          </text>
          <text fg="#666666">v{props.version()}</text>
        </box>
      )}
    </box>
  );
}
