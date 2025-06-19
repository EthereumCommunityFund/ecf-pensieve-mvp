'use client';

import React, { useCallback, useEffect, useRef } from 'react';

import { ScrollDetectorProps } from '@/types/agreement';

const ScrollDetector: React.FC<ScrollDetectorProps> = ({
  onScrollToEnd,
  threshold = 10,
  children,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasScrolledToEndRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const isVisible = entry.isIntersecting;

      // 只有当状态改变时才触发回调
      if (isVisible && !hasScrolledToEndRef.current) {
        hasScrolledToEndRef.current = true;
        onScrollToEnd(true);
      } else if (!isVisible && hasScrolledToEndRef.current) {
        hasScrolledToEndRef.current = false;
        onScrollToEnd(false);
      }
    },
    [onScrollToEnd],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;

    if (!sentinel || !container) return;

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(handleIntersection, {
      root: container, // 以滚动容器为根元素
      rootMargin: `0px 0px ${threshold}px 0px`, // 底部阈值
      threshold: 0, // 当目标元素完全可见或完全不可见时触发
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersection, threshold]);

  // 当内容变化时滚动到顶部并重置状态
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // 滚动到顶部
      container.scrollTop = 0;
      // 重置状态
      hasScrolledToEndRef.current = false;
      onScrollToEnd(false);
    }
  }, [children, onScrollToEnd]);

  return (
    <div
      ref={scrollContainerRef}
      className="max-h-[345px] flex-1 overflow-y-auto"
    >
      {children}
      {/* 放置在内容底部的观察元素 */}
      <div
        ref={sentinelRef}
        className="h-1 w-full"
        style={{ marginTop: `-${threshold}px` }}
      />
    </div>
  );
};

export default ScrollDetector;
