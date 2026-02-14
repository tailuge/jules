import { render } from "@opentui/solid";
import { App } from "./app";
import { initConsoleCapture, initRuntimeErrorCapture } from "./utils/console-capture";

initConsoleCapture();
initRuntimeErrorCapture();

render(() => <App />, { exitOnCtrlC: false });
