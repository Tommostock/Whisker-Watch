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
import { ReportPanel } from '@/components/ReportPanel';
import { DetailModal } from '@/components/DetailModal';
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
  const [reportPanelOpen, setReportPanelOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mapClickCoords, setMapClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [editingIncident, setEditingIncident] = useState<any | null>(null);
  const { incidents } = useAppIncidents();

  const handleIncidentSelect = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setDetailModalOpen(true);

    // Find incident and fly to it on map
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident && mapRef.current) {
      mapRef.current.flyTo(incident.lat, incident.lng, 14);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickCoords({ lat, lng });
    setEditingIncident(null);
    setReportPanelOpen(true);
  };

  const handleEditIncident = (incident: any) => {
    setEditingIncident(incident);
    setDetailModalOpen(false);
    setReportPanelOpen(true);
  };

  const handleOpenReportPanel = () => {
    setEditingIncident(null);
    setMapClickCoords(null);
    setReportPanelOpen(true);
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
        <Header onLogIncidentClick={handleOpenReportPanel} />
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

      {/* Report Panel Modal */}
      <ReportPanel
        isOpen={reportPanelOpen}
        onClose={() => setReportPanelOpen(false)}
        incident={editingIncident}
        initialLat={mapClickCoords?.lat}
        initialLng={mapClickCoords?.lng}
      />

      {/* Detail Modal */}
      {selectedIncidentId && (
        <DetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          incident={incidents.find((i) => i.id === selectedIncidentId) || null}
          onEdit={handleEditIncident}
        />
      )}
    </div>
  );
}
