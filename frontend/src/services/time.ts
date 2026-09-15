// NEERNETRA demo data is pinned to 2026-09-13 so "freshness" labels stay
// coherent regardless of when Phase 1 is actually run. A real deployment
// would compare against Date.now().
const DEMO_NOW = new Date('2026-09-13T14:32:18Z').getTime();

export function minutesAgo(isoTimestamp: string): string {
  const diffMs = DEMO_NOW - new Date(isoTimestamp).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins} MIN AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} HR ${mins % 60}M AGO`;
  const days = Math.floor(hrs / 24);
  return `${days}D AGO`;
}

export function formatUtcClock(isoTimestamp: string): string {
  return new Date(isoTimestamp).toISOString().slice(11, 16) + ' UTC';
}

export function formatUtcDate(isoTimestamp: string): string {
  return new Date(isoTimestamp).toISOString().slice(0, 10);
}
