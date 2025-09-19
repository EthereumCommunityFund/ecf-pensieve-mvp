import { IFormDisplayType } from '@/types/item';

// Configuration arrays for embed table form types
export const EMBED_TABLE_FORM_TYPES: IFormDisplayType[] = [
  'founderList',
  'websites',
  'social_links',
  'affiliated_projects',
  'contributing_teams',
  'stack_integrations',
  'tablePhysicalEntity',
  'multiContracts',
  'fundingReceivedGrants',
  'advisors',
];

export const DYNAMIC_FIELD_EMBED_TABLE_TYPES: IFormDisplayType[] = [
  'affiliated_projects',
  'contributing_teams',
  'stack_integrations',
  'fundingReceivedGrants',
  'advisors',
];

/**
 * used for reading project ids -> ProjectSelector
 */
export const EMBED_TABLE_WITH_PROJECT_SELECTOR_TYPES: IFormDisplayType[] = [
  'affiliated_projects',
  'contributing_teams',
  'stack_integrations',
  'fundingReceivedGrants',
];
