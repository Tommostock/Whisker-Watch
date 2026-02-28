/**
 * IncidentsTab Component
 * List of incidents with filtering, search, and selection
 */

'use client';

import React, { useMemo } from 'react';
import { Incident } from '@/lib/types';
import { STATUS_COLORS, INCIDENT_STATUS } from '@/lib/constants';
import type { SidebarFiltersHook } from '@/hooks/useSidebarFilters';

interface IncidentsTabProps {
  incidents: Incident[];
  filters: SidebarFiltersHook;
  selectedIncidentId?: string;
  onIncidentSelect?: (incidentId: string) => void;
}

/**
 * IncidentsTab - Searchable and filterable list of incidents
 *
 * Features:
 * - Search by address, notes, witness name, area
 * - Filter by status (unconfirmed, suspected, confirmed, sighted)
 * - Filter by method (trauma type)
 * - Filter by area (borough)
 * - Click to select and highlight on map
 * - Shows incident summary with status color
 */
export const IncidentsTab: React.FC<IncidentsTabProps> = ({
  incidents,
  filters,
  selectedIncidentId,
  onIncidentSelect,
}) => {
  // Get unique areas and methods from all incidents
  const uniqueAreas = useMemo(() => {
    const areas = new Set(incidents.map((i) => i.area).filter(Boolean));
    return Array.from(areas).sort();
  }, [incidents]);

  const uniqueMethods = useMemo(() => {
    const methods = new Set(incidents.map((i) => i.method).filter(Boolean));
    return Array.from(methods).sort();
  }, [incidents]);

  // Sort incidents by date (newest first) and status priority
  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      // Priority order: sighted > confirmed > suspected > unconfirmed
      const priorityMap = { sighted: 0, confirmed: 1, suspected: 2, unconfirmed: 3 };
      const priorityDiff = (priorityMap[a.status] || 999) - (priorityMap[b.status] || 999);
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date (newest first)
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });
  }, [incidents]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Search and Filter Controls */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          gap: '8px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search incidents..."
          value={filters.filters.searchText}
          onChange={(e) => filters.setSearchText(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            boxSizing: 'border-box',
          }}
        />

        {/* Status Filter */}
        <select
          value={filters.filters.statusFilter || ''}
          onChange={(e) => filters.setStatusFilter(e.target.value || null)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        >
          <option value="">All Status</option>
          {Object.entries(INCIDENT_STATUS).map(([key, value]) => (
            <option key={key} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>

        {/* Method Filter */}
        <select
          value={filters.filters.methodFilter || ''}
          onChange={(e) => filters.setMethodFilter(e.target.value || null)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        >
          <option value="">All Methods</option>
          {uniqueMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        {/* Area Filter */}
        <select
          value={filters.filters.areaFilter || ''}
          onChange={(e) => filters.setAreaFilter(e.target.value || null)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        >
          <option value="">All Areas</option>
          {uniqueAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {(filters.filters.searchText ||
          filters.filters.statusFilter ||
          filters.filters.methodFilter ||
          filters.filters.areaFilter) && (
          <button
            onClick={() => filters.clearFilters()}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Incidents List */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px',
        }}
      >
        {sortedIncidents.length === 0 ? (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            No incidents found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sortedIncidents.map((incident) => {
              const isSelected = incident.id === selectedIncidentId;
              const statusColor = STATUS_COLORS[incident.status] || '#999';
              const date = new Date(incident.datetime);
              const dateStr = date.toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={incident.id}
                  onClick={() => onIncidentSelect?.(incident.id)}
                  style={{
                    padding: '10px',
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: `3px solid ${statusColor}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                >
                  {/* Header: Date and Status */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {dateStr}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'white',
                        backgroundColor: statusColor,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {incident.status}
                    </span>
                  </div>

                  {/* Address */}
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {incident.address || 'Unknown location'}
                  </div>

                  {/* Area and Animal Type */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {incident.area && (
                      <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '2px' }}>
                        {incident.area}
                      </span>
                    )}
                    {incident.animalType && (
                      <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '2px' }}>
                        {incident.animalType}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Count */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {sortedIncidents.length} incident{sortedIncidents.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

IncidentsTab.displayName = 'IncidentsTab';
