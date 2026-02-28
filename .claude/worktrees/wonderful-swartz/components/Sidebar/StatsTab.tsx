/**
 * StatsTab Component
 * Analytics and incident breakdown charts
 */

'use client';

import React, { useMemo } from 'react';
import { Incident } from '@/lib/types';
import { STATUS_COLORS, INCIDENT_STATUS } from '@/lib/constants';
import type { SidebarFiltersHook } from '@/hooks/useSidebarFilters';

interface StatsTabProps {
  incidents: Incident[];
  filteredIncidents: Incident[];
  filters: SidebarFiltersHook;
}

interface StatItem {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

/**
 * StatsTab - Analytics and incident breakdown
 *
 * Features:
 * - Total incidents count
 * - Breakdown by status
 * - Breakdown by method
 * - Top affected areas
 * - Shows both total and filtered counts
 */
export const StatsTab: React.FC<StatsTabProps> = ({ incidents, filteredIncidents, filters }) => {
  const stats = useMemo(() => {
    const filtered = filters.getFilteredStats(filteredIncidents);
    const total = filters.getFilteredStats(incidents);

    return { filtered, total };
  }, [incidents, filteredIncidents, filters]);

  // Get top areas
  const topAreas = useMemo(() => {
    const areas = stats.filtered.byArea;
    return Object.entries(areas)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats.filtered.byArea]);

  // Get top methods
  const topMethods = useMemo(() => {
    const methods = stats.filtered.byMethod;
    return Object.entries(methods)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats.filtered.byMethod]);

  const renderChart = (items: StatItem[]) => {
    const maxValue = Math.max(...items.map((i) => i.value), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <div key={item.label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
                fontSize: '12px',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <span
                style={{
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {item.value}
                {item.percentage !== undefined && ` (${item.percentage}%)`}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: item.color,
                  width: `${(item.value / maxValue) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const statusItems: StatItem[] = Object.entries(INCIDENT_STATUS)
    .map(([, status]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: stats.filtered.byStatus[status] || 0,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#999',
      percentage:
        stats.filtered.total > 0 ? Math.round(((stats.filtered.byStatus[status] || 0) / stats.filtered.total) * 100) : 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Stats Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Total Count */}
        <div
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Total Incidents
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--accent-color)',
            }}
          >
            {stats.filtered.total}
          </div>
          {stats.filtered.total !== stats.total.total && (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginTop: '6px',
              }}
            >
              {stats.total.total} total ({Math.round((stats.filtered.total / stats.total.total) * 100)}% filtered)
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        {statusItems.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              By Status
            </div>
            {renderChart(statusItems)}
          </div>
        )}

        {/* Top Methods */}
        {topMethods.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Top Methods
            </div>
            {renderChart(
              topMethods.map(([method, count]) => ({
                label: method,
                value: count,
                color: '#6366f1',
                percentage: Math.round((count / stats.filtered.total) * 100),
              }))
            )}
          </div>
        )}

        {/* Top Areas */}
        {topAreas.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Top Areas
            </div>
            {renderChart(
              topAreas.map(([area, count]) => ({
                label: area,
                value: count,
                color: '#8b5cf6',
                percentage: Math.round((count / stats.filtered.total) * 100),
              }))
            )}
          </div>
        )}

        {/* Animal Types */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
          >
            Animal Types
          </div>
          {(() => {
            const animalTypes = new Map<string, number>();
            filteredIncidents.forEach((incident) => {
              const type = incident.animalType || 'Unknown';
              animalTypes.set(type, (animalTypes.get(type) || 0) + 1);
            });

            const items = Array.from(animalTypes.entries())
              .map(([type, count]) => ({
                label: type,
                value: count,
                color: '#14b8a6',
                percentage: Math.round((count / stats.filtered.total) * 100),
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5);

            return items.length > 0 ? (
              renderChart(items)
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No data</div>
            );
          })()}
        </div>
      </div>

      {/* Footer: Info */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}
      >
        {Object.keys(stats.filtered.byStatus).reduce((sum, status) => {
          return sum + (stats.filtered.byStatus[status] || 0);
        }, 0)}{' '}
        incidents shown
      </div>
    </div>
  );
};

StatsTab.displayName = 'StatsTab';
