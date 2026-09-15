export * from './vessel';
export * from './ais';
export * from './incident';
export * from './environment';
export * from './darkContact';
export * from './replay';

export type MapLayerId =
  | 'spillMask'
  | 'driftBoundary'
  | 'aisTracks'
  | 'sarEvents'
  | 'currentVectors'
  | 'windVectors'
  | 'probableOrigin'
  | 'releaseZone'
  | 'searchRadius'
  | 'candidateVessels'
  | 'fishingZones'
  | 'mpas'
  | 'coast'
  | 'forecastFootprint'
  | 'satelliteFootprints'
  | 'trafficHeatmap'
  | 'routeDensity';

export interface MapLayerDef {
  id: MapLayerId;
  label: string;
  defaultOn: boolean;
  group: 'core' | 'investigation' | 'intelligence';
}

export type SystemFeedStatus = 'ONLINE' | 'DEGRADED' | 'DEMO' | 'OFFLINE';
