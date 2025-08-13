/**
 * Form helper utilities for handling form state and validation
 */

import React from 'react';

/**
 * Compare two arrays for equality (to avoid unnecessary state updates)
 * @param a First array
 * @param b Second array
 * @returns true if arrays are equal, false otherwise
 */
export const arraysEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

/**
 * Check if form is currently validating
 * This function can be enhanced to check global form validation state
 * @returns true if form is validating, false otherwise
 */
export const isFormValidating = (): boolean => {
  // Check for validation indicator in DOM
  // This can be enhanced with global state management if needed
  const validatingElement = document.querySelector('[data-validating="true"]');
  return validatingElement !== null;
};

/**
 * Compare two arrays of IDs for equality
 * @param ids1 First array of IDs
 * @param ids2 Second array of IDs
 * @returns true if arrays contain the same IDs (regardless of order)
 */
export const idsArrayEqual = (
  ids1: (string | number)[],
  ids2: (string | number)[],
): boolean => {
  if (ids1.length !== ids2.length) return false;

  const sortedIds1 = [...ids1].sort();
  const sortedIds2 = [...ids2].sort();

  return sortedIds1.every((id, index) => id === sortedIds2[index]);
};

/**
 * Safe state update function that only updates if values have changed
 * @param currentState Current state value
 * @param newState New state value
 * @param isEqual Comparison function
 * @returns The state to set (current if no change, new if changed)
 */
export const safeStateUpdate = <T>(
  currentState: T,
  newState: T,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b,
): T => {
  return isEqual(currentState, newState) ? currentState : newState;
};

/**
 * Debounce state updates to prevent rapid changes during validation
 * @param value The value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export const useDebounceStateUpdate = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
