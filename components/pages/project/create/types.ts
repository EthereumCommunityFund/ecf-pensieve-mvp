import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';

import type { SmartContract } from '@/components/biz/project/smart-contracts/ContractEntry';
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
  region?: string;
  _id?: string;
}

export interface IWebsite {
  url: string;
  title: string;
  _id?: string;
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
  dappSmartContracts: SmartContract[];
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
  appUrl: string | null;
  tags: string[];
  whitePaper: string | null;
  dateFounded: Date;
  dateLaunch: Date | null;
  devStatus: string;
  fundingStatus: string | null;
  openSource: boolean;
  codeRepo: string | null;
  tokenContract: string | null;
  dappSmartContracts: SmartContract[] | null;
  orgStructure: string;
  publicGoods: boolean;
  founders: IFounder[];

  refs:
    | {
        key: string;
        value: string;
      }[]
    | null;
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
