const toNumber = (value: string | number | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig = {
  websocketUrl:
    process.env.NEXT_PUBLIC_WS_URL?.trim() || "ws://localhost:8765",
  websocketMaxRetries: toNumber(process.env.NEXT_PUBLIC_WS_MAX_RETRIES, 5),
  websocketRetryBaseDelayMs: toNumber(
    process.env.NEXT_PUBLIC_WS_RETRY_BASE_DELAY_MS,
    1_000,
  ),
  websocketRetryMaxDelayMs: toNumber(
    process.env.NEXT_PUBLIC_WS_RETRY_MAX_DELAY_MS,
    15_000,
  ),
};

export type AppConfig = typeof appConfig;
