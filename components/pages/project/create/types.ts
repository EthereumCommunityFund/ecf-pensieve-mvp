import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';

export enum CreateProjectStep {
  Basics = 'basics',
  Dates = 'dates',
  Technicals = 'technicals',
  Organization = 'organization',
}

export type StepStatus = 'Inactive' | 'Active' | 'Finished';

export interface FounderInput {
  fullName: string;
  titleRole: string;
}

export interface ReferenceData {
  key: string; // 被引用的字段名 (e.g., 'projectName')
  ref: string; // 引用 URL
}

export interface ProjectFormData {
  // Basics
  projectName: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  projectLogo: string | null; // 存储上传后的 URL 字符串
  websiteUrl: string;
  appUrl: string | null;

  // Dates & Statuses
  dateFounded: Date | null; // 使用 Date 对象以便 Picker 处理
  dateLaunch: Date | null;
  devStatus: 'Live' | 'In Development' | 'Discontinued' | 'Stealth' | ''; // 添加空字符串以允许初始未选状态
  fundingStatus: 'Funded' | 'VC Invested' | 'No Funding' | '' | null; // 添加空字符串

  // Technicals
  openSource: 'Yes' | 'No' | ''; // 使用字符串以便 Select 处理
  codeRepo: string | null;
  tokenContract: string | null;

  // Organization
  orgStructure: 'Centralized' | 'DAO' | 'Decentralized' | ''; // 添加空字符串
  publicGoods: 'Yes' | 'No' | ''; // 使用字符串以便 Select 处理
  founders: FounderInput[];

  // Non-field state, potentially managed outside RHF but included for Yup schema if needed
  // refs implicitly managed via separate state
}

export interface ProjectCreatePayload {
  name: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  logoUrl: string | null;
  websiteUrl: string;
  appUrl: string | null;
  dateFounded: string; // ISO 8601 string
  dateLaunch: string | null; // ISO 8601 string or null
  devStatus: 'Live' | 'In Development' | 'Discontinued' | 'Stealth';
  fundingStatus: 'Funded' | 'VC Invested' | 'No Funding' | null;
  openSource: boolean;
  codeRepo: string | null;
  tokenContract: string | null; // Ethereum address string or null
  orgStructure: 'Centralized' | 'DAO' | 'Decentralized';
  publicGoods: boolean;
  founders: string[]; // Array of JSON strings: '{"fullName": "...", "titleRole": "..."}'
  creator: string; // Current user's UUID string
  refs: ReferenceData[] | null; // Array of reference objects or null
}

export type ApplicableField =
  | 'appUrl'
  | 'dateLaunch'
  | 'fundingStatus'
  | 'codeRepo'
  | 'tokenContract';

export interface StepFormProps {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  register: UseFormRegister<ProjectFormData>;
  watch: UseFormWatch<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  trigger: UseFormTrigger<ProjectFormData>;
  onAddReference: (key: string, label?: string) => void;
  applicableStates: Record<ApplicableField, boolean>;
  onChangeApplicableStates: (field: ApplicableField, value: boolean) => void;
}

export const stepFields = {
  [CreateProjectStep.Basics]: [
    'projectName',
    'tagline',
    'categories',
    'mainDescription',
    'projectLogo',
    'websiteUrl',
    'appUrl',
  ],
  [CreateProjectStep.Dates]: [
    'dateFounded',
    'dateLaunch',
    'devStatus',
    'fundingStatus',
  ],
  [CreateProjectStep.Technicals]: ['openSource', 'codeRepo', 'tokenContract'],
  [CreateProjectStep.Organization]: ['orgStructure', 'publicGoods', 'founders'],
} as const;

export type BasicsKeys = (typeof stepFields)[CreateProjectStep.Basics][number];
export type DatesKeys = (typeof stepFields)[CreateProjectStep.Dates][number];
export type TechnicalsKeys =
  (typeof stepFields)[CreateProjectStep.Technicals][number];
export type OrganizationKeys =
  (typeof stepFields)[CreateProjectStep.Organization][number];
