import {
  basicsFieldsConfig,
  datesFieldsConfig,
  organizationFieldsConfig,
  technicalsFieldsConfig,
} from '@/components/pages/project/create/FormData';
import {
  CreateProjectStep,
  stepFields,
} from '@/components/pages/project/create/types';

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
    items: [...stepFields[CreateProjectStep.Basics]],
  },
  [CreateProjectStep.Dates]: {
    title: 'Dates & Statuses',
    description: '',
    items: [...stepFields[CreateProjectStep.Dates]],
  },
  [CreateProjectStep.Technicals]: {
    title: 'Technicals',
    description: '',
    items: [...stepFields[CreateProjectStep.Technicals]],
  },
  [CreateProjectStep.Organization]: {
    title: 'Organization',
    description: '',
    items: [...stepFields[CreateProjectStep.Organization]],
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
