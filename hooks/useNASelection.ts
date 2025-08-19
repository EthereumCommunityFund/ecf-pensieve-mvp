'use client';

import { useCallback, useMemo } from 'react';

import { isNAValue, NA_VALUE, NASelectionState } from '@/constants/naSelection';

/**
 * useNASelection Hook
 * Manages N/A selection state for Organization/Program column
 * Provides optimized state management with memoization
 */
export const useNASelection = (
  value: string | string[] | undefined,
  onChange: (value: string | string[]) => void,
  multiple: boolean = false,
): NASelectionState => {
  // Check if N/A is currently selected
  const isNASelected = useMemo(() => isNAValue(value), [value]);

  // Select N/A handler
  const selectNA = useCallback(() => {
    onChange(NA_VALUE);
  }, [onChange]);

  // Clear N/A handler
  const clearNA = useCallback(() => {
    // Clear to empty array for multiple mode, empty string for single mode
    onChange(multiple ? [] : '');
  }, [onChange, multiple]);

  return {
    isNASelected,
    selectNA,
    clearNA,
  };
};
