import { useRenderer } from "@opentui/solid";
import { createSignal, onMount, createEffect } from "solid-js";
import { MainLayout } from "./MainLayout";
import { MemoryPanel } from "./MemoryPanel";
import { GoalsPanel } from "./GoalsPanel";
import { SelfPanel } from "./SelfPanel";
import { ActivityPanel } from "./ActivityPanel";
import { createPanelState } from "../agent/state";
import { runLoopy } from "../agent/loopy";
import { createStatusTools } from "../agent/state_tools";
import { createProvider } from "../agent/provider";
import { AppProvider, useAppContext } from "../context/AppContext";
import { toolRegistry } from "../tools/registry";

function LoopyAppContent() {
  const renderer = useRenderer();
  const context = useAppContext();
  const [size, setSize] = createSignal({
    width: process.stdout.columns || 100,
    height: process.stdout.rows || 30,
  });

  const { state, setState } = createPanelState();
  let loopStarted = false;
  const userInputQueue: string[] = [];

  const [activityInput, setActivityInput] = createSignal("");
  const [activityFocused, setActivityFocused] = createSignal(true);

  const handleActivitySubmit = () => {
    const trimmed = activityInput().trim();
    if (trimmed) {
      setState("activity", (a) => [
        ...a,
        { timestamp: Date.now(), type: "user", message: trimmed },
      ]);
      userInputQueue.push(trimmed);
      setActivityInput("");
    }
  };

  createEffect(() => {
    const config = context.config();
    if (!config) {
        setState("activity", (a) => [
          ...a,
          { timestamp: Date.now(), type: "info", message: "Waiting for configuration..." },
        ]);
        return;
    }
    if (config && !loopStarted) {
      loopStarted = true;
      startLoop(config);
    }
  });

  onMount(async () => {
    const onResize = () => {
      setSize({
        width: process.stdout.columns,
        height: process.stdout.rows,
      });
    };
    process.stdout.on("resize", onResize);
  });

  async function startLoop(config: any) {
    const statusTools = createStatusTools({ state, setState });
    const allTools = {
      ...toolRegistry.getAll(),
      ...statusTools,
    };

    const prompt = process.argv.slice(2).join(" ") || "Analyze the current directory and tell me what you see.";

    const systemPrompt = `You are a helpful AI agent running in a TUI dashboard called "Loopy".
Your goal is to assist the user and explore/improve the codebase.
You have tools to read/write files and run shell commands.
ALWAYS provide a "path" argument when using file tools (read_file, write_file, list_dir). 
If you want to list the current directory, use path: ".".
You can update your own status panels using:
- update_memory: to store long-term facts.
- update_goals: to track your objectives.
- update_self: to define your persona.
Interact with the user through your thoughts and responses.`;

    setState("activity", (a) => [
      ...a,
      { timestamp: Date.now(), type: "info", message: `Starting loopy with prompt: ${prompt}` },
    ]);

    try {
      const provider = createProvider({
        provider: config.model.provider,
        name: config.model.name,
        apiKey: config.model.apiKey,
        baseUrl: config.model.baseUrl,
      });

      await runLoopy(prompt, provider, { state, setState }, allTools, 10, userInputQueue, systemPrompt);
    } catch (error: any) {
      setState("activity", (a) => [
        ...a,
        { timestamp: Date.now(), type: "error", message: `Failed to start loop: ${error.message}` },
      ]);
    }
  }

  return (
    <MainLayout
      width={size().width}
      height={size().height}
      memory={<MemoryPanel memory={state.memory} />}
      goals={<GoalsPanel goals={state.goals} />}
      self={<SelfPanel self={state.self} />}
      activity={
        <ActivityPanel
          activity={state.activity}
          isThinking={() => state.isThinking}
          inputValue={activityInput}
          onInput={setActivityInput}
          onSubmit={handleActivitySubmit}
          inputFocused={activityFocused}
        />
      }
    />
  );
}

export function LoopyApp() {
  return (
    <AppProvider>
      <LoopyAppContent />
    </AppProvider>
  );
}
