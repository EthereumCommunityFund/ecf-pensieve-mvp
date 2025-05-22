export enum IItemCategoryEnum {
  Basics = 'basics',
  // Dates = 'dates',
  Technicals = 'technicals',
  Organization = 'organization',
  Financial = 'financial',
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
  label: string;
  description?: string;
  shortDescription?: string; // For tooltip
  weight?: string | number;
  formDisplayType: IFormDisplayType;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select, radio
  showApplicable?: boolean; // Whether the applicable switch should be shown
  showReference?: boolean; // Whether the reference button should be shown
  showExpand?: boolean; // Whether the field can be expanded in the projectDetail/proposal table
  startContentText?: string; // For URL inputs
  minRows?: number; // For Textarea
}

export type IFormDisplayType =
  | 'text'
  | 'textarea'
  | 'selectMultiple'
  | 'photo'
  | 'url'
  | 'switchableUrl'
  | 'date'
  | 'switchableDate'
  | 'select'
  | 'radio'
  | 'founderList';
