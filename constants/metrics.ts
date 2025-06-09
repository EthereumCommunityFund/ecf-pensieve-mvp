/**
 * Metric constants for accountability and legitimacy
 * These constants prevent typos and ensure consistency across the codebase
 */

// Accountability Metrics
export const ACCOUNTABILITY_METRICS = {
  TRANSPARENCY: 'Transparency',
  PARTICIPATION: 'Participation',
  COMPLAINTS_AND_REDRESS: 'Complaints and Redress',
  PERFORMANCE: 'Performance',
  PERFORMANCE_EVAL: 'Performance Eval', // Used in itemConfig.ts
  KEY_ACCOUNTABILITY_ITEM: 'Key Accountability Item', // Used in itemConfig.ts
} as const;

// Legitimacy Metrics
export const LEGITIMACY_METRICS = {
  COMMUNITY_ACCEPTANCE: 'Community Acceptance',
  COMMUNITY_PARTICIPATION: 'Community Participation',
  LEGITIMACY_BY_CONTINUITY: 'Legitimacy by Continuity',
  LEGITIMACY_BY_PROCESS: 'Legitimacy by Process',
  LEGITIMACY_BY_PERFORMANCE: 'Legitimacy by Performance',
  WEB3_RESILIENCE: 'Web3 Resilience',
} as const;

// All metrics combined for easy access
export const ALL_METRICS = {
  ...ACCOUNTABILITY_METRICS,
  ...LEGITIMACY_METRICS,
} as const;

// Type definitions for type safety
export type AccountabilityMetric =
  (typeof ACCOUNTABILITY_METRICS)[keyof typeof ACCOUNTABILITY_METRICS];
export type LegitimacyMetric =
  (typeof LEGITIMACY_METRICS)[keyof typeof LEGITIMACY_METRICS];
export type AllMetrics = (typeof ALL_METRICS)[keyof typeof ALL_METRICS];

// Array of all metric values for iteration
export const ACCOUNTABILITY_METRIC_VALUES = Object.values(
  ACCOUNTABILITY_METRICS,
);
export const LEGITIMACY_METRIC_VALUES = Object.values(LEGITIMACY_METRICS);
export const ALL_METRIC_VALUES = Object.values(ALL_METRICS);
