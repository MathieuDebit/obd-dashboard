import useSWRSubscription from "swr/subscription";

export type Command = {
  pid: string,
  formatted: string,
  value: string
}

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

  const commands: Command[] = [];

  for (const [pid, value] of Object.entries(pids)) {
    commands.push({
      pid,
      formatted: 'formatted value',
      value
    });
  }

  return {
    timestamp,
    pids: commands,
    error,
    isLoading: !data,
  }
}