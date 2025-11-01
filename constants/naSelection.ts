/**
 * N/A Selection Constants and Type Definitions
 * For Organization/Program column in Funding Received Grants table
 */

// N/A value constant - special string to represent N/A selection
export const NA_VALUE = 'N/A' as const;

// Type guard to check if value is N/A
export const isNAValue = (value: string | string[] | undefined): boolean => {
  // Case-insensitive check for string 'N/A'
  if (typeof value === 'string') {
    return value.trim().toLowerCase() === NA_VALUE.toLowerCase();
  }
  // Allow simple array case: treat as NA if array has single NA string
  if (Array.isArray(value)) {
    return (
      value.length === 1 &&
      typeof value[0] === 'string' &&
      value[0].trim().toLowerCase() === NA_VALUE.toLowerCase()
    );
  }
  return false;
};

// Process organization value to determine display state
export const processOrganizationValue = (
  rawValue: string | string[] | undefined,
): {
  displayValue: string | string[];
  isNA: boolean;
  searchable: boolean;
} => {
  if (rawValue === NA_VALUE) {
    return {
      displayValue: NA_VALUE,
      isNA: true,
      searchable: false,
    };
  }

  return {
    displayValue: rawValue || '',
    isNA: false,
    searchable: true,
  };
};

// Serialize organization value for storage
export const serializeOrganizationValue = (
  value: string | string[] | undefined,
): string | string[] => {
  if (value === NA_VALUE) {
    return NA_VALUE;
  }

  // Handle array case - filter out any N/A values
  if (Array.isArray(value)) {
    return value.filter((v) => v !== NA_VALUE);
  }

  return value || '';
};

// Hook return type for N/A selection state management
export interface NASelectionState {
  isNASelected: boolean;
  selectNA: () => void;
  clearNA: () => void;
}

// Props for N/A related components
export interface NAButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface NADisplayProps {
  onClear: () => void;
  label?: string;
  className?: string;
}
