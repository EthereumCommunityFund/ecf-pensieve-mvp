import {
  basicsFieldsConfig,
  datesFieldsConfig,
  organizationFieldsConfig,
  technicalsFieldsConfig,
} from '@/components/pages/project/create/FormData';
import { CreateProjectStep } from '@/components/pages/project/create/types';

export const CATEGORIES: Record<
  CreateProjectStep,
  {
    title: string;
    description: string;
    items: string[];
  }
> = {
  [CreateProjectStep.Basics]: {
    title: 'Basics',
    description: '',
    items: [
      'name',
      'tagline',
      'categories',
      'tags',
      'mainDescription',
      'logoUrl',
      'websiteUrl',
      'appUrl',
      'whitePaper',
    ],
  },
  [CreateProjectStep.Dates]: {
    title: 'Dates & Statuses',
    description: '',
    items: ['dateFounded', 'dateLaunch', 'devStatus', 'fundingStatus'],
  },
  [CreateProjectStep.Technicals]: {
    title: 'Technicals',
    description: '',
    items: ['openSource', 'codeRepo', 'tokenContract', 'dappSmartContracts'],
  },
  [CreateProjectStep.Organization]: {
    title: 'Organization',
    description: '',
    items: ['orgStructure', 'publicGoods', 'founders'],
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
  ...Object.entries(datesFieldsConfig).reduce(
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
};
