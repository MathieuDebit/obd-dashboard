# OBD Dashboard Web

Front-end car dashboard connected to OBD server.

## Architecture

- **Client-only Next.js App Router** – Every route renders on the client. Data flows through hooks (`useOBD`) that normalize PID packets and feed contexts for widgets, settings, and power-management.
- **Deterministic refresh loops** – Settings control the refresh cadence (`RefreshRateContext`) so the dashboard can dial CPU usage up/down when running on battery.
- **Locale + content split** – UI copy and command descriptions live in `src/locales/{en,fr}.json`, validated by `pnpm intl:verify`.
- **Offline-friendly assets** – all tiles, GLB/HDR assets, and translations are bundled locally so nothing breaks without the internet.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_WS_URL` | WebSocket endpoint consumed by `useOBD`. | `ws://localhost:8765` |
| `NEXT_PUBLIC_WS_MAX_RETRIES` | Maximum reconnect attempts before surfacing an error. | `5` |
| `NEXT_PUBLIC_WS_RETRY_BASE_DELAY_MS` | Initial reconnect delay (ms). | `1000` |
| `NEXT_PUBLIC_WS_RETRY_MAX_DELAY_MS` | Upper bound for exponential backoff (ms). | `15000` |
| `NEXT_PUBLIC_PID_HISTORY_WINDOW_SECONDS` | Sliding history window for charts. | `60` |
| `NEXT_PUBLIC_PID_HISTORY_MAX_SAMPLES` | Ring buffer length per PID. | `240` |

Everything runs in the browser runtime so changes take effect immediately after restarting `pnpm dev`.

## Getting Started

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

## Quality Gates & Tooling

### Linting

```bash
pnpm lint       # strict lint pass with Next, TS, hooks, testing-library, Tailwind rules
pnpm lint:fix   # auto-fix what can be fixed safely
```

### Type Checking

```bash
pnpm type-check
```

TypeScript runs with `allowJs=false`, `skipLibCheck=false`, and `noUncheckedIndexedAccess=true` to keep the app release-ready.

### Testing

```bash
pnpm test        # run once
pnpm test:watch  # watch mode for local development
```

Jest is configured through `jest.config.cjs` (Next + ts-jest) so component, hook, and store tests run quickly without forcing coverage collection.

### Internationalization Guardrails

```bash
pnpm intl:verify
```

Fails when locales fall out of sync.