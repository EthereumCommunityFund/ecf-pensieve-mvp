/**
 * Layout constants for consistent positioning and breakpoints
 */

// Topbar height in pixels
export const TOPBAR_HEIGHT = 50;

// Responsive breakpoints (aligned with Tailwind config)
export const BREAKPOINTS = {
  mobile: 809, // max width for mobile
  tablet: 1199, // max width for tablet
  desktop: 1200, // min width for desktop (pc)
  large: 1400, // min width for large screens
} as const;

// Sticky positioning offsets
export const STICKY_OFFSETS = {
  // Default offset for sticky elements (accounts for topbar)
  default: TOPBAR_HEIGHT,
  // Additional padding below topbar if needed
  withPadding: TOPBAR_HEIGHT + 20,
} as const;
