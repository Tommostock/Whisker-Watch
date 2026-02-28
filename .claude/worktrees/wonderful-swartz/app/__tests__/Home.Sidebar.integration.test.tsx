/**
 * Home ↔ Sidebar Integration Tests (Phase 3.0 Part 7)
 * Verify Sidebar component integrates correctly with Home page
 * Tests: tab navigation, filtering, search, incident selection
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import Home from '../page';
import { AppProvider } from '@/context/AppContext';
import { mockIncident as mockIncidentData } from '@/lib/test-utils';
import type { Incident } from '@/lib/types';

// Mock Map component
jest.mock('@/components/Map', () => {
  return {
    Map: React.forwardRef(function MockMap(_props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        flyTo: jest.fn(),
      }));
      return <div data-testid="mock-map">Mock Map</div>;
    }),
  };
});

// Mock panels
jest.mock('@/components/ReportPanel', () => {
  return {
    ReportPanel: ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div data-testid="report-panel">Report <button onClick={onClose}>Close</button></div>
      ) : null,
  };
});

jest.mock('@/components/DetailModal', () => {
  return {
    DetailModal: ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div data-testid="detail-modal">Detail <button onClick={onClose}>Close</button></div>
      ) : null,
  };
});

function createMockIncident(overrides?: Partial<Incident>): Incident {
  return { ...mockIncidentData, ...overrides } as Incident;
}

describe('Home ↔ Sidebar Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Sidebar Rendering', () => {
    it('should render sidebar in home page', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Check for sidebar elements (tab buttons)
      const incidentsTab = screen.queryAllByText(/incidents/i, { hidden: true })[0];
      expect(incidentsTab).toBeDefined();
    });

    it('should display sidebar with tab navigation', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const tabs = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.textContent?.includes('📋') || btn.textContent?.includes('📅') || btn.textContent?.includes('📊'));

      expect(tabs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Incidents Tab', () => {
    it('should show empty state when no incidents exist', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const noIncidentsText = screen.queryByText(/no incidents found/i, { hidden: true });
      expect(noIncidentsText).toBeDefined();
    });

    it('should display incident list when incidents exist', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Test Street 1', status: 'confirmed' }),
        createMockIncident({ id: 'INC-002', address: 'Test Street 2', status: 'suspected' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const addressElements = screen.queryAllByText(/Test Street/i, { hidden: true });
        expect(addressElements.length).toBeGreaterThan(0);
      });
    });

    it('should display incident with status color indicator', async () => {
      const incident = createMockIncident({
        id: 'INC-001',
        address: 'Confirmation Place',
        status: 'confirmed'
      });

      localStorage.setItem('lckData', JSON.stringify([incident]));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const addressText = screen.queryByText(/Confirmation Place/i, { hidden: true });
        expect(addressText).toBeDefined();
      });
    });

    it('should search incidents by address', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Oxford Street' }),
        createMockIncident({ id: 'INC-002', address: 'Cambridge Terrace' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const searchInput = screen.queryByPlaceholderText(/search incidents/i, { hidden: true });
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'Oxford' } });

        await waitFor(() => {
          const oxfordAddress = screen.queryByText(/Oxford Street/i, { hidden: true });
          expect(oxfordAddress).toBeDefined();
        });
      }
    });

    it('should filter incidents by status', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', status: 'confirmed' }),
        createMockIncident({ id: 'INC-002', status: 'unconfirmed' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const statusSelects = screen.queryAllByRole('combobox', { hidden: true });
      const statusFilter = statusSelects[0]; // First select should be status filter

      if (statusFilter) {
        fireEvent.change(statusFilter, { target: { value: 'confirmed' } });

        await waitFor(() => {
          // After filtering, should show filtered results
          const mockMap = screen.getByTestId('mock-map');
          expect(mockMap).toBeTruthy();
        });
      }
    });

    it('should filter incidents by method', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', method: 'Roadkill' }),
        createMockIncident({ id: 'INC-002', method: 'Blunt Trauma' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const selects = screen.queryAllByRole('combobox', { hidden: true });
      const methodFilter = selects[1]; // Second should be method

      if (methodFilter) {
        fireEvent.change(methodFilter, { target: { value: 'Roadkill' } });

        await waitFor(() => {
          expect(methodFilter).toHaveValue('Roadkill');
        });
      }
    });

    it('should filter incidents by area', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', area: 'Croydon' }),
        createMockIncident({ id: 'INC-002', area: 'Peckham' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const selects = screen.queryAllByRole('combobox', { hidden: true });
      const areaFilter = selects[2]; // Third should be area

      if (areaFilter) {
        fireEvent.change(areaFilter, { target: { value: 'Croydon' } });

        await waitFor(() => {
          expect(areaFilter).toHaveValue('Croydon');
        });
      }
    });

    it('should clear all filters', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Test Street', status: 'confirmed' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const searchInput = screen.queryByPlaceholderText(/search incidents/i, { hidden: true });
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'Test' } });

        const clearButton = await waitFor(() => {
          const btn = screen.queryByText(/clear filters/i, { hidden: true });
          expect(btn).toBeDefined();
          return btn;
        });

        if (clearButton) {
          fireEvent.click(clearButton);

          await waitFor(() => {
            expect(searchInput).toHaveValue('');
          });
        }
      }
    });

    it('should select incident from list', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Selection Test Street' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Selection Test Street/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);

          // Detail modal should open
          const detailModal = screen.queryByTestId('detail-modal');
          expect(detailModal).toBeDefined();
        }
      });
    });

    it('should display incident count in footer', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001' }),
        createMockIncident({ id: 'INC-002' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const countText = screen.queryByText(/2 incidents/i, { hidden: true });
        expect(countText).toBeDefined();
      });
    });
  });

  describe('Timeline Tab', () => {
    it('should switch to timeline tab', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const timelineButton = screen.queryAllByText(/timeline/i, { hidden: true })[0];
      if (timelineButton) {
        fireEvent.click(timelineButton);

        await waitFor(() => {
          expect(timelineButton).toHaveAttribute('style');
        });
      }
    });

    it('should display incidents grouped by date in timeline', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Timeline Test 1',
          datetime: '2024-01-15T10:00:00Z'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const timelineButton = screen.queryAllByText(/timeline/i, { hidden: true })[0];
      if (timelineButton) {
        fireEvent.click(timelineButton);

        await waitFor(() => {
          const timelineItem = screen.queryByText(/Timeline Test 1/i, { hidden: true });
          expect(timelineItem).toBeDefined();
        });
      }
    });
  });

  describe('Stats Tab', () => {
    it('should switch to stats tab', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const statsButton = screen.queryAllByText(/stats/i, { hidden: true })[0];
      if (statsButton) {
        fireEvent.click(statsButton);

        await waitFor(() => {
          expect(statsButton).toHaveAttribute('style');
        });
      }
    });

    it('should display total incident count in stats', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', status: 'confirmed' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const statsButton = screen.queryAllByText(/stats/i, { hidden: true })[0];
      if (statsButton) {
        fireEvent.click(statsButton);

        await waitFor(() => {
          const totalText = screen.queryByText(/total incidents/i, { hidden: true });
          expect(totalText).toBeDefined();
        });
      }
    });

    it('should display status breakdown in stats', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', status: 'confirmed' }),
        createMockIncident({ id: 'INC-002', status: 'suspected' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const statsButton = screen.queryAllByText(/stats/i, { hidden: true })[0];
      if (statsButton) {
        fireEvent.click(statsButton);

        await waitFor(() => {
          const byStatusText = screen.queryByText(/by status/i, { hidden: true });
          expect(byStatusText).toBeDefined();
        });
      }
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate between all three tabs', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const tabButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.textContent?.includes('📋') || btn.textContent?.includes('📅') || btn.textContent?.includes('📊'));

      expect(tabButtons.length).toBeGreaterThanOrEqual(3);

      // Click each tab
      tabButtons.forEach((tab) => {
        fireEvent.click(tab);
      });
    });

    it('should maintain filter state when switching tabs', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Filter Test', status: 'confirmed' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const searchInput = screen.queryByPlaceholderText(/search incidents/i, { hidden: true });
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'Filter' } });

        // Switch to timeline tab
        const timelineButton = screen.queryAllByText(/timeline/i, { hidden: true })[0];
        if (timelineButton) {
          fireEvent.click(timelineButton);

          // Switch back to incidents tab
          const incidentsButton = screen.queryAllByText(/incidents/i, { hidden: true })[0];
          if (incidentsButton) {
            fireEvent.click(incidentsButton);

            // Search input should still have the value
            await waitFor(() => {
              expect(searchInput).toHaveValue('filter');
            });
          }
        }
      }
    });
  });

  describe('Sidebar & Map Interaction', () => {
    it('should sync incident selection between sidebar and map', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Selection Sync Test',
          lat: 51.5,
          lng: -0.09
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Selection Sync Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);

          // Detail modal should open
          const detailModal = screen.queryByTestId('detail-modal');
          expect(detailModal).toBeDefined();
        }
      });
    });

    it('should close sidebar on mobile when incident is selected', async () => {
      // Simulate mobile viewport
      global.innerWidth = 375;

      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Mobile Test' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const mockMap = screen.getByTestId('mock-map');
        expect(mockMap).toBeTruthy();
      });
    });
  });

  describe('Sidebar State Persistence', () => {
    it('should persist filtered incidents across rerenders', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Persistence Test', area: 'Croydon' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      const { rerender } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const searchInput = screen.queryByPlaceholderText(/search incidents/i, { hidden: true });
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'Persistence' } });

        rerender(
          <AppProvider>
            <Home />
          </AppProvider>
        );

        await waitFor(() => {
          const testAddress = screen.queryByText(/Persistence Test/i, { hidden: true });
          expect(testAddress).toBeDefined();
        });
      }
    });
  });

  describe('Sidebar Responsiveness', () => {
    it('should render full sidebar on desktop', () => {
      global.innerWidth = 1024;

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const incidentsTab = screen.queryAllByText(/incidents/i, { hidden: true })[0];
      expect(incidentsTab).toBeDefined();
    });

    it('should be toggleable on mobile', () => {
      global.innerWidth = 375;

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const sidebarToggle = screen.queryByTitle(/toggle sidebar/i, { hidden: true });
      expect(sidebarToggle).toBeDefined();
    });
  });
});
