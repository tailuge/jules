import { $ } from "bun";

const pkg = await Bun.file("package.json").json();
const baseVersion = pkg.version || "0.0.0";

async function getGitHash(): Promise<string> {
  try {
    const result = await $`git rev-parse --short HEAD`.quiet();
    return result.text().trim();
  } catch {
    return "unknown";
  }
}

export async function getVersion(): Promise<string> {
  const hash = await getGitHash();
  return `${baseVersion}+${hash}`;
}
