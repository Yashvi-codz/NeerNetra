import type { MapLayerDef } from '@/types';

export const overviewLayers: MapLayerDef[] = [
  { id: 'spillMask', label: 'SPILL MASK', defaultOn: true, group: 'core' },
  { id: 'aisTracks', label: 'AIS TRACKS', defaultOn: true, group: 'core' },
  { id: 'currentVectors', label: 'CURRENT', defaultOn: true, group: 'core' },
  { id: 'coast', label: 'COASTLINE', defaultOn: true, group: 'core' },
  { id: 'windVectors', label: 'WIND', defaultOn: true, group: 'core' },
  { id: 'fishingZones', label: 'FISHING', defaultOn: true, group: 'core' },
  { id: 'mpas', label: 'MPA', defaultOn: true, group: 'core' },
  { id: 'satelliteFootprints', label: 'SATELLITE', defaultOn: true, group: 'core' },
  { id: 'trafficHeatmap', label: 'TRAFFIC HEATMAP', defaultOn: true, group: 'core' },
  { id: 'routeDensity', label: 'ROUTE DENSITY', defaultOn: true, group: 'core' },
];

export const investigationLayers: MapLayerDef[] = [
  { id: 'spillMask', label: 'SPILL MASK', defaultOn: true, group: 'investigation' },
  { id: 'driftBoundary', label: 'DRIFT BOUNDARY', defaultOn: true, group: 'investigation' },
  { id: 'aisTracks', label: 'AIS TRACKS', defaultOn: true, group: 'investigation' },
  { id: 'sarEvents', label: 'SAR EVENTS', defaultOn: true, group: 'investigation' },
  { id: 'currentVectors', label: 'CURRENT', defaultOn: true, group: 'investigation' },
  { id: 'windVectors', label: 'WIND', defaultOn: true, group: 'investigation' },
  { id: 'probableOrigin', label: 'PROBABLE ORIGIN', defaultOn: true, group: 'investigation' },
  { id: 'releaseZone', label: 'RELEASE ZONE', defaultOn: true, group: 'investigation' },
  { id: 'searchRadius', label: 'SEARCH RADIUS', defaultOn: true, group: 'investigation' },
  { id: 'candidateVessels', label: 'CANDIDATE VESSELS', defaultOn: true, group: 'investigation' },
  { id: 'fishingZones', label: 'FISHING', defaultOn: true, group: 'investigation' },
  { id: 'mpas', label: 'MPA', defaultOn: true, group: 'investigation' },
  { id: 'coast', label: 'COASTLINE', defaultOn: true, group: 'investigation' },
  { id: 'forecastFootprint', label: 'FORECAST (PLACEHOLDER)', defaultOn: true, group: 'investigation' },
];

export const intelligenceLayers: MapLayerDef[] = [
  { id: 'aisTracks', label: 'LIVE TRAFFIC', defaultOn: true, group: 'intelligence' },
  { id: 'routeDensity', label: 'ROUTE DENSITY', defaultOn: true, group: 'intelligence' },
  { id: 'trafficHeatmap', label: 'TRAFFIC HEATMAP', defaultOn: true, group: 'intelligence' },
  { id: 'spillMask', label: 'SPILL LOCATIONS', defaultOn: true, group: 'intelligence' },
];
