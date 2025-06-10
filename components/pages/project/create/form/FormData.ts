import { isAutoFillForm, isLocalDev } from '@/constants/env';
import { AllItemConfig } from '@/constants/itemConfig';
import {
  IBasicsKey,
  IFinancialKey,
  IItemCategoryEnum,
  IItemConfig,
  IOrganizationKey,
  ITechnicalsKey,
} from '@/types/item';

import { IItemCategoryEnumWithoutGovernance } from '../StepNavigation';
import { IProjectFormData, IProjectStepFieldsMap } from '../types';

export const DefaultFieldApplicabilityMap = Object.fromEntries(
  Object.entries(AllItemConfig)
    .filter(([_, config]) => config.showApplicable === true)
    .map(([key]) => [key, true]),
);

export const CreateProjectStepFields: IProjectStepFieldsMap = {
  [IItemCategoryEnum.Basics]: {
    name: true,
    tagline: true,
    categories: true,
    mainDescription: true,
    logoUrl: true,
    websites: true,
    appUrl: true,
    tags: true,
    whitePaper: true,
    dateFounded: true,
    dateLaunch: true,
  },
  [IItemCategoryEnum.Technicals]: {
    devStatus: true,
    openSource: true,
    codeRepo: true,

    dappSmartContracts: true,
  },
  [IItemCategoryEnum.Organization]: {
    orgStructure: true,
    publicGoods: true,
    founders: true,
  },
  [IItemCategoryEnum.Financial]: {
    fundingStatus: true,
    tokenContract: true,
  },
};

export const getCreateProjectStepFields = <
  T extends IItemCategoryEnumWithoutGovernance,
>(
  step: T,
): string[] => {
  return Object.keys(CreateProjectStepFields[step]);
};

export const basicsFieldsConfig: {
  [K in IBasicsKey]: IItemConfig<K>;
} = Object.fromEntries(
  Object.entries(AllItemConfig).filter(([key]) =>
    Object.keys(CreateProjectStepFields[IItemCategoryEnum.Basics]).includes(
      key,
    ),
  ),
) as { [K in IBasicsKey]: IItemConfig<K> };

export const technicalsFieldsConfig: {
  [K in ITechnicalsKey]: IItemConfig<K>;
} = Object.fromEntries(
  Object.entries(AllItemConfig).filter(([key]) =>
    Object.keys(CreateProjectStepFields[IItemCategoryEnum.Technicals]).includes(
      key,
    ),
  ),
) as { [K in ITechnicalsKey]: IItemConfig<K> };

export const organizationFieldsConfig: {
  [K in IOrganizationKey]: IItemConfig<K>;
} = Object.fromEntries(
  Object.entries(AllItemConfig).filter(([key]) =>
    Object.keys(
      CreateProjectStepFields[IItemCategoryEnum.Organization],
    ).includes(key),
  ),
) as { [K in IOrganizationKey]: IItemConfig<K> };

export const financialFieldsConfig: {
  [K in IFinancialKey]: IItemConfig<K>;
} = Object.fromEntries(
  Object.entries(AllItemConfig).filter(([key]) =>
    Object.keys(CreateProjectStepFields[IItemCategoryEnum.Financial]).includes(
      key,
    ),
  ),
) as { [K in IFinancialKey]: IItemConfig<K> };

export const DEFAULT_CREATE_PROJECT_FORM_DATA: IProjectFormData = {
  name: '',
  tagline: '',
  categories: [],
  mainDescription: '',
  logoUrl: '',
  websites: [{ url: '', title: '' }],
  appUrl: null,
  dateFounded: null,
  dateLaunch: null,
  devStatus: '',
  fundingStatus: null,
  openSource: '',
  codeRepo: null,
  tokenContract: null,
  orgStructure: '',
  publicGoods: '',
  founders: [{ name: '', title: '' }],
  tags: [],
  whitePaper: '',
  dappSmartContracts: '',
};

export const FakeProjectFormData: IProjectFormData = {
  name: 'Project for testing',
  tagline: 'Tagline of project',
  categories: ['Infrastructure', 'Applications/dApps'],
  tags: ['Optimism', 'Ethereum'],
  mainDescription:
    'Status is a messenger, crypto wallet, and Web3 browser built with state of the art technology. Status is a messenger, crypto wallet, and Web3 browser built with state of the art technology.',
  logoUrl:
    'https://pub-d00cee3ff1154a18bdf38c29db9a51c5.r2.dev/uploads/a4dbec29-8f62-4e13-9722-01ef0a12de8e.jpeg',
  websites: [{ url: 'https://fake-project.com', title: 'Fake website name' }],
  appUrl: 'https://fake-project.com',
  dateFounded: new Date('2025-01-01'),
  dateLaunch: new Date('2025-01-01'),
  devStatus: 'Beta',
  fundingStatus: 'Yes',
  openSource: 'Yes',
  codeRepo: 'https://github.com/fake-project',
  tokenContract: '0x1234567890123456789012345678901234567890',
  orgStructure: 'DAO',
  publicGoods: 'Yes',
  founders: [{ name: 'John Doe', title: 'Founder' }],
  whitePaper: 'https://fake-project.com/whitepaper.pdf',
  dappSmartContracts: '0x1234567890123456789012345678901234567890',
};

export const getDefaultProjectFormData = (): IProjectFormData => {
  if (isLocalDev && isAutoFillForm) {
    return FakeProjectFormData;
  }
  return DEFAULT_CREATE_PROJECT_FORM_DATA;
};
