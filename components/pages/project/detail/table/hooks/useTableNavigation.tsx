'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { IItemSubCategoryEnum } from '@/types/item';

/**
 * Hook for managing table navigation and scrolling
 * Handles category navigation, scroll tracking, and active category detection
 */
export const useTableNavigation = () => {
  // Currently active category
  const [activeCategory, setActiveCategory] = useState<IItemSubCategoryEnum>(
    IItemSubCategoryEnum.BasicProfile,
  );

  // Category refs, used for scroll positioning
  const categoryRefs = useRef<
    Record<IItemSubCategoryEnum, HTMLDivElement | null>
  >({
    [IItemSubCategoryEnum.BasicProfile]: null,
    [IItemSubCategoryEnum.Development]: null,
    [IItemSubCategoryEnum.Organization]: null,
    [IItemSubCategoryEnum.Team]: null,
    [IItemSubCategoryEnum.Finances]: null,
    [IItemSubCategoryEnum.Token]: null,
    [IItemSubCategoryEnum.Governance]: null, // Reserved for future enablement
  });

  // Handle navigation menu click, scroll to corresponding category
  const handleCategoryClick = useCallback((category: IItemSubCategoryEnum) => {
    const targetElement = categoryRefs.current[category];
    if (targetElement) {
      // Get the element's position
      const elementRect = targetElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.scrollY;

      // Account for sticky header/navigation offset (adjust this value as needed)
      const offset = 140; // Adjust based on your sticky header height
      const scrollToPosition = absoluteElementTop - offset;

      // Smooth scroll to the calculated position
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth',
      });

      // Set active category immediately for better UX
      setActiveCategory(category);
    }
  }, []);

  // Listen to scroll, update currently active category
  useEffect(() => {
    const handleScroll = () => {
      // Use a smaller offset to detect when section is near the top of viewport
      const scrollPosition = window.scrollY + 150; // Offset for sticky header/navigation

      // Get all category positions and sort them
      const categoryPositions: Array<{
        key: IItemSubCategoryEnum;
        top: number;
      }> = [];

      Object.entries(categoryRefs.current).forEach(([key, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          categoryPositions.push({
            key: key as IItemSubCategoryEnum,
            top: elementTop,
          });
        }
      });

      // Sort by position (top to bottom)
      categoryPositions.sort((a, b) => a.top - b.top);

      // Find the active category - the last one whose top is above scroll position
      let currentCategory = IItemSubCategoryEnum.BasicProfile;

      for (let i = 0; i < categoryPositions.length; i++) {
        const current = categoryPositions[i];
        const next = categoryPositions[i + 1];

        if (scrollPosition >= current.top) {
          // If this is the last category or we haven't reached the next one yet
          if (!next || scrollPosition < next.top) {
            currentCategory = current.key;
            break;
          }
          // If we've passed this category, continue to check the next one
          currentCategory = current.key;
        } else {
          // If we haven't reached this category yet, stop
          break;
        }
      }

      setActiveCategory(currentCategory);
    };

    // Run once on mount to set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    activeCategory,
    categoryRefs,
    handleCategoryClick,
  };
};
