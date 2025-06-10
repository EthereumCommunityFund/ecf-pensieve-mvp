import {
  ICreateProjectPayload,
  ICreateProposalPayload,
  IFormTypeEnum,
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { isAutoFillForm, isLocalDev } from '@/constants/env';
import { IProject } from '@/types';
import { IPocItemKey } from '@/types/item';
import { transformFormValue } from '@/utils/item';
import { normalizeUrl } from '@/utils/url';

/**
 * Helper function to convert empty string to undefined for optional fields
 */
const emptyToUndefined = (value: string): string | undefined => {
  return value === '' ? undefined : value;
};

/**
 * Helper function to convert empty string to Date or undefined
 */
const emptyToDateOrUndefined = (value: string): Date | undefined => {
  return value === '' ? undefined : new Date(value);
};

/**
 * Helper function to handle array type fields - returns original array if not empty string
 */
const transformArrayField = <T>(
  key: IPocItemKey,
  originalValue: T,
  fieldApplicability: Record<string, boolean>,
): T | string => {
  const transformedValue = transformFormValue(
    key,
    originalValue,
    fieldApplicability,
  );
  // If transformFormValue returns empty string (field not applicable), return it
  // Otherwise return the original array value
  return transformedValue === '' ? transformedValue : originalValue;
};

/**
 * Transform form data to API submission format
 */
export const transformProjectData = (
  formData: IProjectFormData,
  references: IReferenceData[],
  fieldApplicability: Record<string, boolean>,
): ICreateProjectPayload => {
  const categoriesValue = transformArrayField(
    'categories',
    formData.categories,
    fieldApplicability,
  );
  const tagsValue = transformArrayField(
    'tags',
    formData.tags,
    fieldApplicability,
  );

  return {
    name: transformFormValue('name', formData.name, fieldApplicability),
    tagline: transformFormValue(
      'tagline',
      formData.tagline,
      fieldApplicability,
    ),
    categories: categoriesValue as string[],
    mainDescription: transformFormValue(
      'mainDescription',
      formData.mainDescription,
      fieldApplicability,
    ),
    logoUrl: transformFormValue(
      'logoUrl',
      formData.logoUrl || '',
      fieldApplicability,
    ),
    websites: formData.websites.map((website) => ({
      url: website.url,
      title: website.title,
    })),
    appUrl: emptyToUndefined(
      transformFormValue(
        'appUrl',
        normalizeUrl(formData.appUrl) || '',
        fieldApplicability,
      ),
    ),
    tags: tagsValue as string[],
    whitePaper: transformFormValue(
      'whitePaper',
      formData.whitePaper,
      fieldApplicability,
    ),

    dateFounded: formData.dateFounded
      ? new Date(formData.dateFounded)
      : new Date(),
    dateLaunch: emptyToDateOrUndefined(
      transformFormValue(
        'dateLaunch',
        formData.dateLaunch?.toISOString() || '',
        fieldApplicability,
      ),
    ),
    devStatus: transformFormValue(
      'devStatus',
      formData.devStatus || 'In Development',
      fieldApplicability,
    ),
    fundingStatus: emptyToUndefined(
      transformFormValue(
        'fundingStatus',
        formData.fundingStatus || '',
        fieldApplicability,
      ),
    ),
    openSource: formData.openSource === 'Yes',
    codeRepo: emptyToUndefined(
      transformFormValue(
        'codeRepo',
        normalizeUrl(formData.codeRepo) || '',
        fieldApplicability,
      ),
    ),
    tokenContract: emptyToUndefined(
      transformFormValue(
        'tokenContract',
        formData.tokenContract || '',
        fieldApplicability,
      ),
    ),
    dappSmartContracts: transformFormValue(
      'dappSmartContracts',
      formData.dappSmartContracts || '',
      fieldApplicability,
    ),

    orgStructure: transformFormValue(
      'orgStructure',
      formData.orgStructure || 'Centralized',
      fieldApplicability,
    ),
    publicGoods: formData.publicGoods === 'Yes',
    founders: formData.founders.map((founder) => ({
      name: founder.name,
      title: founder.title,
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
      key: 'websites',
      value: transformFormValue(
        'websites',
        formData.websites?.length > 0
          ? JSON.stringify(
              formData.websites.map((website) => ({
                url: website.url,
                title: website.title,
              })),
            )
          : '',
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
                name: founder.name,
                title: founder.title,
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
    websites: project.websites.map((website: any) => ({
      url: website.url,
      title: website.title,
    })),
    appUrl: project.appUrl || null,
    tags: project.tags,
    whitePaper: project.whitePaper || '',
    dappSmartContracts: project.dappSmartContracts || '',
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
      name: founder.name,
      title: founder.title,
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
