import { ApplicableField } from '@/components/pages/project/create/FormData';
import {
  ProjectCreatePayload,
  ProjectFormData,
  ReferenceData,
} from '@/components/pages/project/create/types';

/**
 * Transform form data to API submission format
 */
export const transformProjectData = (
  formData: ProjectFormData,
  references: ReferenceData[],
  fieldApplicability: Record<ApplicableField, boolean>,
): ProjectCreatePayload => {
  return {
    name: formData.projectName,
    tagline: formData.tagline,
    categories: formData.categories,
    mainDescription: formData.mainDescription,
    logoUrl: formData.projectLogo || '',
    websiteUrl: normalizeUrl(formData.websiteUrl) || '',
    appUrl: fieldApplicability['appUrl']
      ? normalizeUrl(formData.appUrl) || undefined
      : undefined,
    dateFounded: formData.dateFounded
      ? new Date(formData.dateFounded)
      : new Date(),
    dateLaunch: fieldApplicability['dateLaunch']
      ? formData.dateLaunch
        ? new Date(formData.dateLaunch)
        : undefined
      : undefined,
    devStatus: formData.devStatus || 'In Development',
    fundingStatus: fieldApplicability['fundingStatus']
      ? formData.fundingStatus || undefined
      : undefined,
    openSource: formData.openSource === 'Yes',
    codeRepo: fieldApplicability['codeRepo']
      ? normalizeUrl(formData.codeRepo) || undefined
      : undefined,
    tokenContract: fieldApplicability['tokenContract']
      ? formData.tokenContract || undefined
      : undefined,
    orgStructure: formData.orgStructure || 'Centralized',
    publicGoods: formData.publicGoods === 'Yes',
    founders: formData.founders.map((founder) => ({
      name: founder.fullName,
      title: founder.titleRole,
    })),
    refs:
      references.length > 0
        ? references.map((ref) => ({ key: ref.key, value: ref.value }))
        : undefined,
  };
};

export const normalizeUrl = (
  value: string | null | undefined,
): string | null | undefined => {
  if (!value) {
    return value;
  }

  const trimmedValue = value.trim();
  if (trimmedValue === '') {
    return trimmedValue;
  }

  if (
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('https://')
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};
