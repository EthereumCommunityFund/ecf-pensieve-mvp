import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';

import { ApplicableField } from '@/components/pages/project/create/FormData';

export enum IFormTypeEnum {
  Project = 'project',
  Proposal = 'proposal',
}

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
  key: string;
  ref: string;
  value: string;
}

export interface ProjectFormData {
  name: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  logoUrl: string | null;
  websiteUrl: string;
  appUrl: string | null;

  dateFounded: Date | null;
  dateLaunch: Date | null;
  devStatus: string;
  fundingStatus: string | null;

  openSource: 'Yes' | 'No' | '';
  codeRepo: string | null;
  tokenContract: string | null;

  orgStructure: string | null;
  publicGoods: 'Yes' | 'No' | '';
  founders: FounderInput[];
}

export interface IRef {
  key: string;
  value: string;
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
  refs?: IRef[];
}

export interface ProposalCreatePayload {
  projectId: number;
  items: {
    key: string;
    value: string;
  }[];
  refs?: {
    key: string;
    value: string;
  }[];
}

export interface StepFormProps {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  register: UseFormRegister<ProjectFormData>;
  watch: UseFormWatch<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  trigger: UseFormTrigger<ProjectFormData>;
  onAddReference: (key: string, label?: string) => void;
  onRemoveReference?: (fieldKey: string) => void;
  fieldApplicability: Record<ApplicableField, boolean>;
  onChangeApplicability: (field: ApplicableField, value: boolean) => void;
  hasFieldReference: (fieldKey: string) => boolean;
}

export const stepFields = {
  [CreateProjectStep.Basics]: [
    'name',
    'tagline',
    'categories',
    'mainDescription',
    'logoUrl',
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
