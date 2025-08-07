export interface ValidProjectData {
  name: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  logoUrl: string;
  websites: Array<{
    title: string;
    url: string;
  }>;
  dateFounded: Date;
  devStatus: string;
  openSource: boolean;
  orgStructure: string;
  publicGoods: boolean;
  founders: Array<{
    name: string;
    title: string;
  }>;
  tags: string[];
  appUrl: string | null;
  dateLaunch: Date | null;
  fundingStatus: string | null;
  codeRepo: string | null;
  tokenContract: string | null;
  whitePaper: string | null;
  dappSmartContracts: Array<{
    id: string;
    chain: string;
    addresses: string;
  }> | null;
  refs: Array<{
    key: string;
    value: string;
  }> | null;
}

export const createValidProjectData = (
  overrides: Partial<ValidProjectData> = {},
): ValidProjectData => {
  const timestamp = Date.now();

  return {
    name: `Test Project ${timestamp}`,
    tagline: 'A test project for testing',
    categories: ['DeFi', 'Gaming'],
    mainDescription: 'This is a test project description',
    logoUrl: 'https://example.com/logo.png',
    websites: [
      {
        title: 'Official Website',
        url: 'https://example.com',
      },
    ],
    dateFounded: new Date('2023-01-01'),
    devStatus: 'In Development',
    openSource: true,
    orgStructure: 'DAO',
    publicGoods: true,
    founders: [
      {
        name: 'Test Founder',
        title: 'CEO',
      },
    ],
    tags: ['blockchain', 'test'],
    appUrl: null,
    dateLaunch: null,
    fundingStatus: null,
    codeRepo: null,
    tokenContract: null,
    whitePaper: null,
    dappSmartContracts: null,
    refs: [],
    ...overrides,
  };
};
