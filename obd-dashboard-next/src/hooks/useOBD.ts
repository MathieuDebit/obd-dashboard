import { useEffect, useMemo, useRef, useState } from "react";
import { OBD_COMMANDS } from "@/utils/formatOBD";
import { Command, Commands, OBDServerResponse } from "@/types/commands";
import { isCorePid, toPidKey } from "@/constants/pids";
import { getPidCopy } from "@/utils/i18n";
import { useLanguage } from "@/app/LanguageContext";
import { recordPidSamples } from "@/store/pidHistory";
import { appConfig } from "@/config/app";

type ConnectionStatus = "idle" | "connecting" | "ready" | "error";

const DEFAULT_RESPONSE: OBDServerResponse = { timestamp: 0, pids: {} };

const coercePidValue = (value: unknown): string | number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  return String(value);
};

const normalizeResponse = (
  payload: Partial<OBDServerResponse>,
): OBDServerResponse => {
  const timestamp =
    typeof payload.timestamp === "number" ? payload.timestamp : Date.now();
  const pidsEntries =
    payload.pids && typeof payload.pids === "object"
      ? Object.entries(payload.pids as Record<string, unknown>)
      : [];

  const normalizedPids = pidsEntries.reduce<Record<string, string | number>>(
    (acc, [pid, value]) => {
      acc[pid] = coercePidValue(value);
      return acc;
    },
    {},
  );

  return { timestamp, pids: normalizedPids };
};

const extractNumericPidSamples = (
  pids: Record<string, string | number>,
): Record<string, number> =>
  Object.entries(pids).reduce<Record<string, number>>((acc, [pid, value]) => {
    const numeric =
      typeof value === "number" && Number.isFinite(value)
        ? value
        : Number(value);
    if (Number.isFinite(numeric)) {
      acc[pid] = numeric;
    }
    return acc;
  }, {});

export default function useOBD() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [parseError, setParseError] = useState<Error | null>(null);
  const [lastValidResponse, setLastValidResponse] =
    useState<OBDServerResponse>(DEFAULT_RESPONSE);
  const { locale } = useLanguage();
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const {
    websocketUrl,
    websocketMaxRetries,
    websocketRetryBaseDelayMs,
    websocketRetryMaxDelayMs,
  } = appConfig;

  useEffect(() => {
    let disposed = false;
    let retryCount = 0;
    let activeSocketCleanup: (() => void) | null = null;

    const clearReconnectTimer = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    const cleanupSocket = () => {
      if (activeSocketCleanup) {
        activeSocketCleanup();
        activeSocketCleanup = null;
      }
      if (!socketRef.current) return;
      socketRef.current.close();
      socketRef.current = null;
    };

    const scheduleReconnect = () => {
      if (disposed) return;
      if (retryCount >= websocketMaxRetries) {
        setConnectionError(
          new Error(
            `[useOBD] Reached max reconnect attempts (${websocketMaxRetries})`,
          ),
        );
        setStatus("error");
        return;
      }

      const delay = Math.min(
        websocketRetryBaseDelayMs * 2 ** retryCount,
        websocketRetryMaxDelayMs,
      );

      reconnectRef.current = setTimeout(() => {
        retryCount += 1;
        connect();
      }, delay);
    };

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as Partial<OBDServerResponse>;
        const normalized = normalizeResponse(parsed);
        setLastValidResponse(normalized);
        recordPidSamples({
          timestamp: normalized.timestamp,
          pids: extractNumericPidSamples(normalized.pids),
        });
        setParseError(null);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("[useOBD] Failed to parse OBD payload");
        if (process.env.NODE_ENV !== "test") {
          console.warn(error);
        }
        setParseError(error);
      }
    };

    const connect = () => {
      clearReconnectTimer();
      cleanupSocket();
      setStatus("connecting");
      const socket = new WebSocket(websocketUrl);
      socketRef.current = socket;

      const handleOpen = () => {
        if (disposed) return;
        retryCount = 0;
        setStatus("ready");
        setConnectionError(null);
      };

      const handleError = () => {
        if (disposed) return;
        setConnectionError(new Error("[useOBD] WebSocket connection error"));
        setStatus("error");
      };

      const handleClose = () => {
        if (disposed) return;
        setStatus("error");
        scheduleReconnect();
      };

      socket.addEventListener("open", handleOpen);
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("error", handleError);
      socket.addEventListener("close", handleClose);
      activeSocketCleanup = () => {
        socket.removeEventListener("open", handleOpen);
        socket.removeEventListener("message", handleMessage);
        socket.removeEventListener("error", handleError);
        socket.removeEventListener("close", handleClose);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearReconnectTimer();
      cleanupSocket();
    };
  }, [
    websocketUrl,
    websocketMaxRetries,
    websocketRetryBaseDelayMs,
    websocketRetryMaxDelayMs,
  ]);

  const commands: Commands = useMemo(() => {
    const entries = Object.entries(lastValidResponse.pids ?? {});

    const formatted = entries
      .map<Command | null>(([pid, rawValueOrNumber]) => {
        const commandMeta = OBD_COMMANDS[pid];
        if (!commandMeta) {
          return null;
        }

        const copy = getPidCopy(pid, locale);
        const rawValue =
          typeof rawValueOrNumber === "number"
            ? Number.isFinite(rawValueOrNumber)
              ? rawValueOrNumber.toString()
              : ""
            : rawValueOrNumber ?? "";

        return {
          pid,
          rawValue,
          name: copy.name,
          value: commandMeta.formatValue(rawValue),
          description: copy.description,
        };
      })
      .filter((command): command is Command => command !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return formatted;
  }, [lastValidResponse, locale]);

  const pidMap = useMemo(() => {
    const map = new Map<string, Command>();
    commands.forEach((command) => {
      map.set(toPidKey(command.pid), command);
    });
    return map;
  }, [commands]);

  const corePids = useMemo(
    () => commands.filter((command) => isCorePid(command.pid)),
    [commands]
  );

  const otherPids = useMemo(
    () => commands.filter((command) => !isCorePid(command.pid)),
    [commands]
  );

  const combinedError = connectionError ?? parseError;
  const isLoading = status === "idle" || status === "connecting";

  return {
    timestamp: lastValidResponse.timestamp,
    pids: commands,
    corePids,
    otherPids,
    pidMap,
    error: combinedError,
    status,
    isLoading,
  };
}
