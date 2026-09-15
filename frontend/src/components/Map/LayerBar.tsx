import React from 'react';
import type { MapLayerDef, MapLayerId } from '@/types';

const SWATCH_COLOR: Partial<Record<MapLayerId, string>> = {
  spillMask: '#ff4d4f',
  driftBoundary: '#f5a623',
  aisTracks: '#37d4ff',
  sarEvents: '#f5a623',
  currentVectors: '#37d4ff',
  windVectors: '#93a4b8',
  probableOrigin: '#ff4d4f',
  releaseZone: '#f5a623',
  searchRadius: '#37d4ff',
  candidateVessels: '#ff4d4f',
  fishingZones: '#35d399',
  mpas: '#37d4ff',
  coast: '#5c7086',
  forecastFootprint: '#5c7086',
  satelliteFootprints: '#37d4ff',
  trafficHeatmap: '#f5a623',
  routeDensity: '#37d4ff',
};

interface LayerBarProps {
  title?: string;
  layers: MapLayerDef[];
  isOn: (id: MapLayerId) => boolean;
  onToggle: (id: MapLayerId) => void;
}

export const LayerBar: React.FC<LayerBarProps> = ({ title = 'LAYERS', layers, isOn, onToggle }) => (
  <div className="layer-bar">
    <div className="layer-bar-title">{title}</div>
    <div className="layer-list">
      {layers.map((layer) => (
        <button
          key={layer.id}
          className={`layer-chip${isOn(layer.id) ? ' on' : ''}`}
          onClick={() => onToggle(layer.id)}
          aria-pressed={isOn(layer.id)}
        >
          <span
            className="layer-chip-swatch"
            style={{ background: isOn(layer.id) ? SWATCH_COLOR[layer.id] ?? '#5c7086' : 'transparent' }}
          />
          {layer.label}
        </button>
      ))}
    </div>
  </div>
);
