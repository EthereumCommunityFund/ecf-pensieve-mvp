import { POC_ITEMS } from '@/lib/pocItems';

type FilterEssentialKeys<T> = {
  [K in keyof T]: T[K] extends { isEssential: true } ? K : never;
}[keyof T];

type FilterNonEssentialKeys<T> = {
  [K in keyof T]: T[K] extends { isEssential: false } ? K : never;
}[keyof T];

export type IPocItemKey = keyof typeof POC_ITEMS;
/**
 * Reserved extension fields, not necessarily taking keys entirely from IPocItemKey
 */
export type IItemKey = IPocItemKey;
export type IEssentialItemKey = FilterEssentialKeys<typeof POC_ITEMS>;
export type INonEssentialItemKey = FilterNonEssentialKeys<typeof POC_ITEMS>;

export interface IPocItem {
  key: IPocItemKey;
  weight: number;
  quorum: number;
  isEssential: boolean;
  accountability_metric: number;
}

export type IBasicsKey = Extract<
  IEssentialItemKey,
  | 'name'
  | 'tagline'
  | 'categories'
  | 'mainDescription'
  | 'logoUrl'
  | 'websites'
  | 'appUrl'
  | 'tags'
  | 'whitePaper'
  | 'dateFounded'
  | 'dateLaunch'
>;

export type ITechnicalsKey = Extract<
  IEssentialItemKey,
  'devStatus' | 'openSource' | 'codeRepo' | 'dappSmartContracts'
>;

export type IOrganizationKey = Extract<
  IEssentialItemKey,
  'orgStructure' | 'publicGoods' | 'founders'
>;

export type IFinancialKey = Extract<
  IEssentialItemKey,
  'fundingStatus' | 'tokenContract'
>;

export enum IItemCategoryEnum {
  Basics = 'basics',
  Technicals = 'technicals',
  Organization = 'organization',
  Financial = 'financial',
  Governance = 'governance',
}

export enum IItemSubCategoryEnum {
  BasicProfile = 'BasicProfile',
  Development = 'Development',
  Organization = 'Organization',
  Team = 'Team',
  Finances = 'Finances',
  Token = 'Token',
  Governance = 'Governance',
}

export enum IItemGroupEnum {
  CodeAudits = 'Code Audits',
  ProjectLinks = 'Project Links',
  ProjectDates = 'Project Dates',
  TeamDetails = 'Team Details',
  FundingDetails = 'Funding Details',
  TokenDetails = 'Token Details',
}

export interface IDateConstraints {
  minDate?: Date | string | 'today' | 'yesterday' | 'tomorrow'; // Minimum date
  maxDate?: Date | string | 'today' | 'yesterday' | 'tomorrow'; // Maximum date
  disabledDates?: Date[] | string[]; // Specific disabled dates
  disabledDaysOfWeek?: number[]; // Disabled days of week (0-6, 0 for Sunday)
  enabledDateRanges?: Array<{ start: Date | string; end: Date | string }>; // Only allowed date ranges
  yearRange?: { min?: number; max?: number }; // Year range restriction
  relativeToToday?: {
    minDaysFromToday?: number; // Minimum days from today (negative for past, positive for future)
    maxDaysFromToday?: number; // Maximum days from today
  };
}

export interface IItemConfig<K extends IItemKey> {
  key: K;
  category: IItemCategoryEnum;
  subCategory: IItemSubCategoryEnum;
  group?: IItemGroupEnum;
  isEssential: boolean;
  label: string;
  description: string;
  shortDescription: string; // For tooltip
  longDescription?: string; // For show item details in the projectDetail/proposal table
  weight: string | number;
  formDisplayType: IFormDisplayType;
  placeholder: string;
  options?: { value: string; label: string }[]; // For select, radio
  showApplicable?: boolean; // Whether the applicable switch should be shown
  showReference?: boolean; // Whether the reference button should be shown
  showExpand?: boolean; // Whether the field can be expanded in the projectDetail/proposal table
  startContentText?: string; // For URL inputs
  minRows?: number; // For Textarea
  accountability?: string[];
  legitimacy?: string[];
  dateConstraints?: IDateConstraints; // Date constraints for date type fields
  validationSchema?: any; // Validation schema for the item
  componentsProps?: Record<string, any>; // For custom props of the components
}

