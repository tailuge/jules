import { writeFile } from "node:fs/promises";
import { testRender } from "@opentui/solid";
import stripAnsi from "strip-ansi";
import { App } from "../src/app";

const TITLE = "TUI Agent CLI";
const SCREEN_PATH = "docs/generated/initial-screen.txt";
const README_PATH = "README.md";
const DOCS_INDEX_PATH = "docs/index.html";

function normalizeFrame(frame: string): string {
  const clean = stripAnsi(frame)
    .replace(/\r\n/g, "\n")
    .replace(/^\n+/, "")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trimEnd();
  return `${clean}\n`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReadme(screen: string): string {
  return `# ${TITLE}\n\n## Initial Screen\n\n\`\`\`text\n${screen}\`\`\`\n\n## Install\n\n\`\`\`bash\nbun install\nbun run dev\n\`\`\`\n`;
}

function buildDocsHtml(screen: string): string {
  const escaped = escapeHtml(screen);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
</head>
<body>
  <h1>${TITLE}</h1>
  <h2>Initial Screen</h2>
  <pre>${escaped}</pre>
  <h2>Install</h2>
  <pre>bun install
bun run dev</pre>
</body>
</html>
`;
}

const testSetup = await testRender(() => <App skipStartup />, {
  width: 80,
  height: 24,
});

try {
  await testSetup.renderOnce();
  const frame = normalizeFrame(testSetup.captureCharFrame());

  await Promise.all([
    writeFile(SCREEN_PATH, frame, "utf8"),
    writeFile(README_PATH, buildReadme(frame), "utf8"),
    writeFile(DOCS_INDEX_PATH, buildDocsHtml(frame), "utf8"),
  ]);
} finally {
  testSetup.renderer.destroy();
}
