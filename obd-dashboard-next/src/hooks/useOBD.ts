import useSWRSubscription from "swr/subscription";
import { OBD_COMMANDS } from "@/utils/formatOBD";
import { Commands } from "@/types/commands";

export default function useOBD() {
  const { data = '{}', error } = useSWRSubscription<string, ErrorEvent>(
    'ws://0.0.0.0:8765',
    (key: string, { next }: {next: any}) => {
      const socket = new WebSocket(key)
      socket.addEventListener('message', (event) => next(null, event.data))
      socket.addEventListener('error', (event) => next((event as ErrorEvent).message))

      return () => socket.close()
    }
  );

  const { timestamp, pids = {} }: { timestamp: number; pids: Record<string, string> } = JSON.parse(data);

  const commands: Commands = [];

  for (const [pid, rawValue] of Object.entries(pids)) {
    const command = OBD_COMMANDS[pid];
    
    if (command) {
      commands.push({
        pid,
        rawValue,
        name: command.name,
        value: command.formatValue(rawValue),
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