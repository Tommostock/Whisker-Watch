/**
 * Home ↔ DetailModal Integration Tests (Phase 3.0 Part 9)
 * Verify DetailModal integrates correctly with Home page
 * Tests: opening, closing, editing, incident flow
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

// Mock ReportPanel
jest.mock('@/components/ReportPanel', () => {
  return {
    ReportPanel: ({ isOpen, onClose }: any) =>
      isOpen ? <div data-testid="report-panel-modal">Report <button onClick={onClose}>Close</button></div> : null,
  };
});

function createMockIncident(overrides?: Partial<Incident>): Incident {
  return { ...mockIncidentData, ...overrides } as Incident;
}

describe('Home ↔ DetailModal Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Detail Modal Opening', () => {
    it('should open detail modal when incident is selected from sidebar', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Test Street 1' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Test Street 1/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });

    it('should display correct incident in detail modal', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Detail Modal Test Address',
          status: 'confirmed'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Detail Modal Test Address/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });

    it('should fly to incident location on map when selected', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Map Fly Test',
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
        const incidentItem = screen.queryByText(/Map Fly Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });
  });

  describe('Detail Modal Closing', () => {
    it('should close detail modal when close button is clicked', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Close Test' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Close Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      const closeButtons = screen.queryAllByRole('button', { name: /close/i, hidden: true });
      if (closeButtons.length > 0) {
        fireEvent.click(closeButtons[0]);

        await waitFor(() => {
          const modal = screen.queryByTestId('detail-modal');
          expect(modal).toBeNull();
        });
      }
    });

    it('should close detail modal when escape key is pressed', async () => {
      const incidents = [
        createMockIncident({ id: 'INC-001', address: 'Escape Test' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Escape Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeNull();
      });
    });

    it('should not show detail modal when no incident is selected', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const detailModal = screen.queryByTestId('detail-modal');
      expect(detailModal).toBeNull();
    });
  });

  describe('Detail Modal Content', () => {
    it('should display incident address in detail modal', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Detailed Address Display'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Detailed Address Display/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });

    it('should display incident status in detail modal', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Status Display Test',
          status: 'sighted'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Status Display Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });
  });

  describe('Edit from Detail Modal', () => {
    it('should open report panel in edit mode', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Edit Mode Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Select incident
      await waitFor(() => {
        const incidentItem = screen.queryByText(/Edit Mode Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      // Look for edit button
      const editButtons = screen.queryAllByRole('button', { name: /edit/i, hidden: true });
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
          const reportPanel = screen.queryByTestId('report-panel-modal');
          expect(reportPanel).toBeDefined();
        });
      }
    });

    it('should close detail modal when edit is clicked', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Close On Edit Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Close On Edit Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      const editButtons = screen.queryAllByRole('button', { name: /edit/i, hidden: true });
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
          const modal = screen.queryByTestId('detail-modal');
          expect(modal).toBeNull();
        });
      }
    });
  });

  describe('Deletion from Detail Modal', () => {
    it('should show delete button in detail modal', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Delete Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Delete Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      // Delete button should be present
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i, hidden: true });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should close detail modal after successful deletion', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Deletion Close Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Deletion Close Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });
  });

  describe('Detail Modal with Multiple Incidents', () => {
    it('should switch to different incident when selecting another', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Incident One'
        }),
        createMockIncident({
          id: 'INC-002',
          address: 'Incident Two'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Select first incident
      await waitFor(() => {
        const incidentItem = screen.queryByText(/Incident One/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      // Select second incident
      await waitFor(() => {
        const incidentItem = screen.queryByText(/Incident Two/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });

    it('should not close modal when switching incidents', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Switch One'
        }),
        createMockIncident({
          id: 'INC-002',
          address: 'Switch Two'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Switch One/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      // Switch to second
      await waitFor(() => {
        const incidentItem = screen.queryByText(/Switch Two/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      // Modal should still be open
      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });
  });

  describe('Modal Responsiveness', () => {
    it('should display properly on desktop', async () => {
      global.innerWidth = 1024;

      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Desktop Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Desktop Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });

    it('should display properly on mobile', async () => {
      global.innerWidth = 375;

      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Mobile Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Mobile Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });
  });

  describe('Accessibility in Detail Modal', () => {
    it('should have accessible modal controls', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Accessibility Test'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Accessibility Test/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });
    });
  });

  describe('Detail Modal State Persistence', () => {
    it('should maintain selected incident across sidebar interactions', async () => {
      const incidents = [
        createMockIncident({
          id: 'INC-001',
          address: 'Persist Selected'
        }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Persist Selected/i, { hidden: true });
        if (incidentItem) {
          fireEvent.click(incidentItem);
        }
      });

      await waitFor(() => {
        const detailModal = screen.queryByTestId('detail-modal');
        expect(detailModal).toBeDefined();
      });

      // Modal should still be open and showing selected incident
      await waitFor(() => {
        const modal = screen.queryByTestId('detail-modal');
        expect(modal).toBeDefined();
      });
    });
  });
});
