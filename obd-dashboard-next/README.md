# obd-dashboard-web

## TL;DR

```bash
pnpm i
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

The dashboard connects directly to a local OBD WebSocket relay. Tweak the client
behaviour through the following optional environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_WS_URL` | WebSocket endpoint consumed by the telemetry hook. | `ws://localhost:8765` |
| `NEXT_PUBLIC_WS_MAX_RETRIES` | Maximum reconnect attempts before surfacing an error. | `5` |
| `NEXT_PUBLIC_WS_RETRY_BASE_DELAY_MS` | Initial reconnect delay in milliseconds. | `1000` |
| `NEXT_PUBLIC_WS_RETRY_MAX_DELAY_MS` | Upper bound for the exponential backoff delay. | `15000` |

Everything happens client-side so the app stays offline-ready.
