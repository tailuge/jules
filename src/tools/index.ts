import { registerFileTools } from "./file";
import { registerShellTool } from "./shell";

export function registerAllTools(): void {
  registerFileTools();
  registerShellTool();
}
