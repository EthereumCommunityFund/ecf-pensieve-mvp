'use client';

import { useEffect, useState } from 'react';

type MediaQueryListWithLegacyListeners = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export function useMediaQuery(query: string, initialValue = false) {
  const getMatches = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    let cleanup = () => {};

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', onChange);
      cleanup = () => {
        mediaQueryList.removeEventListener?.('change', onChange);
      };
    } else {
      const legacyList = mediaQueryList as MediaQueryListWithLegacyListeners;
      if (typeof legacyList.addListener === 'function') {
        legacyList.addListener(onChange);
        cleanup = () => {
          legacyList.removeListener?.(onChange);
        };
      }
    }

    return cleanup;
  }, [query]);

  return matches;
}
