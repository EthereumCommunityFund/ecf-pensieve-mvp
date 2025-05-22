import { AllItemConfig } from '@/constants/itemConfig';
import {
  IBasicsKey,
  IDatesKey,
  IItemCategoryEnum,
  IItemConfig,
  IOrganizationKey,
  ITechnicalsKey,
} from '@/types/item';

import { IProjectFormData, IProjectStepFieldsMap } from './types';

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
    websiteUrl: true,
    appUrl: true,
    tags: true,
    whitePaper: true,
  },
  [IItemCategoryEnum.Dates]: {
    dateFounded: true,
    dateLaunch: true,
    devStatus: true,
    fundingStatus: true,
  },
  [IItemCategoryEnum.Technicals]: {
    openSource: true,
    codeRepo: true,
    tokenContract: true,
    dappSmartContracts: true,
  },
  [IItemCategoryEnum.Organization]: {
    orgStructure: true,
    publicGoods: true,
    founders: true,
  },
};

export const getCreateProjectStepFields = <T extends IItemCategoryEnum>(
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

export const datesFieldsConfig: {
  [K in IDatesKey]: IItemConfig<K>;
} = Object.fromEntries(
  Object.entries(AllItemConfig).filter(([key]) =>
    Object.keys(CreateProjectStepFields[IItemCategoryEnum.Dates]).includes(key),
  ),
) as { [K in IDatesKey]: IItemConfig<K> };

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

export const DEFAULT_CREATE_PROJECT_FORM_DATA: IProjectFormData = {
  name: '',
  tagline: '',
  categories: [],
  mainDescription: '',
  logoUrl: '',
  websiteUrl: '',
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
  founders: [{ fullName: '', titleRole: '' }],
  tags: [],
  whitePaper: '',
  dappSmartContracts: '',
};
