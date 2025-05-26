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
}

export type IBasicsKey =
  | 'name'
  | 'tagline'
  | 'categories'
  | 'mainDescription'
  | 'logoUrl'
  | 'websiteUrl'
  | 'appUrl'
  | 'tags'
  | 'whitePaper'
  | 'dateFounded'
  | 'dateLaunch';

export type ITechnicalsKey =
  | 'devStatus'
  | 'openSource'
  | 'codeRepo'
  | 'dappSmartContracts';

export type IOrganizationKey = 'orgStructure' | 'publicGoods' | 'founders';

export type IFinancialKey = 'fundingStatus' | 'tokenContract';

export type IEssentialItemKey =
  | IBasicsKey
  | ITechnicalsKey
  | IOrganizationKey
  | IFinancialKey;

export interface IItemConfig<K extends IEssentialItemKey> {
  key: K;
  category: IItemCategoryEnum;
  subCategory: IItemSubCategoryEnum;
  group?: IItemGroupEnum;
  isEssential?: boolean;
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
}

export type IFormDisplayType =
  | 'string'
  | 'stringMultiple' // separate by comma
  | 'select'
  | 'selectMultiple'
  | 'img'
  | 'link'
  | 'date'
  | 'founderList';

export interface IGroupConfig {
  key: IItemGroupEnum;
  title: string;
  description: string;
  items: (IEssentialItemKey | string)[];
}

export interface ISubCategoryConfig {
  key: IItemSubCategoryEnum;
  title: string;
  description: string;
  items: IEssentialItemKey[];
  groups?: IGroupConfig[];
  /**
   * not essential items that should be shown in the table even if they are not selected
   */
  emptyItems?: string[];
}

export interface ICategoryConfig {
  key: IItemCategoryEnum;
  title: string;
  description: string;
  subCategories: ISubCategoryConfig[];
}
