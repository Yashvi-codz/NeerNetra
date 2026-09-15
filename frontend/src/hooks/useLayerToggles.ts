import { useMemo, useState } from 'react';
import type { MapLayerDef, MapLayerId } from '@/types';

export function useLayerToggles(defs: MapLayerDef[]) {
  const initial = useMemo(() => {
    const state: Record<string, boolean> = {};
    defs.forEach((d) => {
      state[d.id] = d.defaultOn;
    });
    return state;
  }, [defs]);

  const [active, setActive] = useState<Record<string, boolean>>(initial);

  const toggle = (id: MapLayerId) => {
    setActive((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isOn = (id: MapLayerId) => Boolean(active[id]);

  return { active, toggle, isOn };
}
