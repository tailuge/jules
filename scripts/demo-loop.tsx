import { render } from "@opentui/solid";
import { MainLayout } from "../src/components/MainLayout";
import { MemoryPanel } from "../src/components/MemoryPanel";
import { GoalsPanel } from "../src/components/GoalsPanel";
import { SelfPanel } from "../src/components/SelfPanel";
import { ActivityPanel } from "../src/components/ActivityPanel";
import { createSignal, onMount } from "solid-js";
import { createPanelState } from "../src/agent/state";
import { runLoopy } from "../src/agent/loopy";
import { createStatusTools } from "../src/agent/state_tools";

function Demo() {
  const [size] = createSignal({ width: 100, height: 30 });
  const { state, setState } = createPanelState();

  onMount(async () => {
    const context = { state, setState };
    const statusTools = createStatusTools(context);

    // Simulated loop with manual updates to show it works
    setState("activity", (a) => [
      ...a,
      { timestamp: Date.now(), type: "info", message: "Starting loopy demo..." },
    ]);

    await new Promise((r) => setTimeout(r, 1000));
    setState("activity", (a) => [
      ...a,
      { timestamp: Date.now(), type: "thought", message: "I should introduce myself." },
    ]);

    await new Promise((r) => setTimeout(r, 1000));
    await statusTools.update_self.execute({ identity: "I am a helpful loopy agent." });

    await new Promise((r) => setTimeout(r, 1000));
    setState("activity", (a) => [
      ...a,
      { timestamp: Date.now(), type: "thought", message: "I need to set some goals." },
    ]);

    await new Promise((r) => setTimeout(r, 1000));
    await statusTools.update_goals.execute({
      goals: [{ id: "1", text: "Learn how to loop", completed: true }],
    });

    await new Promise((r) => setTimeout(r, 1000));
    await statusTools.update_memory.execute({ item: "Looping is fun!" });
  });

  return (
    <MainLayout
      width={size().width}
      height={size().height}
      memory={<MemoryPanel memory={state.memory} />}
      goals={<GoalsPanel goals={state.goals} />}
      self={<SelfPanel self={state.self} />}
      activity={<ActivityPanel activity={state.activity} />}
    />
  );
}

render(() => <Demo />, { exitOnCtrlC: true });
