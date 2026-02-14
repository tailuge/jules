## Adopt `cli-screencast` For Initial Screen PNG Generation

### Summary
Switch the docs snapshot pipeline from raw text embedding to PNG generation using `cli-screencast`, then embed that PNG in both `README.md` and `docs/index.html`.  
This directly addresses the right-edge artifact and avoids font-size/column tradeoffs in markdown code blocks.

### Implementation Details

1. Dependency and outputs
1. Add `cli-screencast` as a dependency (with Bun).
1. Add generated image target: `docs/generated/initial-screen.png`.
1. Keep `docs/generated/initial-screen.txt` as optional debug output from the same capture pass.

2. Capture script changes
1. Update `scripts/generate-initial-screen.tsx` to keep OpenTUI test rendering as the source:
   - `testRender(() => <App skipStartup />, { width: 120, height: 24 })`
1. Keep `normalizeFrame(...)` for debug `.txt` and for stable renderer input.
1. Replace text-only output flow with image generation using `cli-screencast`:
   - Use `captureFrames([{ content: normalizedFrame, duration: 1000 }], { ... })`
   - Set `columns: 120`, `rows: 24`, `output: "png"`, `cursorHidden: true`, `endTimePadding: 0`
   - Write returned PNG buffer to `docs/generated/initial-screen.png`
1. Keep writing:
   - `docs/generated/initial-screen.txt`
   - `README.md`
   - `docs/index.html`

3. README update (image-only per your preference)
1. Replace the fenced `text` block in `README.md` with:
   - `![Initial Screen](docs/generated/initial-screen.png)`
1. Keep install section unchanged.

4. docs HTML update
1. Replace terminal `<pre>` snapshot block with `<img src="./generated/initial-screen.png" alt="Initial screen" />`.
1. Add responsive image CSS:
   - `max-width: 100%`
   - `height: auto`
   - optional subtle border/background container to match current theme.

### Public Interfaces / Types
1. No runtime app API changes.
2. Internal script behavior change only:
   - `bun run docs:screen` now generates PNG in addition to text and docs files.

### Test and Validation Plan

1. Generation smoke test
1. Run `bun run docs:screen`.
1. Confirm files exist and are updated:
   - `docs/generated/initial-screen.png`
   - `README.md`
   - `docs/index.html`

2. Content checks
1. `README.md` includes markdown image reference to `docs/generated/initial-screen.png`.
1. `docs/index.html` includes `<img>` pointing to `./generated/initial-screen.png`.

3. Project checks
1. Run `bun run typecheck`
1. Run `bun run test`
1. Run `bun run lint`

### Assumptions and Defaults
1. Default capture size: `120x24` (chosen to avoid the current right-edge artifact).
2. PNG is the canonical docs artifact; text capture remains debug-only.
3. `cli-screencast` is used via API (`captureFrames`) to keep generation deterministic and script-local.
4. Cursor is hidden in screenshot output (`cursorHidden: true`) for a clean static frame.
