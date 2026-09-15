import React from 'react';
import type { ReplaySpeed } from '@/hooks/useReplayClock';
import type { ReplayEvent } from '@/types';

const SPEEDS: ReplaySpeed[] = [0.5, 1, 2, 4];

interface ReplayControlsProps {
  offsetHours: number;
  playing: boolean;
  speed: ReplaySpeed;
  minOffset: number;
  maxOffset: number;
  events: ReplayEvent[];
  currentTimeLabel: string;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSetSpeed: (speed: ReplaySpeed) => void;
  onScrub: (offsetHours: number) => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  offsetHours,
  playing,
  speed,
  minOffset,
  maxOffset,
  events,
  currentTimeLabel,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onSetSpeed,
  onScrub,
}) => {
  const range = maxOffset - minOffset;

  return (
    <div className="replay-bar" style={{ flexWrap: 'wrap' }}>
      <div className="replay-transport">
        <button className="replay-btn" onClick={onStepBack} aria-label="Step back 1 hour" title="Step back 1 hour">
          ⏮
        </button>
        <button className="replay-btn play" onClick={onTogglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="replay-btn" onClick={onStepForward} aria-label="Step forward 1 hour" title="Step forward 1 hour">
          ⏭
        </button>
      </div>

      <div className="replay-speed-group">
        {SPEEDS.map((s) => (
          <button key={s} className={`replay-speed-btn${speed === s ? ' active' : ''}`} onClick={() => onSetSpeed(s)}>
            {s}x
          </button>
        ))}
      </div>

      <div className="replay-clock">{currentTimeLabel}</div>

      <div className="replay-scrubber">
        <input
          type="range"
          min={minOffset}
          max={maxOffset}
          step={0.1}
          value={offsetHours}
          onChange={(e) => onScrub(Number(e.target.value))}
        />
        {events.map((ev) => (
          <span
            key={ev.id}
            className="replay-event-marker"
            title={`${ev.title} (T${ev.offsetHours >= 0 ? '+' : ''}${ev.offsetHours.toFixed(1)}H)`}
            style={{
              left: `${((ev.offsetHours - minOffset) / range) * 100}%`,
              background: 'var(--amber)',
            }}
            onClick={() => onScrub(ev.offsetHours)}
          />
        ))}
        <div className="replay-scrubber-ticks">
          <span>T{minOffset}H</span>
          <span>T-12H</span>
          <span>T0</span>
          <span>T+12H</span>
          <span>T+{maxOffset}H</span>
        </div>
      </div>
    </div>
  );
};
