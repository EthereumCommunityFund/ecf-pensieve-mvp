import {
  ICreateProjectPayload,
  ICreateProposalPayload,
  IFormTypeEnum,
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { isAutoFillForm, isLocalDev } from '@/constants/env';
import { IProject } from '@/types';
import { normalizeUrl } from '@/utils/url';

/**
 * Transform form data to API submission format
 */
export const transformProjectData = (
  formData: IProjectFormData,
  references: IReferenceData[],
  fieldApplicability: Record<string, boolean>,
): ICreateProjectPayload => {
  return {
    name: formData.name,
    tagline: formData.tagline,
    categories: formData.categories,
    mainDescription: formData.mainDescription,
    logoUrl: formData.logoUrl || '',
    websiteUrl: normalizeUrl(formData.websiteUrl) || '',
    appUrl: fieldApplicability['appUrl']
      ? normalizeUrl(formData.appUrl) || undefined
      : undefined,
    tags: formData.tags,
    whitePaper: formData.whitePaper,

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
    tokenContract: formData.tokenContract || undefined,
    dappSmartContracts: fieldApplicability['dappSmartContracts']
      ? formData.dappSmartContracts || ''
      : '',

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
  formData: IProjectFormData,
  references: IReferenceData[],
  fieldApplicability: Record<string, boolean>,
  projectId: number,
): ICreateProposalPayload => {
  // TODO: is it order important?
  const items = [
    { key: 'name', value: formData.name },
    { key: 'tagline', value: formData.tagline },
    { key: 'categories', value: JSON.stringify(formData.categories) },
    { key: 'mainDescription', value: formData.mainDescription },
    { key: 'logoUrl', value: formData.logoUrl || '' },
    { key: 'websiteUrl', value: normalizeUrl(formData.websiteUrl) || '' },
    { key: 'tags', value: JSON.stringify(formData.tags) },
    { key: 'whitePaper', value: formData.whitePaper },
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

  items.push({ key: 'tokenContract', value: formData.tokenContract || '' });

  items.push({ key: 'dappSmartContracts', value: formData.dappSmartContracts });

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

export const convertProjectToFormData = (
  project: IProject,
): IProjectFormData => {
  return {
    name: project.name,
    tagline: project.tagline,
    categories: project.categories,
    mainDescription: project.mainDescription,
    logoUrl: project.logoUrl,
    websiteUrl: project.websiteUrl,
    appUrl: project.appUrl || null,
    tags: project.tags,
    whitePaper: project.whitePaper,
    dappSmartContracts: project.dappSmartContracts,
    dateFounded: project.dateFounded ? new Date(project.dateFounded) : null,
    dateLaunch: project.dateLaunch ? new Date(project.dateLaunch) : null,
    devStatus: project.devStatus,
    fundingStatus: project.fundingStatus || null,
    openSource: project.openSource ? 'Yes' : 'No',
    codeRepo: project.codeRepo || null,
    tokenContract: project.tokenContract || null,
    orgStructure: project.orgStructure,
    publicGoods: project.publicGoods ? 'Yes' : 'No',
    founders: project.founders.map((founder: any) => ({
      fullName: founder.name,
      titleRole: founder.title,
    })),
  };
};

export const convertProjectRefsToReferenceData = (
  project: IProject,
): IReferenceData[] => {
  if (!project.refs || !Array.isArray(project.refs)) {
    return [];
  }

  return project.refs.map((ref: any) => ({
    key: ref.key,
    ref: ref.value,
    value: ref.value,
  }));
};

export const updateFormWithProjectData = (
  formType: IFormTypeEnum,
  projectData: IProject | undefined,
  setValue: (name: keyof IProjectFormData, value: any) => void,
  setReferences?: (refs: IReferenceData[]) => void,
): void => {
  if (
    formType === IFormTypeEnum.Proposal &&
    isLocalDev &&
    isAutoFillForm &&
    projectData
  ) {
    const formData = convertProjectToFormData(projectData);
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        setValue(key as keyof IProjectFormData, value as any);
      }
    });

    if (setReferences && projectData.refs && Array.isArray(projectData.refs)) {
      const referenceData = convertProjectRefsToReferenceData(projectData);
      if (referenceData.length > 0) {
        setReferences(referenceData);
      }
    }
  }
};
