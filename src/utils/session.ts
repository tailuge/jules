import { homedir } from "os";
import { join } from "path";
import { mkdir, readdir } from "fs/promises";

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

export interface SessionFile {
  filename: string;
  path: string;
  date: Date;
}

function parseSessionDate(filename: string): Date | null {
  const match = filename.match(/^session_(.+)\.md$/);
  if (!match) return null;

  const parts = match[1].split("T");
  if (parts.length !== 2) return null;

  const datePart = parts[0];
  const timePart = parts[1].replace(/-/g, ":");
  const isoStr = `${datePart}T${timePart}`;

  const date = new Date(isoStr);
  return isNaN(date.getTime()) ? null : date;
}

export async function listSessionFiles(
  directory?: string,
): Promise<SessionFile[]> {
  const sessionsDir = directory ?? getDefaultSessionsDir();

  let files: string[];
  try {
    files = await readdir(sessionsDir);
  } catch {
    return [];
  }

  const sessions: SessionFile[] = [];

  for (const filename of files) {
    if (!filename.startsWith("session_") || !filename.endsWith(".md")) {
      continue;
    }

    const date = parseSessionDate(filename);
    if (!date) continue;

    sessions.push({
      filename,
      path: join(sessionsDir, filename),
      date,
    });
  }

  sessions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return sessions;
}
