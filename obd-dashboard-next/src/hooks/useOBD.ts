import { useCallback } from "react";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { OBD_COMMANDS } from "@/utils/formatOBD";
import { Commands, OBDServerResponse } from "@/types/commands";

export default function useOBD() {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765";

  const subscriber = useCallback(
    (key: string, { next }: SWRSubscriptionOptions<string, Error>) => {
      const socket = new WebSocket(key);

      socket.addEventListener("open", () =>
        console.log("[useOBD] WebSocket connected")
      );
      socket.addEventListener("message", (event) => next(null, event.data));
      socket.addEventListener("error", () =>
        console.log(new Error("[useOBD] WebSocket connection error"))
      );

      return () => {
        console.log("[useOBD] Closing WebSocket");
        socket.close();
      };
    }, []);

  const { data = "{}", error } = useSWRSubscription(WS_URL, subscriber);

  const { timestamp, pids = {} }: OBDServerResponse = JSON.parse(data);
  const commands: Commands = [];

  for (const [pid, rawValue] of Object.entries(pids)) {
    const command = OBD_COMMANDS[pid];
    if (command) {
      commands.push({
        pid,
        rawValue,
        name: command.name,
        value: command.formatValue(rawValue),
        description: command.description,
      });
    }
  }

  return {
    timestamp,
    pids: commands.sort((a, b) => a.name.localeCompare(b.name)),
    error,
    isLoading: !data,
  }
}