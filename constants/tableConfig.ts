import {
  ICategoryConfig,
  IItemCategoryEnum,
  IItemGroupEnum,
  IItemSubCategoryEnum,
} from '@/types/item';

export const ProposalTableFieldCategory: ICategoryConfig[] = [
  {
    key: IItemCategoryEnum.Basics,
    title: 'Project Overview',
    description: 'Section Description',
    subCategories: [
      {
        key: IItemSubCategoryEnum.BasicProfile,
        title: 'Basic Profile',
        description: 'These are the basic information about the project',
        items: [
          'name',
          'tagline',
          'categories',
          'mainDescription',
          'logoUrl',
          'websiteUrl',
          'appUrl',
          'tags',
          'whitePaper',
          'dateFounded',
          'dateLaunch',
        ],
        groups: [],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Technicals,
    title: 'Technicals',
    description: '',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Development,
        title: 'Development',
        description: '',
        items: ['devStatus', 'openSource', 'codeRepo', 'dappSmartContracts'],
        groups: [
          {
            key: IItemGroupEnum.CodeAudits,
            title: 'Code Audits',
            description: '',
            items: ['auditStatus', 'reports'],
          },
        ],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Organization,
    title: 'Organization & Team',
    description: '',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Organization,
        title: 'Organization',
        description: '',
        items: ['orgStructure', 'publicGoods'],
        groups: [],
      },
      {
        key: IItemSubCategoryEnum.Team,
        title: 'Team',
        description: '',
        items: ['founders'],
        groups: [],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Financial,
    title: 'Project Financials',
    description: '',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Finances,
        title: 'Finances',
        description: '',
        items: ['fundingStatus'],
        groups: [],
      },
      {
        key: IItemSubCategoryEnum.Token,
        title: 'Token',
        description: '',
        items: ['tokenContract'],
        groups: [],
      },
    ],
  },
  // {
  //   key: IItemCategoryEnum.Governance,
  //   title: 'Governance & Legal',
  //   description: '',
  //   subCategories: [
  //     {
  //       key: IItemSubCategoryEnum.Governance,
  //       title: 'Governance',
  //       description: '',
  //       items: [],
  //       groups: [],
  //     },
  //   ],
  // },
];

export const ProjectTableFieldCategory: ICategoryConfig[] = [
  {
    key: IItemCategoryEnum.Basics,
    title: 'Project Overview',
    description: 'Project Overview description',
    subCategories: [
      {
        key: IItemSubCategoryEnum.BasicProfile,
        title: 'Basic Profile',
        description: 'These are the basic information about the project',
        items: [
          'name',
          'tagline',
          'categories',
          'mainDescription',
          'logoUrl',
          'websiteUrl',
          'appUrl',
          'tags',
          'whitePaper',
          'dateFounded',
          'dateLaunch',
        ],
        itemsNotEssential: ['adoption_plan', 'launch_plan', 'roadmap'],
        groups: [],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Technicals,
    title: 'Technicals',
    description: 'Technicals description',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Development,
        title: 'Development',
        description: '',
        items: ['devStatus', 'openSource', 'codeRepo', 'dappSmartContracts'],
        itemsNotEssential: [
          'audit_status',
          'dapp_category',
          'protocol_built_on',
        ],
        groups: [
          {
            key: IItemGroupEnum.CodeAudits,
            title: 'Code Audits',
            description: '',
            items: ['audit_status', 'dapp_category', 'protocol_built_on'],
          },
        ],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Organization,
    title: 'Organization & Team',
    description: 'Organization & Team description',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Organization,
        title: 'Organization',
        description: '',
        items: ['orgStructure', 'publicGoods'],
        groups: [],
      },
      {
        key: IItemSubCategoryEnum.Team,
        title: 'Team',
        description: '',
        items: ['founders'],
        itemsNotEssential: [
          'core_team',
          'team_incentives',
          'ownership_of_project',
        ],
        groups: [],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Financial,
    title: 'Project Financials',
    description: 'description',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Finances,
        title: 'Finances',
        description: '',
        items: ['fundingStatus'],
        itemsNotEssential: [
          'project_funded_date',
          'budget_plans',
          'expense_statements',
          'runway',
          'income_and_revenue_statements',
        ],
        groups: [],
      },
      {
        key: IItemSubCategoryEnum.Token,
        title: 'Token',
        description: '',
        items: ['tokenContract'],
        itemsNotEssential: [
          'token_sales',
          'token_type',
          'token_specifications',
          'token_launch_date',
        ],
        groups: [],
      },
    ],
  },
  // {
  //   key: IItemCategoryEnum.Governance,
  //   title: 'Governance & Legal',
  //   description: '',
  //   subCategories: [
  //     {
  //       key: IItemSubCategoryEnum.Governance,
  //       title: 'Governance',
  //       description: '',
  //       items: [],
  //       groups: [],
  //     },
  //   ],
  // },
];
