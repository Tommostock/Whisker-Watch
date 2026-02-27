/**
 * Main Application Page
 * Combines Header, Sidebar, and Map
 */

'use client';

import React, { useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Map } from '@/components/Map';
import type { MapRef } from '@/components/Map';
import { useAppIncidents } from '@/context/AppContext';
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/lib/constants';

/**
 * Home Page - Main application layout
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │         Header                  │
 * ├────────────┬────────────────────┤
 * │  Sidebar   │                    │
 * │ (Incidents,│      Map           │
 * │  Timeline, │   (Canvas-based)   │
 * │   Stats)   │   with controls    │
 * │            │                    │
 * └────────────┴────────────────────┘
 *
 * Interactions:
 * - Click incident in sidebar → selects and highlights on map
 * - Click location on map → opens log incident form
 * - Map controls: pan, zoom, heatmap, satellite, fit all
 */
export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>();
  const { incidents } = useAppIncidents();

  const handleIncidentSelect = (incidentId: string) => {
    setSelectedIncidentId(incidentId);

    // Find incident and fly to it on map
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident && mapRef.current) {
      mapRef.current.flyTo(incident.lat, incident.lng, 14);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    // TODO: Open incident logging form with pre-filled coordinates
    console.log(`Map clicked at: ${lat}, ${lng}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: HEADER_HEIGHT,
          flexShrink: 0,
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Header />
      </div>

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <Sidebar
            selectedIncidentId={selectedIncidentId}
            onIncidentSelect={handleIncidentSelect}
          />
        </div>

        {/* Map */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Map
            ref={mapRef}
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onMapClick={handleMapClick}
            onIncidentClick={handleIncidentSelect}
          />
        </div>
      </div>
    </div>
  );
}
