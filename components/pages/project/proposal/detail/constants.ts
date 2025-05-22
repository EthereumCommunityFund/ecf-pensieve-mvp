import {
  basicsFieldsConfig,
  financialFieldsConfig,
  getCreateProjectStepFields,
  organizationFieldsConfig,
  technicalsFieldsConfig,
} from '@/components/pages/project/create/FormData';
import { IItemCategoryEnum } from '@/types/item';

export const TableFieldCategory: Record<
  IItemCategoryEnum,
  {
    title: string;
    description: string;
    items: string[];
  }
> = {
  [IItemCategoryEnum.Basics]: {
    title: 'Basics',
    description: '',
    items: getCreateProjectStepFields(IItemCategoryEnum.Basics),
  },
  [IItemCategoryEnum.Technicals]: {
    title: 'Technicals',
    description: '',
    items: getCreateProjectStepFields(IItemCategoryEnum.Technicals),
  },
  [IItemCategoryEnum.Organization]: {
    title: 'Organization',
    description: '',
    items: getCreateProjectStepFields(IItemCategoryEnum.Organization),
  },
  [IItemCategoryEnum.Financial]: {
    title: 'Financial',
    description: '',
    items: getCreateProjectStepFields(IItemCategoryEnum.Financial),
  },
};

export const FIELD_LABELS: Record<string, string> = {
  ...Object.entries(basicsFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
  ...Object.entries(technicalsFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
  ...Object.entries(organizationFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
  ...Object.entries(financialFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
};
