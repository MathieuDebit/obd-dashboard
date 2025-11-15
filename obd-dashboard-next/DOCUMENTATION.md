<!--
  Detailed internal documentation.
-->

# OBD Dashboard Web – Developer Documentation

## 1. Product Overview

The dashboard is a **Next.js App** project that visualises live On-Board Diagnostics (OBD) data streamed over WebSockets. It offers:

- A map view showing the vehicle position and telemetry summaries (`/`).
- A commands page where live PIDs (parameter IDs) and correlations are charted (`/commands`).
- A diagnostics page with a Three.js car scene and localized vehicle specification cards (`/diagnostics`).
- A settings section that controls language, theme, power profile, and developer toggles (`/settings`).

All features are implemented with React components and hooks; there is no server-side rendering or API routes in this repo. The backend OBD server is assumed to run separately and push JSON payloads to the dashboard.

## 2. Tech Stack Overview

| Area | Choice | Notes |
| --- | --- | --- |
| Framework | [Next.js](https://nextjs.org/docs/app) | Client components only (see `src/app/**`). |
| Language | TypeScript | Strict settings (`noUncheckedIndexedAccess`, `skipLibCheck=false`). |
| Styling | Tailwind CSS, shadcn/ui primitives | Base classes live in `src/ui/**`. Fonts are provided through `next/font`. |
| Charts | [Recharts](https://recharts.org) | Wrapped by custom components in `src/components` and `src/ui/chart.tsx`. |
| Maps | [react-leaflet](https://react-leaflet.js.org) | Loaded dynamically to avoid SSR issues. |
| 3D Scene | Three.js via `@react-three/fiber` + `@react-three/drei` | For the diagnostics car model. |
| State | React Contexts + custom hooks + external store | Global state is kept in context providers and `src/store/pidHistory.ts`. |
| Testing | Jest + Testing Library | Configured via `jest.config.cjs` with `ts-jest`. |


## 3. Repository Structure

```
obd-dashboard-next/
├── README.md                # High-level instructions and scripts
├── DOCUMENTATION.md         # This file
├── src/
│   ├── app/                 # Next.js routes, layouts, and contexts
│   ├── components/          # Feature components (charts, maps, diagnostics, dev tools)
│   ├── config/              # Runtime configuration objects
│   ├── constants/           # Immutable lookups (e.g., PID lists)
│   ├── hooks/               # Custom React hooks (useOBD, useDebouncedRafValue, etc.)
│   ├── locales/             # i18n JSON files (`en.json`, `fr.json`)
│   ├── store/               # External store that records PID history
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Reusable primitives (cards, tables, scroll areas, etc.)
│   └── utils/               # Helper utilities (i18n helpers, value formatting)
├── public/                  # Static assets (maps, car models, textures)
└── scripts/, config files…  # Tooling (linting, testing, Tailwind, etc.)
```

## 4. Data Flow & Core Hooks

### 4.1 WebSocket ingestion (`src/hooks/useOBD.ts`)

1. `useOBD` reads connection parameters from `appConfig` (`src/config/app.ts`).
2. It opens a WebSocket to `NEXT_PUBLIC_WS_URL` and listens for JSON payloads shaped like:
   ```json
   {
     "timestamp": 1714581000000,
     "pids": {
       "RPM": 1200,
       "SPEED": "36",
       "...": "..."
     }
   }
   ```
3. Payloads are normalized: timestamps fall back to `Date.now()`, values are coerced to strings or finite numbers, and command metadata is enriched via `src/utils/formatOBD.ts` and translations from `src/utils/i18n.ts`.
4. Numeric values are forwarded to the PID history store (`src/store/pidHistory.ts`) so charts can render sliding windows.
5. `useOBD` exposes `pids`, `corePids`, `otherPids`, `pidMap`, connection status flags, and `isRecordingHistory`.

**Key behaviors:**

- **Automatic retries**: Exponential backoff re-connects up to `NEXT_PUBLIC_WS_MAX_RETRIES` times.
- **History control**: When the socket closes, the store is paused/cleared to avoid stale data.
- **Localization**: All command names/descriptions are localized before reaching components, so UI code never hardcodes labels.

### 4.2 History store (`src/store/pidHistory.ts`)

- Maintains a map of PID → array of `{ timestamp, value }`.
- Sliding window is controlled by `NEXT_PUBLIC_PID_HISTORY_WINDOW_SECONDS` and `NEXT_PUBLIC_PID_HISTORY_MAX_SAMPLES`.
- Exposes `recordPidSamples`, `clearPidHistory`, `pausePidHistory`, `resumePidHistory`, and a `usePidHistory(pid)` hook for subscription.

### 4.3 Refresh cadence contexts

- `PowerModeContext`: toggles between `"performance"` and `"powersave"`, storing the preference in `localStorage`.
- `RefreshRateContext`: consumes `PowerMode` and emits the millisecond interval that downstream hooks use to throttle updates.
- `ThemeContext`, `LanguageContext`, and `DevtoolsPreferencesContext` follow the same pattern—context + provider + `useX` hook + persistence.

## 5. UI Architecture

### 5.1 Layout & Shell

- `src/app/layout.tsx` defines the root HTML/Body and nests all providers so pages can assume contexts are available.
- `src/app/html.tsx` exports `AppShell`, which renders the top navigation (`src/ui/nav.tsx`), wraps content in a `ScrollArea`, and conditionally adds the `PerformanceProfiler`.

### 5.2 Pages

| Route | Component | Highlights |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Map view + telemetry overlay (RadialChart + GPSCarData). Uses `useOBD`, `useRefreshRate`, and `useDebouncedRafValue`. |
| `/commands` | `src/app/commands/page.tsx` | PID list, correlation cards, chart (`ChartAreaStep`), and markdown modal. |
| `/diagnostics` | `src/app/diagnostics/page.tsx` | Lazy-loaded `CarScene` (Three.js) and localized spec cards using `translateUi`. |
| `/settings` | `src/app/settings/page.tsx` | UI built from `Tabs`, `Card`, `Select`, `Button`, and contexts controlling theme/language/power/devtools settings. |

Each page is a client component (`'use client'`) so hooks can run safely. They mostly rely on the contexts, UI primitives, and utilities described above.

### 5.3 Reusable Components

- `src/components/ChartAreaStep.tsx`: Card wrapper around Recharts `AreaChart` with dual-axis support and localized tooltips.
- `src/components/RadialChart.tsx`: Radial gauge used in the telemetry card.
- `src/components/Map.tsx`: Leaflet map with theme-aware tiles. Loaded dynamically to avoid SSR mismatches.
- `src/components/diagnostics/CarScene.tsx`: Three.js scene featuring GLTF car, wheel animation, and power-mode-aware GPU tuning.
- `src/components/dev/PerformanceProfiler.tsx`: React Profiler wrapper plus optional overlay toggled via `DevtoolsPreferencesContext`.
- `src/components/Markdown.tsx`: Sanitized Markdown renderer using `react-markdown` + `rehype-sanitize`.

UI primitives under `src/ui/**` (button, card, table, select, scroll area, tabs, etc.) follow shadcn patterns and are documented inline.

## 6. Internationalization

- Locale JSON files live in `src/locales/en.json` and `src/locales/fr.json`. Each file contains two sections: `pids` (command copy) and `ui` (generic strings).
- Helper functions in `src/utils/i18n.ts`:
  - `getPidCopy(pid, locale)` returns `{ name, description }`.
  - `translateUi(key, locale, fallback)` retrieves UI text with fallback.
  - `translatePidName / translatePidDescription` wrap the helper for one field.
- `LanguageContext` stores the active locale in `localStorage` and updates the `<html lang>` attribute.

## 7. Styling & Theming

- Global CSS lives in `src/ui/css/globals.css` (imported from `src/app/layout.tsx`).
- Utility classes rely on Tailwind; we merge them with the `cn` helper (`src/utils/classNames.ts`).
- Theme switching:
  - `ThemeContext` persists `"light"` or `"dark"` in `localStorage`.
  - `layout.tsx` injects an inline script to set the root class before hydration.
  - CSS custom properties drive color tokens; see `tailwind.config.cjs` and `src/ui/css/utils.ts`.

## 8. Telemetry & Charts

- **Chart data types**: Defined in `src/types/chart.ts`.
- **Formatting**: `src/utils/formatOBD.ts` attaches units to numeric values (e.g., RPM → `tr/min`, speed → `km/h`).
- **Chart components**: `ChartAreaStep` handles multi-series area charts; `RadialChart` renders the gauge; shared legends/tooltips live in `src/ui/chart.tsx`.
- **History**: Use `usePidHistory(pid)` to fetch time-series data for charts and `recordPidSamples` (already called inside `useOBD`) to update them.

## 9. Testing & Quality Gates

| Command | Purpose |
| --- | --- |
| `pnpm lint` | ESLint with Next.js, Testing Library, hooks, and Tailwind plugins. |
| `pnpm type-check` | Runs `tsc --noEmit`. |
| `pnpm test` / `pnpm test:watch` | Jest + Testing Library. Tests live next to their subjects (`*.test.ts[x]`). |
| `pnpm intl:verify` | Confirms locale JSON files share the same keys. |