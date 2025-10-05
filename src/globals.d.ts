interface AppSettings {
  hskLevel: number;
  llmPrompt: string;
  load: () => void;
  save: () => void;
}

interface App {
  settings: AppSettings;
  saveText: (element: HTMLElement | null) => void;
  loadText: (element: HTMLElement | null) => void;
  initialize: () => void;
}

declare interface Window {
  app: App;
}