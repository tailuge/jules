interface AppSettings {
  hskLevel: number;
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