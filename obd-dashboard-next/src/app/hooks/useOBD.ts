import useSWRSubscription from "swr/subscription";

export default function useOBD() {
  const { data, error } = useSWRSubscription('ws://0.0.0.0:8765', (key, { next }) => {
    const socket = new WebSocket(key)
    socket.addEventListener('message', (event) => next(null, event.data))
    socket.addEventListener('error', (event) => next((event as ErrorEvent).message))

    return () => socket.close()
  });

  const { timestamp, pids }: { timestamp: number; pids: Record<string, string> } = JSON.parse(data || '{}');

  return {
    timestamp,
    pids: Object.entries(pids || {}),
    error,
    isLoading: !data,
  }
}