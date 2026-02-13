import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { createSignal, onMount } from "solid-js";
import { getVersion } from "./utils/version";

function App() {
  const [version, setVersion] = createSignal("...");
  const renderer = useRenderer();

  onMount(async () => {
    const v = await getVersion();
    setVersion(v);
  });

  useKeyboard((key) => {
    if (key.name === "q") {
      renderer.destroy();
    }
  });

  return (
    <box flexDirection="column" height="100%" width="100%" padding={1}>
      <box
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <ascii_font text="TaiLuGe" color="#FFFF00" font="block" />
        <text fg="#888888" marginTop={2}>
          Press 'q' or Ctrl+C to quit
        </text>
      </box>
      <box justifyContent="flex-end" flexDirection="row" width="100%">
        <text fg="#666666">v{version()}</text>
      </box>
    </box>
  );
}

render(() => <App />, { exitOnCtrlC: true });
