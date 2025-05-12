import { ApplicableField } from '@/components/pages/project/create/FormData';
import {
  ProjectCreatePayload,
  ProjectFormData,
  ProposalCreatePayload,
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

/**
 * Transform form data to proposal API submission format
 */
export const transformProposalData = (
  formData: ProjectFormData,
  references: ReferenceData[],
  fieldApplicability: Record<ApplicableField, boolean>,
  projectId: number,
): ProposalCreatePayload => {
  const items = [
    { key: 'projectName', value: formData.projectName },
    { key: 'tagline', value: formData.tagline },
    { key: 'categories', value: JSON.stringify(formData.categories) },
    { key: 'mainDescription', value: formData.mainDescription },
    { key: 'logoUrl', value: formData.projectLogo || '' },
    { key: 'websiteUrl', value: normalizeUrl(formData.websiteUrl) || '' },
  ];

  if (fieldApplicability['appUrl'] && formData.appUrl) {
    items.push({ key: 'appUrl', value: normalizeUrl(formData.appUrl) || '' });
  }

  if (formData.dateFounded) {
    items.push({
      key: 'dateFounded',
      value: formData.dateFounded.toISOString(),
    });
  }

  if (fieldApplicability['dateLaunch'] && formData.dateLaunch) {
    items.push({ key: 'dateLaunch', value: formData.dateLaunch.toISOString() });
  }

  if (formData.devStatus) {
    items.push({ key: 'devStatus', value: formData.devStatus });
  }

  if (fieldApplicability['fundingStatus'] && formData.fundingStatus) {
    items.push({ key: 'fundingStatus', value: formData.fundingStatus });
  }

  items.push({ key: 'openSource', value: formData.openSource });

  if (fieldApplicability['codeRepo'] && formData.codeRepo) {
    items.push({
      key: 'codeRepo',
      value: normalizeUrl(formData.codeRepo) || '',
    });
  }

  if (fieldApplicability['tokenContract'] && formData.tokenContract) {
    items.push({ key: 'tokenContract', value: formData.tokenContract });
  }

  if (formData.orgStructure) {
    items.push({ key: 'orgStructure', value: formData.orgStructure });
  }

  items.push({ key: 'publicGoods', value: formData.publicGoods });

  if (formData.founders && formData.founders.length > 0) {
    items.push({
      key: 'founders',
      value: JSON.stringify(
        formData.founders.map((founder) => ({
          name: founder.fullName,
          title: founder.titleRole,
        })),
      ),
    });
  }

  return {
    projectId,
    items,
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
