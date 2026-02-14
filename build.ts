import solidPlugin from "@opentui/solid/bun-plugin";
import { rmSync } from "fs";

rmSync("./dist", { recursive: true, force: true });

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  target: "bun",
  compile: {
    outfile: "./dist/tui-agent",
  },
  plugins: [solidPlugin],
});
