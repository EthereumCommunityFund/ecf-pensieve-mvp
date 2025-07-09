'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '40px',
  enabled = true,
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset intersection state when enabled changes
    if (!enabled) {
      console.log('IntersectionObserver disabled, resetting state');
      setIsIntersecting(false);
      return;
    }

    if (!targetRef.current) {
      console.warn('IntersectionObserver: no target element');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('IntersectionObserver entry:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          rootBounds: entry.rootBounds,
        });
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, enabled]);

  return { targetRef, isIntersecting };
};
