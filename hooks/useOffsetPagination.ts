'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

interface UseOffsetPaginationOptions {
  pageSize: number;
}

export function useOffsetPagination<T>({
  pageSize,
}: UseOffsetPaginationOptions) {
  const [offset, setOffset] = useState(0);
  const [pages, setPages] = useState<Record<number, T[]>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pendingClearRef = useRef(false);

  const setPageData = useCallback(
    (items: T[], overrideOffset?: number) => {
      const targetOffset = overrideOffset ?? offset;
      const pageIndex = Math.floor(targetOffset / pageSize);

      const shouldClear = pendingClearRef.current;

      setPages((prev) => {
        const basePages = shouldClear ? {} : prev;
        return {
          ...basePages,
          [pageIndex]: items,
        };
      });

      if (shouldClear) {
        pendingClearRef.current = false;
      }

      setIsLoadingMore(false);
    },
    [offset, pageSize],
  );

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setOffset((prev) => prev + pageSize);
  }, [pageSize]);

  const reset = useCallback((options?: { soft?: boolean; offset?: number }) => {
    const nextOffset = options?.offset ?? 0;
    setOffset(nextOffset);
    setIsLoadingMore(false);

    if (options?.soft) {
      pendingClearRef.current = true;
    } else {
      setPages({});
      pendingClearRef.current = false;
    }
  }, []);

  const items = useMemo(() => {
    return Object.keys(pages)
      .map(Number)
      .sort((a, b) => a - b)
      .flatMap((page) => pages[page] ?? []);
  }, [pages]);

  return {
    offset,
    pageSize,
    items,
    isLoadingMore,
    handleLoadMore,
    setPageData,
    reset,
    setIsLoadingMore,
  } as const;
}
