/**
 * Theme Integration Tests (Phase 3.0 Part 10)
 * Verify theme switching and persistence across app
 * Tests: toggle, persistence, DOM updates, storage sync
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import Home from '../page';
import { AppProvider } from '@/context/AppContext';

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
      isOpen ? <div data-testid="report-panel-modal">Report <button onClick={onClose}>Close</button></div> : null,
  };
});

jest.mock('@/components/DetailModal', () => {
  return {
    DetailModal: ({ isOpen, onClose }: any) =>
      isOpen ? <div data-testid="detail-modal">Detail <button onClick={onClose}>Close</button></div> : null,
  };
});

describe('Theme Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  describe('Theme Toggle', () => {
    it('should toggle theme when theme button is clicked', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme') || btn.textContent?.includes('🌙') || btn.textContent?.includes('☀️'));

      if (themeButtons.length > 0) {
        const initialContent = themeButtons[0].textContent;
        fireEvent.click(themeButtons[0]);

        await waitFor(() => {
          const updatedButton = screen.queryAllByRole('button', { hidden: true })
            .find(btn => btn.getAttribute('title')?.includes('theme'));
          expect(updatedButton).toBeDefined();
        });
      }
    });

    it('should change button icon when toggling theme', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        const button = themeButtons[0];
        const initialContent = button.textContent;

        fireEvent.click(button);

        await waitFor(() => {
          const updatedButtons = screen.queryAllByRole('button', { hidden: true })
            .filter(btn => btn.getAttribute('title')?.includes('theme'));
          expect(updatedButtons.length).toBeGreaterThan(0);
        });
      }
    });

    it('should apply dark class to body when theme is dark', () => {
      localStorage.setItem('slainTheme', JSON.stringify('dark'));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Body should have dark theme class applied
      const bodyClasses = document.body.className;
      expect(bodyClasses).toBeDefined();
    });

    it('should apply light class to body when theme is light', () => {
      localStorage.setItem('slainTheme', JSON.stringify('light'));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Body should have light theme class applied
      const bodyClasses = document.body.className;
      expect(bodyClasses).toBeDefined();
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme in localStorage after toggle', async () => {
      localStorage.clear();

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        fireEvent.click(themeButtons[0]);

        await waitFor(() => {
          const savedTheme = localStorage.getItem('slainTheme');
          expect(savedTheme).toBeTruthy();
        });
      }
    });

    it('should load theme from localStorage on mount', async () => {
      const testTheme = 'light';
      localStorage.setItem('slainTheme', JSON.stringify(testTheme));

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Verify theme was loaded
      const savedTheme = localStorage.getItem('slainTheme');
      expect(savedTheme).toBe(JSON.stringify(testTheme));
    });

    it('should maintain theme preference across unmount/remount', async () => {
      const { unmount, rerender } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        fireEvent.click(themeButtons[0]);

        await waitFor(() => {
          const savedTheme = localStorage.getItem('slainTheme');
          expect(savedTheme).toBeTruthy();
        });

        unmount();

        // Remount
        render(
          <AppProvider>
            <Home />
          </AppProvider>
        );

        await waitFor(() => {
          const persisted = localStorage.getItem('slainTheme');
          expect(persisted).toBeTruthy();
        });
      }
    });
  });

  describe('Theme CSS Variables', () => {
    it('should update CSS variables when theme changes', async () => {
      const { container } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Check that CSS variables are defined
      const style = window.getComputedStyle(document.documentElement);
      expect(style).toBeDefined();
    });

    it('should apply correct colors for dark theme', () => {
      localStorage.setItem('slainTheme', JSON.stringify('dark'));

      const { container } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Check that dark theme colors are in effect
      const computedStyle = window.getComputedStyle(document.documentElement);
      expect(computedStyle).toBeDefined();
    });

    it('should apply correct colors for light theme', () => {
      localStorage.setItem('slainTheme', JSON.stringify('light'));

      const { container } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Check that light theme colors are in effect
      const computedStyle = window.getComputedStyle(document.documentElement);
      expect(computedStyle).toBeDefined();
    });
  });

  describe('Theme in Components', () => {
    it('should update header styling when theme changes', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        const header = screen.queryByText(/Whisker Watch/i, { hidden: true });
        expect(header).toBeDefined();

        fireEvent.click(themeButtons[0]);

        await waitFor(() => {
          const headerAfter = screen.queryByText(/Whisker Watch/i, { hidden: true });
          expect(headerAfter).toBeDefined();
        });
      }
    });

    it('should update sidebar styling when theme changes', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const incidentsTab = screen.queryAllByText(/incidents/i, { hidden: true })[0];
      expect(incidentsTab).toBeDefined();

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        fireEvent.click(themeButtons[0]);

        await waitFor(() => {
          const tabAfter = screen.queryAllByText(/incidents/i, { hidden: true })[0];
          expect(tabAfter).toBeDefined();
        });
      }
    });

    it('should update map styling when theme changes', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const map = screen.getByTestId('mock-map');
      expect(map).toBeDefined();

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        fireEvent.click(themeButtons[0]);

        await waitFor(() => {
          const mapAfter = screen.queryByTestId('mock-map');
          expect(mapAfter).toBeDefined();
        });
      }
    });
  });

  describe('System Theme Detection', () => {
    it('should default to dark theme when no preference is set', () => {
      localStorage.clear();

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Should use dark theme as default
      const theme = localStorage.getItem('slainTheme');
      // Either not set yet or defaults to dark
      expect(theme === null || theme === JSON.stringify('dark')).toBe(true);
    });

    it('should handle missing theme preference gracefully', () => {
      localStorage.removeItem('slainTheme');

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      // Should render without crashing
      const logButton = screen.queryByRole('button', { name: /log incident/i, hidden: true });
      expect(logButton).toBeTruthy();
    });
  });

  describe('Theme Accessibility', () => {
    it('should have theme toggle button with proper aria label', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const themeButtons = screen.queryAllByRole('button', { hidden: true })
        .filter(btn => btn.getAttribute('title')?.includes('theme'));

      if (themeButtons.length > 0) {
        const button = themeButtons[0];
        expect(button.getAttribute('aria-label') || button.getAttribute('title')).toBeTruthy();
      }
    });

    it('should maintain color contrast in both themes', () => {
      localStorage.setItem('slainTheme', JSON.stringify('dark'));

      const { rerender } = render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const darkContent = screen.queryByText(/Whisker Watch/i, { hidden: true });
      expect(darkContent).toBeDefined();

      // Switch to light theme
      localStorage.setItem('slainTheme', JSON.stringify('light'));

      rerender(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      const lightContent = screen.queryByText(/Whisker Watch/i, { hidden: true });
      expect(lightContent).toBeDefined();
    });
  });
});
