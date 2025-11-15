# Roadmap

This dashboard targets an offline-first Raspberry Pi setup with a touch display bundled inside an Electron shell. Power draw, predictable performance, and complete local asset availability are the key constraints—every feature should respect those priorities.

## Guiding Constraints

- **Client-only runtime:** The app ships without a dedicated backend. Rendering should stay client-side unless SSR materially improves the desktop bundle.
- **Battery-friendly UX:** Animations, polling, and rendering cadence must respond to the active power mode.
- **Offline assets:** Assume no external network beyond the OBD WebSocket endpoint. Bundle tiles, GLB/HDR files, translations, etc.
- **Touch-first interactions:** Components should be large enough for touch, keyboard-accessible, and clear in a cockpit environment.

Use this document as the source of truth for what is done and what is next.

## High-Priority Next Steps

### Architecture & Data Flow

- [ ] Split the monolithic client layout: move the outer shell to a server layout and keep only stateful/WebSocket widgets as client components to reduce bundle cost.

### UI, Accessibility & i18n

- [ ] Replace the icon-only nav bar with a semantic `<nav>` element and visible labels for each destination.
- [ ] Swap the PID description modal for the Dialog primitives to improve focus handling and touch ergonomics.
- [ ] Update the map to include tile attribution, expose loading/error states, and remove unused imports.
- [ ] Wire the speed/fuel widgets to real PIDs (or clearly mark them as placeholders) so drivers aren’t misled.

### Tooling, Testing & DX

- [ ] Tighten `tsconfig.json`: disable `allowJs`, disable `skipLibCheck`, and enable strict options such as `noUncheckedIndexedAccess` once remaining TS gaps are filled.

## Completed Milestones

### Architecture & Data Flow

- [x] Implemented exponential WebSocket retries with surfaced status and documented simulator usage.
- [x] Replaced the unbounded PID history with a pruned, pauseable buffer.
- [x] Normalized raw PID types to `string | number`, eliminating repeated `Number(...)` calls.
- [x] Memoized `Home` telemetry derivations and guarded `RadialChart` against empty feeds.
- [x] Lazy-loaded the diagnostics scene behind `dynamic()/Suspense` with low-end fallbacks.

### UI, Accessibility & i18n

- [x] Removed legacy diagnostics error-code cards so only the 3D scene and vehicle specs remain.
- [x] Moved translations to `src/locales/{en,fr}.json` with helpers that surface missing keys.

### Tooling, Testing & DX

- [x] Expanded the README with architecture notes, environment variables, and contributor guidance.
- [x] Pointed `components.json` and Tailwind config to the new `src/ui/css/globals.css`.
- [x] Hardened ESLint with TypeScript, hooks, accessibility, Testing Library, and Tailwind plugins.
- [x] Rebuilt the Jest config as plain CJS with `tsx` support and opt-in coverage.
- [x] Added tests for `useOBD`, PID history, translations, and key screens to supplement the settings smoke test.