export type IBaseFormDisplayType =
  | 'string'
  | 'textarea'
  | 'stringMultiple' // separate by comma
  | 'select'
  | 'selectMultiple'
  | 'autoComplete'
  | 'img'
  | 'link'
  | 'date'
  | 'smartContract';

export type IEmbedTableFormDisplayType =
  | 'founderList'
  | 'websites'
  | 'social_links'
  | 'tablePhysicalEntity'
  | 'multiContracts'
  | 'fundingReceivedGrants'
  | 'affiliated_projects'
  | 'contributing_teams'
  | 'contributors_organization'
  | 'stack_integrations'
  | 'advisors'
  | 'embedTable'; // only used for placeholder to avoid type errors. will be replaced with a specific type

export type IFormDisplayType =
  | IBaseFormDisplayType
  | IEmbedTableFormDisplayType
  | 'roadmap' // not confirm how to display
  | 'unknown';

export interface IGroupConfig {
  key: IItemGroupEnum;
  title: string;
  description: string;
  items: (IEssentialItemKey | string)[];
}

/**
 * items order in the table: items > itemsNotEssential > groups(extra items)
 */
export interface ISubCategoryConfig {
  key: IItemSubCategoryEnum;
  title: string;
  label?: string;
  description: string;
  /**
   * essential items that should be shown in the table
   */
  items: IEssentialItemKey[];
  /**
   * not essential items that should be shown in the table even if they are not selected
   */
  itemsNotEssential?: INonEssentialItemKey[];
  groups?: IGroupConfig[];
}

export interface ICategoryConfig {
  key: IItemCategoryEnum;
  title: string;
  label?: string;
  description: string;
  subCategories: ISubCategoryConfig[];
}

export interface IProposalItem {
  key: string;
  value: any;
}

export interface IPhysicalEntity {
  legalName: string;
  country?: string;
  _id?: string;
}

export interface IFundingReceivedGrants {
  date: Date | null;
  organization: string | string[];
  projectDonator: string[];
  amount: string;
  reference?: string;
  expenseSheetUrl?: string;
  _id?: string;
}

// Extended interface for useGivenGrantsData with backend relation fields
export interface IFundingReceivedGrantsWithRelation
  extends IFundingReceivedGrants {
  sourceProjectId: number | null;
  itemProposalId: number | null;
  targetProjectId: number | null;
  relationType: string | null;
}

export interface IAffiliatedProject {
  project: string | string[];
  affiliationType: string;
  description?: string;
  reference?: string;
  _id?: string;
}

export interface IContributingTeam {
  project: string | string[];
  type: string;
  description?: string;
  reference?: string;
  _id?: string;
}

export interface IContributorsOrganization {
  name: string;
  role: string;
  address: string;
  _id?: string;
}

export interface IStackIntegration {
  project: string | string[];
  type: string;
  description?: string;
  reference?: string;
  repository?: string;
  _id?: string;
}

export interface IAdvisors {
  name: string;
  title: string;
  address: string;
  active: string;
  _id?: string;
}

// Type mapping for getItemRowData function
export interface IItemDataTypeMap {
  funding_received_grants: IFundingReceivedGrants;
  affiliated_projects: IAffiliatedProject;
  contributing_teams: IContributingTeam;
  contributors_organization: IContributorsOrganization;
  stack_integrations: IStackIntegration;
  advisors: IAdvisors;
  // Add more mappings as needed for other items that return arrays
  // For items not in this map, the function will return any[]
}

// Helper type to get the data type for a specific item key
export type GetItemDataType<K extends IPocItemKey> =
  K extends keyof IItemDataTypeMap ? IItemDataTypeMap[K][] : any[];
