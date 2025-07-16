import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';

import {
  IBasicsKey,
  IEssentialItemKey,
  IFinancialKey,
  IItemCategoryEnum,
  IOrganizationKey,
  ITechnicalsKey,
} from '@/types/item';

export enum IFormTypeEnum {
  Project = 'project',
  Proposal = 'proposal',
}

export type IStepStatus = 'Inactive' | 'Active' | 'Finished';

export interface IFounder {
  name: string;
  title: string;
}

export interface IWebsite {
  url: string;
  title: string;
}

export interface IReferenceData {
  key: string;
  ref: string;
  value: string;
}

export interface IProjectFormData
  extends Partial<Record<IEssentialItemKey, any>> {
  name: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  logoUrl: string | null;
  websites: IWebsite[];
  appUrl: string | null;
  tags: string[];
  whitePaper: string;
  dateFounded: Date | null;
  dateLaunch: Date | null;
  devStatus: string;
  fundingStatus: string | null;
  openSource: 'Yes' | 'No' | '';
  codeRepo: string | null;
  tokenContract: string | null;
  dappSmartContracts: string;
  orgStructure: string | null;
  publicGoods: 'Yes' | 'No' | '';
  founders: IFounder[];
}

export interface IRef {
  key: string;
  value: string;
}

export interface ICreateProjectPayload {
  name: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  logoUrl: string;
  websites: IWebsite[];
  appUrl?: string;
  tags: string[];
  whitePaper: string;
  dateFounded: Date;
  dateLaunch?: Date;
  devStatus: string;
  fundingStatus?: string;
  openSource: boolean;
  codeRepo?: string;
  tokenContract?: string;
  dappSmartContracts: string;
  orgStructure: string;
  publicGoods: boolean;
  founders: IFounder[];

  refs?: IRef[];
}
export interface ICreateProposalPayload {
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

export interface IStepFormProps {
  control: Control<IProjectFormData>;
  errors: FieldErrors<IProjectFormData>;
  register: UseFormRegister<IProjectFormData>;
  watch: UseFormWatch<IProjectFormData>;
  setValue: UseFormSetValue<IProjectFormData>;
  trigger: UseFormTrigger<IProjectFormData>;
  onAddReference: (key: string, label?: string) => void;
  onRemoveReference?: (fieldKey: string) => void;
  fieldApplicability: Record<string, boolean>;
  onChangeApplicability: (field: string, value: boolean) => void;
  hasFieldReference: (fieldKey: string) => boolean;
  formType: IFormTypeEnum;
}

export type IProjectStepFieldsMap = {
  [IItemCategoryEnum.Basics]: { [K in IBasicsKey]: true };
  [IItemCategoryEnum.Technicals]: { [K in ITechnicalsKey]: true };
  [IItemCategoryEnum.Organization]: { [K in IOrganizationKey]: true };
  [IItemCategoryEnum.Financial]: { [K in IFinancialKey]: true };
};
