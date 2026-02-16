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

  const [activityInput, setActivityInput] = createSignal("");
  const [activityFocused, setActivityFocused] = createSignal(true);

  const handleActivitySubmit = () => {
    // Phase 2: Logic for processing input
    setActivityInput("");
  };

  createEffect(() => {
    const config = context.config();
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

      await runLoopy(prompt, provider, { state, setState }, allTools);
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
