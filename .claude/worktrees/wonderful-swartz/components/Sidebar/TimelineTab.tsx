/**
 * TimelineTab Component
 * Chronological view of incidents grouped by date
 */

'use client';

import React, { useMemo } from 'react';
import { Incident } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/constants';

interface TimelineTabProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onIncidentSelect?: (incidentId: string) => void;
}

/**
 * TimelineTab - Chronological view of incidents
 *
 * Features:
 * - Grouped by date
 * - Newest incidents first
 * - Time of day shown for each incident
 * - Click to select and highlight on map
 * - Visual status indicator
 */
export const TimelineTab: React.FC<TimelineTabProps> = ({
  incidents,
  selectedIncidentId,
  onIncidentSelect,
}) => {
  // Group incidents by date
  const timelineGroups = useMemo(() => {
    const grouped: Record<string, Incident[]> = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.datetime);
      // Normalize to date string (YYYY-MM-DD)
      const dateStr = date.toISOString().split('T')[0];

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(incident);
    });

    // Sort each group by time (newest first) and create final array
    return Object.entries(grouped)
      .map(([dateStr, groupIncidents]) => {
        const date = new Date(dateStr);
        return {
          date,
          dateStr,
          incidents: groupIncidents.sort(
            (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
          ),
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest dates first
  }, [incidents]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Timeline */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
        }}
      >
        {timelineGroups.length === 0 ? (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            No incidents
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {timelineGroups.map((group) => (
              <div key={group.dateStr}>
                {/* Date Header */}
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    paddingLeft: '8px',
                  }}
                >
                  {formatDate(group.date)} ({group.incidents.length})
                </div>

                {/* Timeline Events */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {group.incidents.map((incident, idx) => {
                    const isSelected = incident.id === selectedIncidentId;
                    const statusColor = STATUS_COLORS[incident.status] || '#999';
                    const time = formatTime(incident.datetime);

                    return (
                      <div
                        key={incident.id}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          cursor: 'pointer',
                          padding: '8px',
                          backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-secondary)',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => onIncidentSelect?.(incident.id)}
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
                        {/* Timeline Dot */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            minWidth: '30px',
                          }}
                        >
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: statusColor,
                              border: '2px solid var(--bg-primary)',
                              boxSizing: 'border-box',
                            }}
                          />
                          {idx < group.incidents.length - 1 && (
                            <div
                              style={{
                                width: '2px',
                                height: '24px',
                                backgroundColor: 'var(--border-color)',
                              }}
                            />
                          )}
                        </div>

                        {/* Event Info */}
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              marginBottom: '4px',
                            }}
                          >
                            {time}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-primary)',
                              fontWeight: '500',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: '4px',
                            }}
                          >
                            {incident.address || 'Unknown location'}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: 'var(--bg-hover)',
                                padding: '2px 6px',
                                borderRadius: '2px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {incident.status}
                            </span>
                            {incident.animalType && (
                              <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '2px' }}>
                                {incident.animalType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
        {incidents.length} incident{incidents.length !== 1 ? 's' : ''} in timeline
      </div>
    </div>
  );
};

TimelineTab.displayName = 'TimelineTab';
