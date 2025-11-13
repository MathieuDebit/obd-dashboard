import { useCallback, useMemo, useState } from "react";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { OBD_COMMANDS } from "@/utils/formatOBD";
import { Command, Commands, OBDServerResponse } from "@/types/commands";
import { isCorePid, toPidKey } from "@/constants/pids";
import { getPidCopy } from "@/utils/i18n";
import { useLanguage } from "@/app/LanguageContext";

type ConnectionStatus = "idle" | "connecting" | "ready" | "error";

const DEFAULT_RESPONSE: OBDServerResponse = {
  timestamp: 0,
  pids: {},
};

const normalizeResponse = (payload: Partial<OBDServerResponse>): OBDServerResponse => {
  const timestamp =
    typeof payload.timestamp === "number" ? payload.timestamp : Date.now();
  const pids =
    payload.pids && typeof payload.pids === "object" ? payload.pids : {};

  return { timestamp, pids };
};

export default function useOBD() {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765";
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [parseError, setParseError] = useState<Error | null>(null);
  const [lastValidResponse, setLastValidResponse] =
    useState<OBDServerResponse>(DEFAULT_RESPONSE);
  const { locale } = useLanguage();

  const subscriber = useCallback(
    (key: string, { next }: SWRSubscriptionOptions<string, Error>) => {
      let isUnmounted = false;
      setStatus("connecting");

      const socket = new WebSocket(key);

      const handleOpen = () => {
        if (isUnmounted) return;
        setStatus("ready");
        setConnectionError(null);
      };

      const handleMessage = (event: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(event.data) as Partial<OBDServerResponse>;
          const normalized = normalizeResponse(parsed);
          setLastValidResponse(normalized);
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
        next(null, event.data);
      };

      const handleError = () => {
        if (isUnmounted) return;
        const error = new Error("[useOBD] WebSocket connection error");
        setConnectionError(error);
        setStatus("error");
      };

      const handleClose = () => {
        if (isUnmounted) return;
        setStatus("error");
      };

      socket.addEventListener("open", handleOpen);
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("error", handleError);
      socket.addEventListener("close", handleClose);

      return () => {
        isUnmounted = true;
        socket.removeEventListener("open", handleOpen);
        socket.removeEventListener("message", handleMessage);
        socket.removeEventListener("error", handleError);
        socket.removeEventListener("close", handleClose);
        socket.close();
      };
    },
    []
  );

  useSWRSubscription(WS_URL, subscriber);

  const commands: Commands = useMemo(() => {
    const entries = Object.entries(lastValidResponse.pids ?? {});

    const formatted = entries
      .map<Command | null>(([pid, rawValue]) => {
        const commandMeta = OBD_COMMANDS[pid];
        if (!commandMeta) {
          return null;
        }

        const copy = getPidCopy(pid, locale);

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
  const isLoading = status !== "ready";

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
