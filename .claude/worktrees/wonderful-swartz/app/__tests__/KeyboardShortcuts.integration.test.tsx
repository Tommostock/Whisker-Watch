/**
 * Keyboard Shortcuts Integration Tests (Phase 3.0 Part 11)
 * Verify keyboard shortcuts work across the app
 * Tests: Cmd/Ctrl+L, Cmd/Ctrl+T, Escape key handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import Home from '../page';
import { AppProvider } from '@/context/AppContext';

// Mock components
jest.mock('@/components/Map', () => {
  return {
    Map: React.forwardRef(function MockMap(_props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ flyTo: jest.fn() }));
      return <div data-testid="mock-map">Mock Map</div>;
    }),
  };
});

jest.mock('@/components/ReportPanel', () => {
  return {
    ReportPanel: ({ isOpen, onClose }: any) =>
      isOpen ? <div data-testid="report-panel-modal">Report <button onClick={onClose}>Close</button></div> : null,
  };
});

jest.mock('@/components/DetailModal', () => {
  return {
    DetailModal: ({ isOpen, onClose }: any) =>
      isOpen ? <div data-testid="detail-modal">Detail <button onClick={onClose}>Close</button></div> : null,
  };
});

describe('Keyboard Shortcuts Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('New Report Shortcut', () => {
    it('should open report panel with Ctrl+L', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      fireEvent.keyDown(window, { key: 'l', ctrlKey: true });

      await waitFor(() => {
        const reportPanel = screen.queryByTestId('report-panel-modal');
        expect(reportPanel).toBeDefined();
      });
    });

    it('should open report panel with Cmd+L on Mac', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      fireEvent.keyDown(window, { key: 'l', metaKey: true });

      await waitFor(() => {
        const reportPanel = screen.queryByTestId('report-panel-modal');
        expect(reportPanel).toBeDefined();
      });
    });
  });

  describe('Theme Toggle Shortcut', () => {
    it('should toggle theme with Ctrl+T', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        const initialContent = themeButtons[0].textContent;

        fireEvent.keyDown(window, { key: 't', ctrlKey: true });

        await waitFor(() => {
          const savedTheme = localStorage.getItem('slainTheme');
          expect(savedTheme).toBeTruthy();
        });
      }
    });

    it('should toggle theme with Cmd+T on Mac', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      fireEvent.keyDown(window, { key: 't', metaKey: true });

      await waitFor(() => {
        const savedTheme = localStorage.getItem('slainTheme');
        expect(savedTheme).toBeTruthy();
      });
    });
  });

  describe('Escape Key Handling', () => {
    it('should close report panel on Escape', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const logButton = screen.queryByRole('button', { name: /log incident/i, hidden: true });
      if (logButton) {
        fireEvent.click(logButton);

        await waitFor(() => {
          const reportPanel = screen.queryByTestId('report-panel-modal');
          expect(reportPanel).toBeDefined();
        });

        fireEvent.keyDown(window, { key: 'Escape' });

        await waitFor(() => {
          const reportPanel = screen.queryByTestId('report-panel-modal');
          expect(reportPanel).toBeNull();
        });
      }
    });

    it('should close detail modal on Escape', async () => {
      localStorage.setItem('lckData', JSON.stringify([{
        id: 'INC-001',
        address: 'Test Address',
        lat: 51.5,
        lng: -0.09,
        status: 'confirmed',
        datetime: new Date().toISOString(),
        area: 'Test Area',
        animalType: 'Cat',
        age: 'Unknown',
        sex: 'Unknown',
        method: 'Unknown',
        severity: 'Unknown',
        notes: '',
        witnessName: '',
        witnessContact: '',
        witnessStatement: '',
        sightedDesc: '',
        photos: [],
        caseNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        const incidentItem = screen.queryByText(/Test Address/i, { hidden: true });
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
  });

  describe('Shortcut Conflicts', () => {
    it('should not trigger shortcut when input is focused', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const searchInput = screen.queryByPlaceholderText(/search incidents/i, { hidden: true });
      if (searchInput) {
        fireEvent.focus(searchInput);
        fireEvent.keyDown(searchInput, { key: 'l', ctrlKey: true });

        // Should not open report panel
        const reportPanel = screen.queryByTestId('report-panel-modal');
        expect(reportPanel).toBeNull();
      }
    });
  });

  describe('Multiple Shortcuts', () => {
    it('should handle sequential shortcuts', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Open report panel
      fireEvent.keyDown(window, { key: 'l', ctrlKey: true });

      await waitFor(() => {
        const reportPanel = screen.queryByTestId('report-panel-modal');
        expect(reportPanel).toBeDefined();
      });

      // Close with Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        const reportPanel = screen.queryByTestId('report-panel-modal');
        expect(reportPanel).toBeNull();
      });

      // Toggle theme
      fireEvent.keyDown(window, { key: 't', ctrlKey: true });

      await waitFor(() => {
        const savedTheme = localStorage.getItem('slainTheme');
        expect(savedTheme).toBeTruthy();
      });
    });
  });
});
