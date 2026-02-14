import { render } from "@opentui/solid";
import { App } from "./app";
import {
  initConsoleCapture,
  initRuntimeErrorCapture,
} from "./utils/console-capture";
import { registerAllTools } from "./tools";

initConsoleCapture();
initRuntimeErrorCapture();
registerAllTools();

render(() => <App />, { exitOnCtrlC: false });
