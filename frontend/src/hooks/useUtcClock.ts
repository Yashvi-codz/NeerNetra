import { useEffect, useState } from 'react';

function formatUtc(d: Date): string {
  return d.toISOString().slice(11, 19);
}

export function useUtcClock(): string {
  const [time, setTime] = useState(() => formatUtc(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatUtc(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}
