import { createValidProjectData, ValidProjectData } from './projectFactory';

export const createInvalidProjectData = {
  emptyName: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    name: '',
  }),

  emptyTagline: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    tagline: '',
  }),

  emptyCategories: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    categories: [],
  }),

  emptyMainDescription: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    mainDescription: '',
  }),

  emptyLogoUrl: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    logoUrl: '',
  }),

  emptyWebsites: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    websites: [],
  }),

  websiteWithEmptyTitle: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    websites: [
      {
        title: '',
        url: 'https://example.com',
      },
    ],
  }),

  websiteWithEmptyUrl: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    websites: [
      {
        title: 'Test Website',
        url: '',
      },
    ],
  }),

  emptyDevStatus: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    devStatus: '',
  }),

  emptyOrgStructure: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    orgStructure: '',
  }),

  emptyFounders: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    founders: [],
  }),

  founderWithEmptyName: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    founders: [
      {
        name: '',
        title: 'CEO',
      },
    ],
  }),

  founderWithEmptyTitle: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    founders: [
      {
        name: 'Test Founder',
        title: '',
      },
    ],
  }),

  emptyTags: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    tags: [],
  }),

  refsWithEmptyKey: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    refs: [
      {
        key: '',
        value: 'https://example.com',
      },
    ],
  }),

  refsWithEmptyValue: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    refs: [
      {
        key: 'whitepaper',
        value: '',
      },
    ],
  }),

  specialCharactersInName: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    name: '<script>alert("xss")</script>',
  }),

  sqlInjectionInName: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    name: "'; DROP TABLE projects; --",
  }),

  unicodeCharacters: (): Partial<ValidProjectData> => ({
    ...createValidProjectData(),
    name: '🚀💎 Test Project 中文名称 العربية русский',
  }),

  nullValues: (): any => ({
    name: null,
    tagline: null,
    categories: null,
    mainDescription: null,
    logoUrl: null,
    websites: null,
    dateFounded: null,
    devStatus: null,
    openSource: null,
    orgStructure: null,
    publicGoods: null,
    founders: null,
    tags: null,
  }),

  undefinedValues: (): any => ({
    name: undefined,
    tagline: undefined,
    categories: undefined,
    mainDescription: undefined,
    logoUrl: undefined,
    websites: undefined,
    dateFounded: undefined,
    devStatus: undefined,
    openSource: undefined,
    orgStructure: undefined,
    publicGoods: undefined,
    founders: undefined,
    tags: undefined,
  }),
};
