import { homedir } from "os";
import { join } from "path";
import { mkdir } from "fs/promises";

export function getDefaultSessionsDir(): string {
  return join(homedir(), ".tui-agent", "sessions");
}

export async function createSessionFile(directory?: string): Promise<string> {
  const sessionsDir = directory ?? getDefaultSessionsDir();

  await mkdir(sessionsDir, { recursive: true });

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\.\d{3}Z$/, "");
  const fileName = `session_${timestamp}.md`;
  const filePath = join(sessionsDir, fileName);

  await Bun.write(filePath, "");

  return filePath;
}
