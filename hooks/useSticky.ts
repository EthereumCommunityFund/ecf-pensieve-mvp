'use client';

import {
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { BREAKPOINTS, STICKY_OFFSETS } from '@/constants/layoutConstants';

interface UseStickyOptions {
  desktopBreakpoint?: number; // Desktop breakpoint width
  topOffset?: number; // Top offset when fixed
  debounceDelay?: number; // Debounce delay for position recording (default: 100ms)
  initialDelay?: number; // Initial delay for position recording (default: 300ms)
}

interface UseStickyReturn {
  refs: {
    menuRef: RefObject<HTMLDivElement | null>;
    placeholderRef: RefObject<HTMLDivElement | null>;
  };
  state: {
    isFixed: boolean;
    isDesktop: boolean;
    leftOffset: number;
    topOffset: number;
  };
  placeholderStyle: CSSProperties;
  stickyStyle: CSSProperties | undefined;
}

/**
 * Custom hook for implementing sticky positioning behavior
 * @param options Configuration options for sticky behavior
 * @returns Refs, state, and styles for implementing sticky positioning
 */
export function useSticky(options: UseStickyOptions = {}): UseStickyReturn {
  const {
    desktopBreakpoint = BREAKPOINTS.desktop,
    topOffset: configuredTopOffset = STICKY_OFFSETS.default,
    debounceDelay = 100,
    initialDelay = 300,
  } = options;

  // Sticky positioning states
  const [isFixed, setIsFixed] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Refs for position tracking
  const menuRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const originalLeftRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check and update desktop state
  const checkIsDesktop = useCallback(() => {
    const desktop = window.innerWidth >= desktopBreakpoint;
    setIsDesktop(desktop);
    return desktop;
  }, [desktopBreakpoint]);

  // Global cleanup for timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced position recording function
  const recordOriginalPosition = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Only calculate position on desktop where the menu is visible
      if (!isDesktop || !menuRef.current) {
        return;
      }

      // Ensure the element is in its natural (non-fixed) position before measuring
      if (isFixed) {
        return; // Don't measure when element is fixed
      }

      const menuRect = menuRef.current.getBoundingClientRect();
      const newLeft = menuRect.left;

      // Validate that we got a reasonable position (not 0 or negative)
      if (newLeft > 0) {
        // Only update if there's a meaningful change (avoid unnecessary updates)
        if (Math.abs(newLeft - originalLeftRef.current) > 1) {
          originalLeftRef.current = newLeft;
          setLeftOffset(newLeft);
        }
      }
    }, debounceDelay);
  }, [isDesktop, isFixed, debounceDelay]);

  // Initialize desktop state and setup resize listener
  useEffect(() => {
    // Initial desktop state check
    checkIsDesktop();

    // Window resize listener that checks both desktop state and position
    const handleResize = () => {
      const wasDesktop = isDesktop;
      const nowDesktop = checkIsDesktop();

      // If transitioning from desktop to mobile, reset fixed state
      if (wasDesktop && !nowDesktop) {
        setIsFixed(false);
        originalLeftRef.current = 0; // Reset position
      }

      // If transitioning to desktop or already on desktop, record position
      // Use a longer delay for resize to ensure layout is stable
      if (nowDesktop) {
        setTimeout(() => {
          recordOriginalPosition();
        }, 200);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [checkIsDesktop, isDesktop, recordOriginalPosition]);

  // Setup position recording and observers (only when on desktop)
  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    // Initial position recording with delay to ensure layout stability
    const initialTimer = setTimeout(() => {
      recordOriginalPosition();
    }, initialDelay);

    // ResizeObserver for more accurate layout change detection
    if (menuRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        // Only record position if not currently fixed
        if (!isFixed) {
          recordOriginalPosition();
        }
      });
      resizeObserverRef.current.observe(menuRef.current);
    }

    return () => {
      clearTimeout(initialTimer);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isDesktop, recordOriginalPosition, isFixed, initialDelay]);

  // Scroll handling for sticky behavior
  useEffect(() => {
    // Only setup scroll listener on desktop
    if (!isDesktop) {
      return;
    }

    const handleScroll = () => {
      // Only handle scroll on desktop where the menu is visible
      if (!menuRef.current || !placeholderRef.current) {
        return;
      }

      const placeholder = placeholderRef.current;
      const placeholderRect = placeholder.getBoundingClientRect();
      const shouldBeFixed = placeholderRect.top <= configuredTopOffset;

      if (shouldBeFixed !== isFixed) {
        setIsFixed(shouldBeFixed);
        if (shouldBeFixed) {
          setTopOffset(configuredTopOffset); // Fixed position from top
          // Always recalculate position when becoming fixed
          // This ensures we have the correct position even after layout changes
          setTimeout(() => {
            if (menuRef.current) {
              const menuRect = menuRef.current.getBoundingClientRect();
              const currentLeft = menuRect.left;
              if (currentLeft > 0) {
                originalLeftRef.current = currentLeft;
                setLeftOffset(currentLeft);
              }
            }
          }, 0);
        } else {
          // When becoming unfixed, record the current position for next time
          setTimeout(() => {
            recordOriginalPosition();
          }, 100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFixed, isDesktop, recordOriginalPosition, configuredTopOffset]);

  // Handle position recalculation when fixed state changes
  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    // When becoming unfixed, ensure we record the correct position for next time
    if (!isFixed && menuRef.current) {
      const timer = setTimeout(() => {
        recordOriginalPosition();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isFixed, isDesktop, recordOriginalPosition]);

  // Use layoutEffect to ensure position is calculated after DOM updates
  useLayoutEffect(() => {
    if (!isDesktop || !menuRef.current) {
      return;
    }

    // Recalculate position after any layout changes
    const timer = setTimeout(() => {
      recordOriginalPosition();
    }, 0);

    return () => clearTimeout(timer);
  }, [isDesktop, recordOriginalPosition]);

  // Calculate placeholder style
  const placeholderStyle: CSSProperties = {
    width: isFixed && menuRef.current ? menuRef.current.offsetWidth : 0,
    height: isFixed && menuRef.current ? menuRef.current.offsetHeight : 0,
  };

  // Calculate sticky element style
  const stickyStyle: CSSProperties | undefined =
    isFixed && isDesktop
      ? {
          position: 'fixed' as const,
          top: `${topOffset}px`,
          left: `${leftOffset}px`,
          zIndex: 20,
        }
      : undefined;

  return {
    refs: {
      menuRef,
      placeholderRef,
    },
    state: {
      isFixed,
      isDesktop,
      leftOffset,
      topOffset,
    },
    placeholderStyle,
    stickyStyle,
  };
}
