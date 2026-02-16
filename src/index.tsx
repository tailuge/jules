import { render } from "@opentui/solid";
import { LoopyApp } from "./components/LoopyApp";
import {
  initConsoleCapture,
  initRuntimeErrorCapture,
} from "./utils/console-capture";
import { registerAllTools } from "./tools";

initConsoleCapture();
initRuntimeErrorCapture();
registerAllTools();

render(() => <LoopyApp />, { exitOnCtrlC: true });
