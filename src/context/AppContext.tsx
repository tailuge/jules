import {
  createContext,
  useContext,
  createSignal,
  onMount,
  onCleanup,
  type Accessor,
} from "solid-js";
import { useRenderer } from "@opentui/solid";
import { getVersion } from "@/utils/version";
import { loadConfig } from "@/config/loader";
import type { Config } from "@/config/schema";
import { createSessionFile } from "@/utils/session";
import {
  addCapturedMessage,
  initRuntimeErrorCapture,
  restoreRuntimeErrorCapture,
} from "@/utils/console-capture";

const CONTEXT_FILES = ["self.md", "memories.md"];

async function loadContextFiles(): Promise<string> {
  const contexts: string[] = [];
  for (const filename of CONTEXT_FILES) {
    try {
      const file = Bun.file(filename);
      const exists = await file.exists();
      if (exists) {
        const content = await file.text();
        if (content.trim()) {
          contexts.push(`\n\n=== ${filename} ===\n${content}`);
        }
      }
    } catch {
      // File doesn't exist, skip
    }
  }
  return contexts.join("");
}

export interface AppContextValue {
  version: Accessor<string>;
  config: Accessor<Config | null>;
  contextFiles: Accessor<string>;
  sessionFilePath: Accessor<string | null>;
}

export interface AppProviderProps {
  children: any;
  skipStartup?: boolean;
}

const AppContext = createContext<AppContextValue>();

export function AppProvider(props: AppProviderProps) {
  const renderer = useRenderer();
  const [version, setVersion] = createSignal("...");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [contextFiles, setContextFiles] = createSignal("");
  const [sessionFilePath, setSessionFilePath] = createSignal<string | null>(
    null,
  );

  onMount(async () => {
    if (props.skipStartup) {
      return;
    }

    const toggleConsoleHandler = (sequence: string) => {
      if (sequence === "`") {
        renderer.console.toggle();
        return true;
      }
      return false;
    };
    renderer.prependInputHandler(toggleConsoleHandler);
    onCleanup(() => {
      renderer.removeInputHandler(toggleConsoleHandler);
      restoreRuntimeErrorCapture();
    });

    const [v, cfg, sessionPath, context] = await Promise.all([
      getVersion(),
      loadConfig(),
      createSessionFile(),
      loadContextFiles(),
    ]);
    setVersion(v);
    setConfig(cfg);
    setSessionFilePath(sessionPath);
    setContextFiles(context);
    if (context) {
      addCapturedMessage(
        "log",
        `Loaded context files: ${CONTEXT_FILES.join(", ")}`,
      );
    }
    addCapturedMessage(
      "log",
      `Loaded config for ${cfg.model.provider}:${cfg.model.name}`,
    );
    addCapturedMessage("log", `Created session file: ${sessionPath}`);
  });

  const contextValue: AppContextValue = {
    version,
    config,
    contextFiles,
    sessionFilePath,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
