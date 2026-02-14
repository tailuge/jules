# src/context/

Solid.js context providers for shared application state.

- `AppContext.tsx`: Provides version, config, contextFiles, and sessionFilePath.

## Usage

```tsx
import { AppProvider, useAppContext } from "@/context/AppContext";

// In your app
<AppProvider skipStartup={false}>
  <MyComponent />
</AppProvider>;

// In a component
const { config, version } = useAppContext();
```
