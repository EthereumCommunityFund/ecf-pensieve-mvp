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
  value: string; // 引用值
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
  logoUrl: string;
  websiteUrl: string;
  appUrl?: string;
  dateFounded: Date;
  dateLaunch?: Date;
  devStatus: string;
  fundingStatus?: string;
  openSource: boolean;
  codeRepo?: string;
  tokenContract?: string;
  orgStructure: string;
  publicGoods: boolean;
  founders: {
    name: string;
    title: string;
  }[];
  refs?: {
    key: string;
    value: string;
  }[];
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
  fieldApplicability: Record<ApplicableField, boolean>;
  onChangeApplicability: (field: ApplicableField, value: boolean) => void;
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
