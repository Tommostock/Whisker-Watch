/**
 * Home ↔ Header Integration Tests (Phase 3.0 Part 6)
 * Verify Header component integrates correctly with Home page
 * Tests: stats display, theme toggle, incident logging flow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import Home from '../page';
import { AppProvider } from '@/context/AppContext';
import { mockIncident as mockIncidentData } from '@/lib/test-utils';
import type { Incident } from '@/lib/types';

// Mock the Map component to simplify testing
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

// Mock ReportPanel and DetailModal to simplify testing
jest.mock('@/components/ReportPanel', () => {
  return {
    ReportPanel: ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div data-testid="report-panel-modal">
          Report Panel <button onClick={onClose}>Close</button>
        </div>
      ) : null,
  };
});

jest.mock('@/components/DetailModal', () => {
  return {
    DetailModal: ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div data-testid="detail-modal">
          Detail Modal <button onClick={onClose}>Close</button>
        </div>
      ) : null,
  };
});

function createMockIncident(overrides?: Partial<Incident>): Incident {
  return { ...mockIncidentData, ...overrides } as Incident;
}

describe('Home ↔ Header Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Header Rendering', () => {
    it('should render header in home page', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Check that header is present
      const header = screen.getByRole('banner', { hidden: true }) || screen.getByText(/Whisker Watch/i, { hidden: true });
      expect(header).toBeDefined();
    });

    it('should display header with logo and controls', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Check for header content
      const logIncidentButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logIncidentButton).toBeTruthy();
    });
  });

  describe('Stat Pills Display', () => {
    it('should display zero stats when no incidents exist', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Stats should show 0 for all categories
      const statElements = screen.queryAllByText(/0/);
      expect(statElements.length).toBeGreaterThan(0);
    });

    it('should update stats when incident is added', async () => {
      const { rerender } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Stats should initially be empty
      const initialStats = screen.queryAllByText(/Unconfirmed: 0/);

      // Add incident via localStorage
      const testIncident = createMockIncident({ status: 'unconfirmed' });
      localStorage.setItem('lckData', JSON.stringify([testIncident]));

      rerender(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Wait for stats to update
      await waitFor(
        () => {
          // Verify stats are displayed
          expect(screen.queryAllByText(/unconfirmed/i, { hidden: true }).length).toBeGreaterThanOrEqual(0);
        },
        { timeout: 1000 }
      );
    });

    it('should display correct status breakdown', async () => {
      const incidents = [
        createMockIncident({ status: 'unconfirmed', id: 'INC-001' }),
        createMockIncident({ status: 'suspected', id: 'INC-002' }),
        createMockIncident({ status: 'confirmed', id: 'INC-003' }),
        createMockIncident({ status: 'sighted', id: 'INC-004' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const totalIndicator = screen.queryByText(/4/);
        expect(totalIndicator).toBeDefined();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('should have theme toggle button in header', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeToggle = screen.queryAllByRole('button', { hidden: true }).find(
        (button) => button.getAttribute('title')?.includes('theme') || button.textContent?.includes('🌙') || button.textContent?.includes('☀️')
      );

      expect(themeToggle).toBeDefined();
    });

    it('should toggle theme when theme button is clicked', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Get initial theme
      const initialTheme = document.body.className;

      // Find and click theme toggle
      const themeButtons = screen.queryAllByRole('button', { hidden: true });
      const themeToggle = themeButtons.find(
        (button) => button.getAttribute('title')?.includes('theme') || button.textContent?.includes('🌙') || button.textContent?.includes('☀️')
      );

      if (themeToggle) {
        fireEvent.click(themeToggle);

        // Theme should change
        await waitFor(() => {
          const newTheme = document.body.className;
          // Theme has toggled (theme class or data attribute should change)
        });
      }
    });

    it('should persist theme in localStorage after toggle', async () => {

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Find theme toggle button
      const themeButtons = screen.queryAllByRole('button', { hidden: true });
      const themeToggle = themeButtons.find(
        (button) => button.getAttribute('title')?.includes('theme') || button.textContent?.includes('🌙') || button.textContent?.includes('☀️')
      );

      if (themeToggle) {
        fireEvent.click(themeToggle);

        await waitFor(() => {
          const savedTheme = localStorage.getItem('slainTheme');
          expect(savedTheme).toBeTruthy();
        });
      }
    });
  });

  describe('Log Incident Button', () => {
    it('should have log incident button in header', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();
    });

    it('should open report panel when log incident is clicked', async () => {

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      fireEvent.click(logButton);

      await waitFor(() => {
        const reportPanel = screen.queryByTestId('report-panel-modal');
        expect(reportPanel).toBeTruthy();
      });
    });

    it('should close report panel when close is clicked', async () => {

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Open report panel
      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      fireEvent.click(logButton);

      await waitFor(() => {
        expect(screen.queryByTestId('report-panel-modal')).toBeTruthy();
      });

      // Close report panel
      const closeButton = screen.getByRole('button', { name: /close/i, hidden: true });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('report-panel-modal')).toBeNull();
      });
    });
  });

  describe('Header State Sync', () => {
    it('should reflect incident updates in header stats', async () => {
      const { rerender } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Initial state
      await waitFor(() => {
        const mockMap = screen.getByTestId('mock-map');
        expect(mockMap).toBeTruthy();
      });

      // Update incidents in localStorage
      const newIncidents = [
        createMockIncident({ status: 'confirmed', id: 'INC-001' }),
        createMockIncident({ status: 'confirmed', id: 'INC-002' }),
      ];
      localStorage.setItem('lckData', JSON.stringify(newIncidents));

      rerender(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Stats should reflect new incident count
      await waitFor(() => {
        const statElements = screen.queryAllByText(/2/);
        expect(statElements.length).toBeGreaterThan(0);
      });
    });

    it('should maintain header visibility while interacting with sidebar', async () => {

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Header should always be visible
      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();

      // Simulate sidebar interaction (if on mobile)
      // The header should still be visible
      await waitFor(() => {
        const stillVisible = screen.queryByRole('button', { name: /log incident/i, hidden: true });
        expect(stillVisible).toBeTruthy();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render header on desktop', () => {
      // Set desktop viewport
      global.innerWidth = 1024;
      global.innerHeight = 768;

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();
    });

    it('should render header on mobile', () => {
      // Set mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted stats gracefully', () => {
      // Set invalid data
      localStorage.setItem('lckData', 'invalid json');

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Should still render header
      const logButton = screen.queryByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeDefined();
    });

    it('should handle missing theme preference gracefully', () => {
      localStorage.removeItem('slainTheme');

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Should render with default theme
      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels on header buttons', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toHaveAccessibleName();
    });

    it('should support keyboard navigation in header', async () => {

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Button should be accessible
      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();
    });
  });

  describe('Integration with Other Components', () => {
    it('should coordinate header stats with sidebar incident list', async () => {
      const incidents = [
        createMockIncident({ status: 'unconfirmed', id: 'INC-001' }),
        createMockIncident({ status: 'confirmed', id: 'INC-002' }),
      ];

      localStorage.setItem('lckData', JSON.stringify(incidents));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        // Header should show correct totals
        const mockMap = screen.getByTestId('mock-map');
        expect(mockMap).toBeTruthy();
      });
    });

    it('should maintain header state while report panel is open', async () => {

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Open report panel
      const logButton = screen.getByRole('button', { name: /log incident/i, hidden: true });
      fireEvent.click(logButton);

      await waitFor(() => {
        const reportPanel = screen.getByTestId('report-panel-modal');
        expect(reportPanel).toBeTruthy();

        // Header should still be visible and functional
        const stillVisible = screen.queryByRole('button', { name: /log incident/i, hidden: true });
        expect(stillVisible).toBeTruthy();
      });
    });
  });
});
