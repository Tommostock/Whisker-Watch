/**
 * Header Component
 * Top navigation bar with logo, stats, and action buttons
 * Extracted from original app behavior
 */

'use client';

import React from 'react';
import { useApp, useAppTheme, useAppIncidents } from '@/context/AppContext';
import { Toast, useToast } from './Toast';

interface HeaderProps {
  onLogIncidentClick?: () => void;
}

/**
 * Header - main navigation and stats display
 *
 * Usage:
 * <Header onLogIncidentClick={() => setShowReportPanel(true)} />
 */
export const Header: React.FC<HeaderProps> = ({ onLogIncidentClick }) => {
  const { isDark, toggleTheme } = useAppTheme();
  const { getStats } = useAppIncidents();
  const { showToast, dismissToast, messages } = useToast();

  const stats = getStats();

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = isDark ? 'Light' : 'Dark';
    showToast(`✅ Switched to ${newTheme} mode`, 'var(--green)');
  };

  const handleLogin = () => {
    showToast('🔐 Authentication coming soon!', 'var(--yellow)');
  };

  return (
    <>
      <header>
        {/* Logo Section */}
        <div className="logo">
          <div className="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Stylized cat head icon */}
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M8 10c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm8 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4 5c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <div className="logo-text">Whisker Watch</div>
            <div className="logo-sub">
              <span className="slain">SLAIN Network</span>
              <span className="divider">•</span>
              <span className="creator">
                Incident Tracker{' '}
                <span className="name">
                  <a href="https://github.com/Tommostock/Whisker-Watch" target="_blank" rel="noopener noreferrer">
                    v2
                  </a>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginRight: 'auto',
            marginLeft: '30px',
            alignItems: 'center',
          }}
        >
          <div className="stat-pill">
            <span style={{ color: 'var(--text-muted)' }}>Total</span>
            <span className="n" style={{ color: 'var(--text)' }}>
              {stats.total}
            </span>
          </div>
          <div className="stat-pill">
            <span style={{ color: 'var(--text-muted)' }}>Unconfirmed</span>
            <span className="n" style={{ color: '#2d9d6e' }}>
              {stats.unconfirmed}
            </span>
          </div>
          <div className="stat-pill">
            <span style={{ color: 'var(--text-muted)' }}>Suspected</span>
            <span className="n" style={{ color: '#d4a017' }}>
              {stats.suspected}
            </span>
          </div>
          <div className="stat-pill">
            <span style={{ color: 'var(--text-muted)' }}>Confirmed</span>
            <span className="n" style={{ color: '#e63946' }}>
              {stats.confirmed}
            </span>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="hdr-right">
          {/* Theme Toggle Button */}
          <button
            className="btn-icon"
            onClick={handleThemeToggle}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
            id="themeToggle"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Login Button (Placeholder) */}
          <button
            className="btn btn-ghost"
            onClick={handleLogin}
            title="Authentication not yet implemented"
          >
            Login
          </button>

          {/* Log Incident Button (Primary) */}
          <button
            className="btn btn-primary"
            onClick={onLogIncidentClick}
            title="Create a new incident"
          >
            + Log Incident
          </button>
        </div>
      </header>

      {/* Toast notifications */}
      <Toast messages={messages} onDismiss={dismissToast} />
    </>
  );
};

/**
 * Example usage:
 *
 * export function App() {
 *   const [showReport, setShowReport] = useState(false);
 *
 *   return (
 *     <AppProvider>
 *       <Header onLogIncidentClick={() => setShowReport(true)} />
 *       {showReport && <ReportPanel onClose={() => setShowReport(false)} />}
 *     </AppProvider>
 *   );
 * }
 */
