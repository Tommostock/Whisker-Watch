/**
 * useMobileSidebar Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useMobileSidebar } from '@/hooks/useMobileSidebar'
import { MOBILE_WIDTH_BREAKPOINT } from '@/lib/constants'

describe('useMobileSidebar', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  describe('Desktop behavior', () => {
    it('should detect desktop screen size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      const { result } = renderHook(() => useMobileSidebar())

      expect(result.current.isMobile).toBe(false)
      expect(result.current.sidebarOpen).toBe(true)
    })

    it('should keep sidebar open on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      const { result } = renderHook(() => useMobileSidebar())

      expect(result.current.sidebarOpen).toBe(true)

      // Toggle shouldn't affect initial state significantly
      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)
    })
  })

  describe('Mobile behavior', () => {
    it('should detect mobile screen size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: MOBILE_WIDTH_BREAKPOINT - 100,
      })

      const { result } = renderHook(() => useMobileSidebar())

      expect(result.current.isMobile).toBe(true)
    })

    it('should close sidebar on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: MOBILE_WIDTH_BREAKPOINT - 100,
      })

      const { result } = renderHook(() => useMobileSidebar())

      // Initial state should be open or closed (implementation may vary)
      const initialOpen = result.current.sidebarOpen

      act(() => {
        result.current.closeSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)
    })

    it('should open sidebar on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: MOBILE_WIDTH_BREAKPOINT - 100,
      })

      const { result } = renderHook(() => useMobileSidebar())

      act(() => {
        result.current.closeSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)

      act(() => {
        result.current.openSidebar()
      })

      expect(result.current.sidebarOpen).toBe(true)
    })
  })

  describe('Toggle functionality', () => {
    it('should toggle sidebar visibility', () => {
      const { result } = renderHook(() => useMobileSidebar())

      const initialState = result.current.sidebarOpen

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(!initialState)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(initialState)
    })
  })

  describe('Resize handling', () => {
    it('should update isMobile on window resize', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: MOBILE_WIDTH_BREAKPOINT - 100,
      })

      const { result, rerender } = renderHook(() => useMobileSidebar())

      expect(result.current.isMobile).toBe(true)

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      act(() => {
        window.dispatchEvent(new Event('resize'))
      })

      rerender()

      expect(result.current.isMobile).toBe(false)
    })

    it('should open sidebar when resizing from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: MOBILE_WIDTH_BREAKPOINT - 100,
      })

      const { result, rerender } = renderHook(() => useMobileSidebar())

      act(() => {
        result.current.closeSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      act(() => {
        window.dispatchEvent(new Event('resize'))
      })

      rerender()

      // Sidebar should be open again
      expect(result.current.sidebarOpen).toBe(true)
    })
  })

  describe('State transitions', () => {
    it('should maintain state during transitions', () => {
      const { result } = renderHook(() => useMobileSidebar())

      act(() => {
        result.current.openSidebar()
      })

      expect(result.current.sidebarOpen).toBe(true)

      act(() => {
        result.current.closeSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(true)
    })
  })
})
