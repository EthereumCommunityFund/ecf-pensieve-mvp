import {
  ICreateProjectPayload,
  ICreateProposalPayload,
  IFormTypeEnum,
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { isAutoFillForm, isLocalDev } from '@/constants/env';
import { IProject } from '@/types';
import { transformFormValue } from '@/utils/item';
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
  const items = [
    {
      key: 'name',
      value: transformFormValue('name', formData.name, fieldApplicability),
    },
    {
      key: 'tagline',
      value: transformFormValue(
        'tagline',
        formData.tagline,
        fieldApplicability,
      ),
    },
    {
      key: 'categories',
      value: transformFormValue(
        'categories',
        JSON.stringify(formData.categories),
        fieldApplicability,
      ),
    },
    {
      key: 'mainDescription',
      value: transformFormValue(
        'mainDescription',
        formData.mainDescription,
        fieldApplicability,
      ),
    },
    {
      key: 'logoUrl',
      value: transformFormValue(
        'logoUrl',
        formData.logoUrl || '',
        fieldApplicability,
      ),
    },
    {
      key: 'websiteUrl',
      value: transformFormValue(
        'websiteUrl',
        normalizeUrl(formData.websiteUrl) || '',
        fieldApplicability,
      ),
    },
    {
      key: 'tags',
      value: transformFormValue(
        'tags',
        JSON.stringify(formData.tags),
        fieldApplicability,
      ),
    },
    {
      key: 'whitePaper',
      value: transformFormValue(
        'whitePaper',
        formData.whitePaper,
        fieldApplicability,
      ),
    },
    {
      key: 'appUrl',
      value: transformFormValue(
        'appUrl',
        normalizeUrl(formData.appUrl) || '',
        fieldApplicability,
      ),
    },
    {
      key: 'dateFounded',
      value: transformFormValue(
        'dateFounded',
        formData.dateFounded?.toISOString() || '',
        fieldApplicability,
      ),
    },
    {
      key: 'dateLaunch',
      value: transformFormValue(
        'dateLaunch',
        formData.dateLaunch?.toISOString() || '',
        fieldApplicability,
      ),
    },
    {
      key: 'devStatus',
      value: transformFormValue(
        'devStatus',
        formData.devStatus || '',
        fieldApplicability,
      ),
    },
    {
      key: 'fundingStatus',
      value: transformFormValue(
        'fundingStatus',
        formData.fundingStatus || '',
        fieldApplicability,
      ),
    },
    {
      key: 'openSource',
      value: transformFormValue(
        'openSource',
        formData.openSource,
        fieldApplicability,
      ),
    },
    {
      key: 'codeRepo',
      value: transformFormValue(
        'codeRepo',
        normalizeUrl(formData.codeRepo) || '',
        fieldApplicability,
      ),
    },
    {
      key: 'tokenContract',
      value: transformFormValue(
        'tokenContract',
        formData.tokenContract || '',
        fieldApplicability,
      ),
    },
    {
      key: 'dappSmartContracts',
      value: transformFormValue(
        'dappSmartContracts',
        formData.dappSmartContracts || '',
        fieldApplicability,
      ),
    },
    {
      key: 'orgStructure',
      value: transformFormValue(
        'orgStructure',
        formData.orgStructure || '',
        fieldApplicability,
      ),
    },
    {
      key: 'publicGoods',
      value: transformFormValue(
        'publicGoods',
        formData.publicGoods,
        fieldApplicability,
      ),
    },
    {
      key: 'founders',
      value: transformFormValue(
        'founders',
        formData.founders?.length > 0
          ? JSON.stringify(
              formData.founders.map((founder) => ({
                name: founder.fullName,
                title: founder.titleRole,
              })),
            )
          : '',
        fieldApplicability,
      ),
    },
  ];

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
