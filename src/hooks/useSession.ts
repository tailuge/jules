import { createSignal, type Accessor } from "solid-js";
import {
  createSessionFile,
  listSessionFiles,
  type SessionFile,
} from "@/utils/session";
import { addCapturedMessage } from "@/utils/console-capture";

export interface UseSessionReturn {
  sessionFilePath: Accessor<string | null>;
  sessions: Accessor<SessionFile[]>;
  selectorOpen: Accessor<boolean>;
  initSession: () => Promise<string>;
  listSessions: () => Promise<void>;
  openSelector: () => void;
  closeSelector: () => void;
}

export function useSession(): UseSessionReturn {
  const [sessionFilePath, setSessionFilePath] = createSignal<string | null>(
    null,
  );
  const [sessions, setSessions] = createSignal<SessionFile[]>([]);
  const [selectorOpen, setSelectorOpen] = createSignal(false);

  const initSession = async (): Promise<string> => {
    const path = await createSessionFile();
    setSessionFilePath(path);
    addCapturedMessage("log", `Created session file: ${path}`);
    return path;
  };

  const listSessions = async (): Promise<void> => {
    const files = await listSessionFiles();
    setSessions(files);
  };

  const openSelector = (): void => {
    setSelectorOpen(true);
  };

  const closeSelector = (): void => {
    setSelectorOpen(false);
  };

  return {
    sessionFilePath,
    sessions,
    selectorOpen,
    initSession,
    listSessions,
    openSelector,
    closeSelector,
  };
}
