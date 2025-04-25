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
    websiteUrl: formData.websiteUrl,
    appUrl: fieldApplicability['appUrl']
      ? formData.appUrl || undefined
      : undefined,
    dateFounded: formData.dateFounded
      ? new Date(formData.dateFounded)
      : new Date(),
    dateLaunch: fieldApplicability['dateLaunch']
      ? undefined
      : formData.dateLaunch
        ? new Date(formData.dateLaunch)
        : undefined,
    devStatus: formData.devStatus || 'In Development',
    fundingStatus: fieldApplicability['fundingStatus']
      ? undefined
      : formData.fundingStatus || undefined,
    openSource: formData.openSource === 'Yes',
    codeRepo: fieldApplicability['codeRepo']
      ? undefined
      : formData.codeRepo || undefined,
    tokenContract: fieldApplicability['tokenContract']
      ? undefined
      : formData.tokenContract || undefined,
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
