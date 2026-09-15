import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_OFFSET = -24;
const MAX_OFFSET = 24;
const SIM_HOURS_PER_SECOND_AT_1X = 0.5; // 48h span plays out in ~96s at 1x

export type ReplaySpeed = 0.5 | 1 | 2 | 4;

export function useReplayClock(initialOffset = MIN_OFFSET) {
  const [offsetHours, setOffsetHours] = useState(initialOffset);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      lastTickRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setOffsetHours((prev) => {
        const next = prev + deltaSeconds * SIM_HOURS_PER_SECOND_AT_1X * speed;
        if (next >= MAX_OFFSET) {
          setPlaying(false);
          return MAX_OFFSET;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed]);

  const play = useCallback(() => {
    setOffsetHours((cur) => (cur >= MAX_OFFSET ? MIN_OFFSET : cur));
    setPlaying(true);
  }, []);
  const pause = useCallback(() => setPlaying(false), []);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  const stepBack = useCallback((hours = 1) => {
    setPlaying(false);
    setOffsetHours((cur) => Math.max(MIN_OFFSET, cur - hours));
  }, []);
  const stepForward = useCallback((hours = 1) => {
    setPlaying(false);
    setOffsetHours((cur) => Math.min(MAX_OFFSET, cur + hours));
  }, []);
  const scrubTo = useCallback((hours: number) => {
    setPlaying(false);
    setOffsetHours(Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, hours)));
  }, []);

  return {
    offsetHours,
    playing,
    speed,
    setSpeed,
    play,
    pause,
    togglePlay,
    stepBack,
    stepForward,
    scrubTo,
    minOffset: MIN_OFFSET,
    maxOffset: MAX_OFFSET,
  };
}
