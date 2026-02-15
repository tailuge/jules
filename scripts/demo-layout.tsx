import { render } from "@opentui/solid";
import { MainLayout } from "../src/components/MainLayout";
import { MemoryPanel } from "../src/components/MemoryPanel";
import { GoalsPanel } from "../src/components/GoalsPanel";
import { SelfPanel } from "../src/components/SelfPanel";
import { ActivityPanel } from "../src/components/ActivityPanel";
import { createSignal } from "solid-js";

function Demo() {
  // Mock dimensions
  const [size] = createSignal({ width: 100, height: 30 });

  return (
    <MainLayout
      width={size().width}
      height={size().height}
      memory={<MemoryPanel memory={["Fact 1", "Fact 2"]} />}
      goals={
        <GoalsPanel
          goals={[{ id: "1", text: "Task 1", completed: false }]}
        />
      }
      self={<SelfPanel self="I am a demo agent." />}
      activity={
        <ActivityPanel
          activity={[
            { timestamp: Date.now(), type: "info", message: "Demo started" },
          ]}
        />
      }
    />
  );
}

render(() => <Demo />, { exitOnCtrlC: true });
