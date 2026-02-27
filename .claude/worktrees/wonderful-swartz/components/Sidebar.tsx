/**
 * Sidebar Component
 * Left sidebar with incidents list, timeline, and stats
 * Tab-based navigation (IncidentsTab, TimelineTab, StatsTab)
 */

'use client';

import React, { useState } from 'react';
import { useAppIncidents } from '@/context/AppContext';
import { useSidebarFilters } from '@/hooks/useSidebarFilters';
import { SIDEBAR_WIDTH } from '@/lib/constants';
import { IncidentsTab } from './Sidebar/IncidentsTab';
import { TimelineTab } from './Sidebar/TimelineTab';
import { StatsTab } from './Sidebar/StatsTab';

type TabType = 'incidents' | 'timeline' | 'stats';

interface SidebarProps {
  selectedIncidentId?: string;
  onIncidentSelect?: (incidentId: string) => void;
}

/**
 * Sidebar - Main container for incident management tabs
 *
 * Features:
 * - Incidents Tab: List with filtering and search
 * - Timeline Tab: Chronological view
 * - Stats Tab: Analytics and breakdown charts
 * - Mobile responsive (slide-in on small screens)
 * - Synced with map selection
 */
export const Sidebar: React.FC<SidebarProps> = ({ selectedIncidentId, onIncidentSelect }) => {
  const [activeTab, setActiveTab] = useState<TabType>('incidents');
  const { incidents } = useAppIncidents();
  const sidebarFilters = useSidebarFilters();

  const filteredIncidents = sidebarFilters.filterIncidents(incidents);

  return (
    <div
      style={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        {[
          { id: 'incidents' as TabType, label: 'Incidents', icon: '📋' },
          { id: 'timeline' as TabType, label: 'Timeline', icon: '📅' },
          { id: 'stats' as TabType, label: 'Stats', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
            title={tab.label}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'incidents' && (
          <IncidentsTab
            incidents={filteredIncidents}
            filters={sidebarFilters}
            selectedIncidentId={selectedIncidentId}
            onIncidentSelect={onIncidentSelect}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            incidents={filteredIncidents}
            selectedIncidentId={selectedIncidentId}
            onIncidentSelect={onIncidentSelect}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            incidents={incidents}
            filteredIncidents={filteredIncidents}
            filters={sidebarFilters}
          />
        )}
      </div>
    </div>
  );
};

Sidebar.displayName = 'Sidebar';
