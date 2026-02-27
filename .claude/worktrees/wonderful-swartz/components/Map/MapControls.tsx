/**
 * MapControls Component
 * Control buttons for map (zoom, fit all, satellite, heatmap)
 */

'use client';

import React from 'react';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitAll?: () => void;
  onSatelliteToggle?: (enabled: boolean) => void;
  onHeatmapToggle?: (enabled: boolean) => void;
  showSatellite?: boolean;
  showHeatmap?: boolean;
}

/**
 * MapControls - Navigation buttons for map interactions
 */
export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitAll,
  onSatelliteToggle,
  onHeatmapToggle,
  showSatellite = false,
  showHeatmap = true,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      {/* Zoom Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          className="zoom-btn"
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className="zoom-btn"
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {/* Fit All Button */}
      <button
        className="map-btn"
        onClick={onFitAll}
        title="Fit all incidents in view"
        aria-label="Fit all"
      >
        ↔ FIT ALL
      </button>

      {/* Heatmap Toggle */}
      <button
        className={`map-btn ${showHeatmap ? 'on' : ''}`}
        onClick={() => onHeatmapToggle?.(!showHeatmap)}
        title={`Turn heatmap ${showHeatmap ? 'OFF' : 'ON'}`}
        aria-label="Toggle heatmap"
      >
        🔥 HEATMAP {showHeatmap ? 'ON' : 'OFF'}
      </button>

      {/* Satellite Toggle */}
      <button
        className={`map-btn ${showSatellite ? 'on' : ''}`}
        onClick={() => onSatelliteToggle?.(!showSatellite)}
        title={`Switch to ${showSatellite ? 'street' : 'satellite'} view`}
        aria-label="Toggle satellite view"
      >
        🛰 SATELLITE {showSatellite ? 'ON' : 'OFF'}
      </button>

      {/* Map Legend */}
      <div
        className="map-legend"
        style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          fontSize: '11px',
          minWidth: '140px',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
          Status
        </div>
        <div
          className="leg-row"
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            marginBottom: '6px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            className="leg-dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#e63946',
              flexShrink: 0,
            }}
          />
          Confirmed Case
        </div>
        <div
          className="leg-row"
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            marginBottom: '6px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            className="leg-dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#d4a017',
              flexShrink: 0,
            }}
          />
          Suspected Case
        </div>
        <div
          className="leg-row"
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            marginBottom: '6px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            className="leg-dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#2d9d6e',
              flexShrink: 0,
            }}
          />
          Unconfirmed Case
        </div>
        <div
          className="leg-row"
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <div
            className="leg-dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              flexShrink: 0,
            }}
          />
          Suspect Sighted
        </div>
      </div>

      {/* Attribution */}
      <div
        className="attr"
        style={{
          marginTop: '12px',
          fontSize: '8px',
          color: 'var(--text-dim)',
          lineHeight: '1.3',
          textAlign: 'right',
        }}
      >
        © OpenStreetMap contributors © CARTO
      </div>
    </div>
  );
};

/**
 * Hook for managing map control state
 */
export function useMapControls() {
  const [showSatellite, setShowSatellite] = React.useState(false);
  const [showHeatmap, setShowHeatmap] = React.useState(true);

  return {
    showSatellite,
    showHeatmap,
    setShowSatellite,
    setShowHeatmap,
  };
}
