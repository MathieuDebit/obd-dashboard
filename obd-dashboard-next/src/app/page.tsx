'use client';

import useSWRSubscription from 'swr/subscription'


export default function Home() {
  const { data, error } = useSWRSubscription('ws://0.0.0.0:8765', (key, { next }) => {
    const socket = new WebSocket(key)
    socket.addEventListener('message', (event) => next(null, event.data))
    socket.addEventListener('error', (event) => next((event as ErrorEvent).message))

    return () => socket.close()
  });

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  const { timestamp, pids }: { timestamp: number; pids: Record<string, string> } = JSON.parse(data);

  return (
    <div className="">
      <div>{timestamp}</div>
      {Object.entries(pids).map(([key, value]) => (
        <div key={key}>
          {key}: {value}
        </div>
      ))}
    </div>
  );
}
