/**
 * Map Component
 * Wrapper combining MapEngine and MapControls
 * Exported as main map interface
 */

'use client';

import React, { useRef } from 'react';
import { Incident } from '@/lib/types';
import { MapEngine } from './MapEngine';
import { MapControls, useMapControls } from './MapControls';

interface MapProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onMapClick?: (lat: number, lng: number) => void;
  onIncidentClick?: (incidentId: string) => void;
  onMapStateChange?: (lat: number, lng: number, zoom: number) => void;
}

export interface MapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitAll: () => void;
}

/**
 * Map - Complete map interface with controls
 *
 * Usage:
 * const mapRef = useRef<MapRef>(null);
 *
 * <Map
 *   ref={mapRef}
 *   incidents={incidents}
 *   onMapClick={(lat, lng) => handleMapClick(lat, lng)}
 *   onIncidentClick={(id) => handleIncidentClick(id)}
 * />
 *
 * // Programmatically control map:
 * mapRef.current?.flyTo(51.5, -0.09, 14);
 * mapRef.current?.fitAll();
 */
export const Map = React.forwardRef<MapRef, MapProps>(
  (
    {
      incidents,
      selectedIncidentId,
      onMapClick,
      onIncidentClick,
      onMapStateChange,
    },
    ref
  ) => {
    const mapEngineRef = useRef(null);
    const { showSatellite, showHeatmap, setShowSatellite, setShowHeatmap } =
      useMapControls();

    // Forward methods to parent
    React.useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number, zoom?: number) => {
        (mapEngineRef.current as any)?.flyTo(lat, lng, zoom);
      },
      fitAll: () => {
        (mapEngineRef.current as any)?.fitAll();
      },
    }));

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <MapEngine
          ref={mapEngineRef}
          incidents={incidents}
          selectedIncidentId={selectedIncidentId}
          onMapClick={onMapClick}
          onIncidentClick={onIncidentClick}
          onMapStateChange={onMapStateChange}
          showHeatmap={showHeatmap}
          showSatellite={showSatellite}
        />

        <MapControls
          onZoomIn={() => {
            const state = (mapEngineRef.current as any)?.getMapState?.();
            if (state) {
              (mapEngineRef.current as any)?.setMapState({
                ...state,
                zoom: Math.min(state.zoom + 1, 17),
              });
            }
          }}
          onZoomOut={() => {
            const state = (mapEngineRef.current as any)?.getMapState?.();
            if (state) {
              (mapEngineRef.current as any)?.setMapState({
                ...state,
                zoom: Math.max(state.zoom - 1, 5),
              });
            }
          }}
          onFitAll={() => {
            (mapEngineRef.current as any)?.fitAll();
          }}
          onSatelliteToggle={setShowSatellite}
          onHeatmapToggle={setShowHeatmap}
          showSatellite={showSatellite}
          showHeatmap={showHeatmap}
        />
      </div>
    );
  }
);

Map.displayName = 'Map';
