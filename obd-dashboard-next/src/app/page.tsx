'use client';

import useOBD from './hooks/useOBD';


export default function Home() {
  const { timestamp, pids, error, isLoading } = useOBD();

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return (
    <div className="">
      <div>{timestamp}</div>
      <div>PIDs: {pids.length}</div>
      {pids.map(([key, value]) => (
        <div key={key}>
          {key}: {value}
        </div>
      ))}
    </div>
  );
}
