'use client';

import { cn } from '@heroui/react';
import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IItemSubCategoryEnum } from '@/types/item';

interface NavigationMenuProps {
  activeCategory?: IItemSubCategoryEnum;
  onCategoryClick: (category: IItemSubCategoryEnum) => void;
  className?: string;
}

const NavigationMenu: FC<NavigationMenuProps> = ({
  activeCategory,
  onCategoryClick,
  className,
}) => {
  const [isFixed, setIsFixed] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const originalLeftRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check and update desktop state
  const checkIsDesktop = useCallback(() => {
    const desktop = window.innerWidth >= 1200; // pc breakpoint and above
    setIsDesktop(desktop);
    return desktop;
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
    }, 100);
  }, [isDesktop, isFixed]);

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
    }, 300); // Increased delay for better stability

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
  }, [isDesktop, recordOriginalPosition, isFixed]);

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
      const shouldBeFixed = placeholderRect.top <= 70; // 70px for topbar + some margin

      if (shouldBeFixed !== isFixed) {
        setIsFixed(shouldBeFixed);
        if (shouldBeFixed) {
          setTopOffset(70); // Fixed position from top
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
  }, [isFixed, isDesktop, recordOriginalPosition]);

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

  return (
    <>
      {/* Placeholder to maintain layout when menu becomes fixed */}
      <div
        ref={placeholderRef}
        className={cn('w-full', isFixed ? 'h-auto' : 'h-0')}
        style={{
          height: isFixed && menuRef.current ? menuRef.current.offsetHeight : 0,
        }}
      />

      <div
        ref={menuRef}
        className={cn(
          'flex flex-col gap-[10px]  p-[10px] w-[200px]',
          isFixed ? 'fixed z-20' : 'relative',
          className,
        )}
        style={
          isFixed
            ? {
                top: `${topOffset}px`,
                left: `${leftOffset}px`, // Use dynamically calculated horizontal position
              }
            : undefined
        }
      >
        {ProjectTableFieldCategory.map((categoryConfig) => (
          <div key={categoryConfig.key} className="flex flex-col">
            {/* 主分类 - 显示第一个子分类作为主分类入口 */}
            {categoryConfig.subCategories.length > 0 && (
              <div
                onClick={() =>
                  onCategoryClick(categoryConfig.subCategories[0].key)
                }
                className={cn(
                  'cursor-pointer rounded-[6px] px-[10px] py-[10px] transition-all duration-200',
                  'hover:opacity-80',
                  activeCategory === categoryConfig.subCategories[0].key
                    ? 'opacity-100 bg-black/10'
                    : 'opacity-60',
                )}
              >
                <div className="font-sans text-[14px] font-bold leading-[1.36181640625em] text-black">
                  {categoryConfig.title}
                </div>
              </div>
            )}

            {/* 子分类 - 显示除第一个之外的其他子分类 */}
            {categoryConfig.subCategories.length && (
              <div className="mt-[10px] flex flex-col gap-[10px]">
                {categoryConfig.subCategories.map((subCategoryConfig) => {
                  const isActive = activeCategory === subCategoryConfig.key;

                  return (
                    <div
                      key={subCategoryConfig.key}
                      onClick={() => onCategoryClick(subCategoryConfig.key)}
                      className={cn(
                        'cursor-pointer rounded-[6px] px-[10px] py-[10px] transition-all duration-200',
                        'hover:opacity-80',
                        isActive ? 'opacity-100' : 'opacity-50',
                      )}
                    >
                      <div className="font-sans text-[12px] leading-[1.3] text-black">
                        {subCategoryConfig.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default NavigationMenu;
