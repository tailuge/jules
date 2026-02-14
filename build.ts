import solidPlugin from "@opentui/solid/bun-plugin";
import { renameSync } from "fs";

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  naming: "tailuge",
  compile: true,
  plugins: [solidPlugin],
});

renameSync("./dist/src", "./dist/tailuge");
