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
  appUrl?: string;
  dateLaunch?: Date;
  fundingStatus?: string;
  codeRepo?: string;
  tokenContract?: string;
  whitePaper?: string;
  dappSmartContracts?: string;
  refs?: Array<{
    key: string;
    value: string;
  }>;
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
    ...overrides,
  };
};
