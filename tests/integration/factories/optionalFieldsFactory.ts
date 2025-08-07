import { createValidProjectData, ValidProjectData } from './projectFactory';

export const createProjectWithOptionalFields = (): ValidProjectData => {
  return {
    ...createValidProjectData(),
    appUrl: 'https://app.example.com',
    dateLaunch: new Date('2024-01-01'),
    fundingStatus: 'Series A',
    codeRepo: 'https://github.com/example/project',
    tokenContract: '0x1234567890abcdef1234567890abcdef12345678',
    whitePaper: 'https://example.com/whitepaper.pdf',
    dappSmartContracts: [
      {
        id: 'test-contract-1',
        chain: 'ethereum',
        addresses: '0x1234567890abcdef1234567890abcdef12345678',
      },
    ],
    refs: [
      {
        key: 'whitepaper',
        value: 'https://example.com/whitepaper.pdf',
      },
      {
        key: 'documentation',
        value: 'https://docs.example.com',
      },
      {
        key: 'audit-report',
        value: 'https://example.com/audit.pdf',
      },
    ],
  };
};

export const createProjectWithoutOptionalFields = (): ValidProjectData => {
  const baseData = createValidProjectData();
  return {
    name: baseData.name,
    tagline: baseData.tagline,
    categories: baseData.categories,
    mainDescription: baseData.mainDescription,
    logoUrl: baseData.logoUrl,
    websites: baseData.websites,
    dateFounded: baseData.dateFounded,
    devStatus: baseData.devStatus,
    openSource: baseData.openSource,
    orgStructure: baseData.orgStructure,
    publicGoods: baseData.publicGoods,
    founders: baseData.founders,
    tags: baseData.tags,
    appUrl: null,
    dateLaunch: null,
    fundingStatus: null,
    codeRepo: null,
    tokenContract: null,
    whitePaper: null,
    dappSmartContracts: null,
    refs: null,
  };
};

export const createProjectWithRefsOnly = (): ValidProjectData => {
  return {
    ...createValidProjectData(),
    refs: [
      {
        key: 'github',
        value: 'https://github.com/example/repo',
      },
      {
        key: 'twitter',
        value: 'https://twitter.com/example',
      },
    ],
  };
};
