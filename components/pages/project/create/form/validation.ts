import * as yup from 'yup';

import { founderSchema, itemValidationSchemas } from '@/constants/itemSchemas';

import { IProjectFormData } from '../types';

export const projectSchema = yup
  .object()
  .shape({
    name: itemValidationSchemas.name,
    tagline: itemValidationSchemas.tagline,
    categories: itemValidationSchemas.categories,
    mainDescription: itemValidationSchemas.mainDescription,
    logoUrl: itemValidationSchemas.logoUrl,
    websites: itemValidationSchemas.websites,
    appUrl: itemValidationSchemas.appUrl,
    tags: itemValidationSchemas.tags,
    whitePaper: itemValidationSchemas.whitePaper,
    dateFounded: itemValidationSchemas.dateFounded,
    dateLaunch: itemValidationSchemas.dateLaunch,

    devStatus: itemValidationSchemas.devStatus,
    openSource: itemValidationSchemas.openSource,
    codeRepo: itemValidationSchemas.codeRepo,
    dappSmartContracts: itemValidationSchemas.dappSmartContracts,

    orgStructure: itemValidationSchemas.orgStructure,
    publicGoods: itemValidationSchemas.publicGoods,
    founders: itemValidationSchemas.founders,

    fundingStatus: itemValidationSchemas.fundingStatus,
    funding_received_grants: itemValidationSchemas.funding_received_grants,
    tokenContract: itemValidationSchemas.tokenContract,
  })
  .defined() as yup.ObjectSchema<IProjectFormData>;

export { founderSchema };
