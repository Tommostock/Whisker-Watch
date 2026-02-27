/**
 * useMobileSidebar Hook
 * Manages sidebar visibility on mobile/tablet devices
 */

import { useState, useCallback, useEffect } from 'react';
import { MOBILE_WIDTH_BREAKPOINT } from '@/lib/constants';

export interface MobileSidebarHook {
  isMobile: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

/**
 * Manages sidebar visibility for responsive design
 * - On desktop: sidebar always visible
 * - On mobile: sidebar slides in/out with toggle
 * - Sidebar closes when incident selected or map clicked
 */
export function useMobileSidebar(): MobileSidebarHook {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_WIDTH_BREAKPOINT);
      // Reset sidebar on resize (if going from mobile to desktop, open sidebar)
      if (window.innerWidth > MOBILE_WIDTH_BREAKPOINT) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  return {
    isMobile,
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
}
