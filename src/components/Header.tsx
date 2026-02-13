import { Accessor } from "solid-js";
import { Config } from "../config/schema";
import { providerColors } from "../constants";

interface HeaderProps {
  config: Accessor<Config | null>;
  version: Accessor<string>;
}

export function Header(props: HeaderProps) {
  return (
    <box flexDirection="row" justifyContent="space-between" padding={1}>
      <box flexDirection="row">
        <ascii_font text="TaiLuGe" color="#FFFF00" font="tiny" />
        {props.config() && (
          <box flexDirection="row" marginLeft={2}>
            <text
              fg={
                providerColors[props.config()!.model.provider] || "#00FFFF"
              }
            >
              {props.config()!.model.provider}:{props.config()!.model.name}
            </text>
          </box>
        )}
      </box>
      <text fg="#666666">v{props.version()}</text>
    </box>
  );
}
