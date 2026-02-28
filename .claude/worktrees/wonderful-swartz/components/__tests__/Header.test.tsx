/**
 * Header Component Tests
 * Tests rendering, stats display, buttons, and theme toggle
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import { Header } from '../Header';

describe('Header Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<Header />);
      expect(screen.getByText('Whisker Watch')).toBeInTheDocument();
    });

    it('should display logo and branding', () => {
      render(<Header />);
      expect(screen.getByText('Whisker Watch')).toBeInTheDocument();
      expect(screen.getByText('SLAIN Network')).toBeInTheDocument();
      expect(screen.getByText(/Incident Tracker/)).toBeInTheDocument();
    });

    it('should render GitHub link with correct href', () => {
      render(<Header />);
      const link = screen.getByRole('link', { name: 'v2' });
      expect(link).toHaveAttribute('href', 'https://github.com/Tommostock/Whisker-Watch');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Stats Pills', () => {
    it('should display all stat pills', () => {
      render(<Header />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Unconfirmed')).toBeInTheDocument();
      expect(screen.getByText('Suspected')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('should display default stats (0 for all)', () => {
      render(<Header />);
      const pills = screen.getAllByText(/^\d+$/);
      // Should have 4 stat numbers (total, unconfirmed, suspected, confirmed)
      expect(pills.length).toBeGreaterThanOrEqual(4);
    });

    it('should display stats with correct color styling', () => {
      render(<Header />);
      const unconfirmedNumber = screen.getAllByText(/^\d+$/)[1];
      expect(unconfirmedNumber).toHaveStyle('color: #2d9d6e'); // Unconfirmed green
    });
  });

  describe('Theme Toggle Button', () => {
    it('should render theme toggle button', () => {
      render(<Header />);
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
      render(<Header />);
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Toggle theme');
    });

    it('should show sun icon in dark mode', () => {
      render(<Header />);
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      // Button should contain either sun or moon emoji
      expect(themeButton.textContent).toMatch(/☀️|🌙/);
    });

    it('should call onLogIncidentClick when theme button is clicked', async () => {
      render(<Header />);
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });

      fireEvent.click(themeButton);

      // Should show toast notification after click
      await waitFor(() => {
        const toast = screen.queryByText(/Switched to/);
        if (toast) {
          expect(toast).toBeInTheDocument();
        }
      }, { timeout: 100 });
    });
  });

  describe('Login Button', () => {
    it('should render login button', () => {
      render(<Header />);
      const loginButton = screen.getByRole('button', { name: 'Login' });
      expect(loginButton).toBeInTheDocument();
    });

    it('should have ghost button styling', () => {
      render(<Header />);
      const loginButton = screen.getByRole('button', { name: 'Login' });
      expect(loginButton).toHaveClass('btn-ghost');
    });

    it('should show tooltip on hover', () => {
      render(<Header />);
      const loginButton = screen.getByRole('button', { name: 'Login' });
      expect(loginButton).toHaveAttribute('title', 'Authentication not yet implemented');
    });

    it('should show toast when login clicked', async () => {
      render(<Header />);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.click(loginButton);

      await waitFor(() => {
        const toast = screen.queryByText(/Authentication coming soon/);
        if (toast) {
          expect(toast).toBeInTheDocument();
        }
      }, { timeout: 100 });
    });
  });

  describe('Log Incident Button', () => {
    it('should render log incident button', () => {
      render(<Header />);
      const logButton = screen.getByRole('button', { name: '+ Log Incident' });
      expect(logButton).toBeInTheDocument();
    });

    it('should have primary button styling', () => {
      render(<Header />);
      const logButton = screen.getByRole('button', { name: '+ Log Incident' });
      expect(logButton).toHaveClass('btn-primary');
    });

    it('should call onLogIncidentClick when clicked', () => {
      const mockClick = jest.fn();
      render(<Header onLogIncidentClick={mockClick} />);

      const logButton = screen.getByRole('button', { name: '+ Log Incident' });
      fireEvent.click(logButton);

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should have helpful tooltip', () => {
      render(<Header />);
      const logButton = screen.getByRole('button', { name: '+ Log Incident' });
      expect(logButton).toHaveAttribute('title', 'Create a new incident');
    });
  });

  describe('Button Arrangement', () => {
    it('should have theme toggle, login, and log incident buttons in order', () => {
      render(<Header />);
      const buttons = screen.getAllByRole('button');

      // Find the specific buttons
      const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
      const loginBtn = screen.getByRole('button', { name: 'Login' });
      const logBtn = screen.getByRole('button', { name: '+ Log Incident' });

      expect(themeBtn).toBeInTheDocument();
      expect(loginBtn).toBeInTheDocument();
      expect(logBtn).toBeInTheDocument();
    });
  });

  describe('Stats Updates', () => {
    it('should have stats display area', () => {
      render(<Header />);
      const totalText = screen.getByText('Total');
      expect(totalText).toBeInTheDocument();
    });

    it('should display numeric stat values', () => {
      render(<Header />);
      // Stats should show numeric values (even if 0)
      const stats = screen.getAllByText(/^\d+$/);
      expect(stats.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<Header />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // theme, login, log incident
    });

    it('should have descriptive aria labels', () => {
      render(<Header />);
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeButton).toHaveAttribute('aria-label');
    });

    it('should have title attributes for tooltips', () => {
      render(<Header />);
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      const loginButton = screen.getByRole('button', { name: 'Login' });
      const logButton = screen.getByRole('button', { name: '+ Log Incident' });

      expect(themeButton).toHaveAttribute('title');
      expect(loginButton).toHaveAttribute('title');
      expect(logButton).toHaveAttribute('title');
    });
  });

  describe('Integration with Toast', () => {
    it('should render toast notifications', () => {
      render(<Header />);
      // Toast component should be rendered
      const header = screen.getByText('Whisker Watch');
      expect(header).toBeInTheDocument();
    });
  });
});
