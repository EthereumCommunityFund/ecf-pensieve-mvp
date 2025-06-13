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
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setActiveCategory(category);
    }
  }, []);

  // Listen to scroll, update currently active category
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add offset

      // Find currently visible category
      let currentCategory = IItemSubCategoryEnum.BasicProfile;

      Object.entries(categoryRefs.current).forEach(([key, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          if (scrollPosition >= elementTop) {
            currentCategory = key as IItemSubCategoryEnum;
          }
        }
      });

      setActiveCategory(currentCategory);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    activeCategory,
    categoryRefs,
    handleCategoryClick,
  };
};
