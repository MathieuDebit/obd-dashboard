import { useCallback, useEffect, useMemo, useState } from "react";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { OBD_COMMANDS } from "@/utils/formatOBD";
import { Command, Commands, OBDServerResponse } from "@/types/commands";

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

  const { data } = useSWRSubscription(WS_URL, subscriber);

  useEffect(() => {
    if (!data) return;

    try {
      const parsed = JSON.parse(data) as Partial<OBDServerResponse>;
      const normalized = normalizeResponse(parsed);
      setLastValidResponse(normalized);
      setParseError(null);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("[useOBD] Failed to parse OBD payload");
      setParseError(error);
      console.warn(error);
    }
  }, [data]);

  const commands: Commands = useMemo(() => {
    const entries = Object.entries(lastValidResponse.pids ?? {});

    const formatted = entries
      .map<Command | null>(([pid, rawValue]) => {
        const command = OBD_COMMANDS[pid];
        if (!command) {
          return null;
        }

        return {
          pid,
          rawValue,
          name: command.name,
          value: command.formatValue(rawValue),
          description: command.description,
        };
      })
      .filter((command): command is Command => command !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return formatted;
  }, [lastValidResponse]);

  const combinedError = connectionError ?? parseError;
  const isLoading = status !== "ready";

  return {
    timestamp: lastValidResponse.timestamp,
    pids: commands,
    error: combinedError,
    status,
    isLoading,
  };
}
