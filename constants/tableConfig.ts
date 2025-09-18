import {
  ICategoryConfig,
  IItemCategoryEnum,
  IItemGroupEnum,
  IItemSubCategoryEnum,
  IPocItemKey,
} from '@/types/item';

export const ProposalTableFieldCategory: ICategoryConfig[] = [
  {
    key: IItemCategoryEnum.Basics,
    title: 'Project Overview',
    description:
      'This section contains the basic set of information about a project',
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
          'websites',
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
  // if there's no essential items, don't show this category
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
    label: 'Project Overview',
    description:
      'This section contains the basic set of information about a project',
    subCategories: [
      {
        key: IItemSubCategoryEnum.BasicProfile,
        title: 'Basic Profile',
        label: 'Basic Profile',
        description:
          'Basic identifying information about the project, including name, status, categories, and key links',
        items: [
          'name',
          'tagline',
          'categories',
          'mainDescription',
          'logoUrl',
          'websites',
          'appUrl',
          'tags',
          'whitePaper',
          'dateFounded',
          'dateLaunch',
        ],
        itemsNotEssential: [
          'adoption_plan',
          'launch_plan',
          'social_links',
          'milestone_type',
        ],
        groups: [],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Technicals,
    title: 'Technicals',
    label: 'Technicals',
    description:
      'Key technical components of the project, including architecture, protocols, and deployment details.',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Development,
        title: 'Development',
        label: 'Development',
        description:
          'Tracks the project’s development activity, open-source contributions, and codebase evolution',
        items: ['devStatus', 'openSource', 'codeRepo', 'dappSmartContracts'],
        itemsNotEssential: [
          'audit_status',
          'dapp_category',
          'dapp_storage_stack',
          'dapp_account_management_stack',
          'dapp_logic_program_stack',
          'user_data_storage_stack',
          'unique_value_proposition',
          'protocol_built_on',
          'stack_integrations',
          'software_license',
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
    label: 'Org & Team',
    description:
      'An overview of the people and entities driving the project, from early founders to current core contributors.',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Organization,
        title: 'Organization',
        label: 'Organization',
        description: 'How the project is organized legally and operationally',
        items: ['orgStructure', 'publicGoods'],
        itemsNotEssential: [
          'affiliated_projects',
          'contributing_teams',
          'team_location',
        ],
        groups: [],
      },
      {
        key: IItemSubCategoryEnum.Team,
        title: 'Team',
        label: 'Team',
        description:
          'An overview of the people behind the project—pseudonymous or public—including their roles and contributions',
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
    label: 'Financials',
    description:
      'An overview of how the project is funded, how resources are allocated, and its current financial state.',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Finances,
        title: 'Finances',
        label: 'Finances',
        description:
          'A look at the project’s financial setup, including capital flows and long-term sustainability',
        items: ['fundingStatus'],
        itemsNotEssential: [
          'funding_received_grants',
          'project_funded_date',
          'budget_plans',
          'expense_statements',
          'runway',
        ],
        groups: [],
      },
      {
        key: IItemSubCategoryEnum.Token,
        title: 'Token',
        label: 'Token',
        description:
          'Key details about the project’s token, including its purpose, supply, and mechanics',
        items: ['tokenContract'],
        itemsNotEssential: [
          'token_sales',
          'token_type',
          'token_launch_date',
          'airdrops',
        ],
        groups: [],
      },
    ],
  },
  {
    key: IItemCategoryEnum.Governance,
    title: 'Governance & Legal',
    label: 'Gov & Legal',
    description: '',
    subCategories: [
      {
        key: IItemSubCategoryEnum.Governance,
        title: 'Governance',
        label: 'Governance',
        description: '',
        items: [],
        itemsNotEssential: [
          'physical_entity',
          'constitution',
          'on_chain_treasury_step1',
        ],
        groups: [],
      },
    ],
  },
];

export const TotalItemCount = ProjectTableFieldCategory.reduce(
  (acc, category) =>
    acc +
    category.subCategories.reduce(
      (subAcc, subCategory) =>
        subAcc +
        (subCategory.items?.length || 0) +
        (subCategory.itemsNotEssential?.length || 0),
      0,
    ),
  0,
);

export const AllItemKeysInPage: IPocItemKey[] =
  ProjectTableFieldCategory.reduce((acc, category) => {
    return acc.concat(
      category.subCategories.reduce((subAcc, subCategory) => {
        return subAcc.concat(
          subCategory.items || [],
          subCategory.itemsNotEssential || [],
        );
      }, [] as IPocItemKey[]),
    );
  }, [] as IPocItemKey[]);
