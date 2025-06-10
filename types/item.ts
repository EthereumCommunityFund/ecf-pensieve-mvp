import { POC_ITEMS } from '@/lib/pocItems';

type FilterEssentialKeys<T> = {
  [K in keyof T]: T[K] extends { isEssential: true } ? K : never;
}[keyof T];

type FilterNonEssentialKeys<T> = {
  [K in keyof T]: T[K] extends { isEssential: false } ? K : never;
}[keyof T];

export type IPocItemKey = keyof typeof POC_ITEMS;
/**
 * 预留扩展字段，不一定完全从IPocItemKey取key
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
  minDate?: Date | string | 'today' | 'yesterday' | 'tomorrow'; // 最小日期
  maxDate?: Date | string | 'today' | 'yesterday' | 'tomorrow'; // 最大日期
  disabledDates?: Date[] | string[]; // 禁用的特定日期
  disabledDaysOfWeek?: number[]; // 禁用的星期几 (0-6, 0为周日)
  enabledDateRanges?: Array<{ start: Date | string; end: Date | string }>; // 只允许的日期范围
  yearRange?: { min?: number; max?: number }; // 年份范围限制
  relativeToToday?: {
    minDaysFromToday?: number; // 距离今天的最小天数（负数表示过去，正数表示未来）
    maxDaysFromToday?: number; // 距离今天的最大天数
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

export type IFormDisplayType =
  | 'string'
  | 'textarea'
  | 'stringMultiple' // separate by comma
  | 'select'
  | 'selectMultiple'
  | 'img'
  | 'link'
  | 'date'
  | 'founderList'
  | 'websites'
  | 'autoComplete'
  | 'roadmap';

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
  description: string;
  subCategories: ISubCategoryConfig[];
}

export interface IProposalItem {
  key: string;
  value: any;
}
