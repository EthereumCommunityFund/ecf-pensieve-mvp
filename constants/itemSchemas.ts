import * as yup from 'yup';

import {
  IFounder,
  ISocialLink,
  IWebsite,
} from '@/components/pages/project/create/types';
import { NA_VALUE } from '@/constants/naSelection';
import {
  IAdvisors,
  IAffiliatedProject,
  IAuditReport,
  IContributingTeam,
  IContributors,
  IContributorsOrganization,
  IDateConstraints,
  IEndorser,
  IFundingReceivedGrants,
  IPhysicalEntity,
  IPrivateFundingRound,
  IStackIntegration,
} from '@/types/item';
import { normalizeUrl } from '@/utils/url';

// TypeScript declaration merging for custom Yup methods
declare module 'yup' {
  interface StringSchema<
    TType extends yup.Maybe<string> = string | undefined,
    TContext = yup.AnyObject,
    TDefault = undefined,
    TFlags extends yup.Flags = '',
  > {
    isContractAddressList(message?: string): this;
  }
}

yup.addMethod(
  yup.string,
  'isContractAddressList',
  function (
    message: string = 'One or more addresses are invalid. Addresses must be valid Ethereum addresses, separated by commas.',
  ) {
    return this.test({
      name: 'is-contract-address-list',
      message,
      test: function (value: string | undefined | null) {
        if (value == null || value.trim() === '') {
          return true; // handled by required validator
        }
        const addresses = value
          .split(',')
          .map((addr) => addr.trim())
          .filter((addr) => addr.length > 0);
        if (addresses.length === 0) {
          return false;
        }
        return addresses.every((addr) => /^0x[a-fA-F0-9]{40}$/.test(addr));
      },
    });
  },
);

const founderSchema: yup.ObjectSchema<IFounder> = yup.object().shape({
  name: yup.string().required('Founder name is required'),
  title: yup.string().required('Founder title is required'),
  region: yup.string().optional(),
  _id: yup.string().optional(),
});

// Create a smart founder validation schema with strict validation on submission
const smartFounderSchema = yup.object().shape({
  name: yup.string().required('Founder name is required'),
  title: yup.string().required('Founder title is required'),
  region: yup.string().optional(),
  _id: yup.string().optional(),
});

const websiteSchema: yup.ObjectSchema<IWebsite> = yup.object().shape({
  url: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Project website is required'),
  title: yup.string().required('Project website title is required'),
  _id: yup.string().optional(),
});

const socialLinkSchema: yup.ObjectSchema<ISocialLink> = yup.object().shape({
  platform: yup.string().required('Social platform is required'),
  url: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Social link URL is required'),
  _id: yup.string().optional(),
});

const physicalEntitySchema: yup.ObjectSchema<IPhysicalEntity> = yup
  .object()
  .shape({
    legalName: yup.string().required('Legal name is required'),
    country: yup.string().optional(),
    _id: yup.string().optional(),
  });

export const dateFoundedConstraints: IDateConstraints = {
  maxDate: 'today',
};
export const dateLaunchConstraints: IDateConstraints = {
  maxDate: 'today',
};

const createDateConstraintValidator = (constraints?: IDateConstraints) => {
  return function (this: yup.TestContext, value: Date | undefined) {
    if (!value || !constraints) return true;

    const today = new Date();

    if (constraints.maxDate) {
      let maxDate: Date;
      if (constraints.maxDate === 'today') {
        maxDate = today;
      } else if (constraints.maxDate === 'yesterday') {
        maxDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      } else if (constraints.maxDate === 'tomorrow') {
        maxDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else {
        maxDate =
          typeof constraints.maxDate === 'string'
            ? new Date(constraints.maxDate)
            : constraints.maxDate;
      }

      if (value > maxDate) {
        return this.createError({
          message: 'Date cannot be in the future',
        });
      }
    }

    if (constraints.relativeToToday) {
      if (constraints.relativeToToday.minDaysFromToday !== undefined) {
        const minAllowedDate = new Date(
          today.getTime() +
            constraints.relativeToToday.minDaysFromToday * 24 * 60 * 60 * 1000,
        );
        if (value < minAllowedDate) {
          return this.createError({
            message: 'Date cannot be more than 20 years ago',
          });
        }
      }
    }

    return true;
  };
};

const fundingReceivedGrantsSchema: yup.ObjectSchema<IFundingReceivedGrants> =
  yup.object().shape({
    date: yup
      .date()
      .test(
        'date-constraints',
        'Invalid date',
        createDateConstraintValidator(dateFoundedConstraints),
      )
      .required('Foundation date is required'),
    organization: yup
      .mixed<string | string[]>()
      .test(
        'organization-required',
        'organization is required',
        function (value) {
          // Accept N/A as valid value
          if (value === NA_VALUE) {
            return true;
          }
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return typeof value === 'string' && value.trim().length > 0;
        },
      )
      .test(
        'organization-limit',
        'Maximum 10 organizations allowed',
        function (value) {
          // N/A doesn't need limit check
          if (value === NA_VALUE) {
            return true;
          }
          if (Array.isArray(value)) {
            return value.length <= 10;
          }
          return true; // Single selection mode doesn't need limit
        },
      )
      .required('organization is required'),
    projectDonator: yup
      .array()
      .of(yup.string().required('Project ID is required'))
      .min(1, 'At least one project donator is required')
      .test(
        'project-donator-limit',
        'Maximum 10 project donators allowed',
        function (value) {
          if (!value || value.length === 0) return false; // Required field
          return value.length <= 10;
        },
      )
      .test(
        'valid-project-ids',
        'Invalid project IDs detected',
        function (value) {
          if (!value) return true;
          return value.every((id) => /^\d+$/.test(id)); // Validate numeric ID format
        },
      )
      .required('Project donator is required'),
    amount: yup.string().required('amount is required'),
    reference: yup
      .string()
      .transform(normalizeUrl)
      .url('Please enter a valid URL')
      .optional(),
    expenseSheetUrl: yup
      .string()
      .transform(normalizeUrl)
      .url('Please enter a valid URL')
      .optional(),
    _id: yup.string().optional(),
  });

const privateFundingRoundSchema: yup.ObjectSchema<IPrivateFundingRound> = yup
  .object()
  .shape({
    date: yup
      .date()
      .test(
        'date-constraints',
        'Invalid date',
        createDateConstraintValidator(dateFoundedConstraints),
      )
      .required('date is required'),
    amount: yup.string().required('amount is required'),
    textName: yup.string().required('name is required'),
    amountShares: yup.string().optional(),
    _id: yup.string().optional(),
  });

const affiliatedProjectsSchema: yup.ObjectSchema<IAffiliatedProject> = yup
  .object()
  .shape({
    project: yup
      .mixed<string | string[]>()
      .test('project-required', 'project is required', function (value) {
        // Accept N/A as valid value
        if (value === NA_VALUE) {
          return true;
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return typeof value === 'string' && value.trim().length > 0;
      })
      .required('project is required'),
    affiliationType: yup.string().required('Affiliation type is required'),
    description: yup.string().optional(),
    reference: yup
      .string()
      .transform(normalizeUrl)
      .url('Please enter a valid URL')
      .optional(),
    _id: yup.string().required(),
  });

const contributingTeamsSchema: yup.ObjectSchema<IContributingTeam> = yup
  .object()
  .shape({
    project: yup
      .mixed<string | string[]>()
      .test('project-required', 'project is required', function (value) {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return typeof value === 'string' && value.trim().length > 0;
      })
      .required('project is required'),
    type: yup.string().required('type is required'),
    description: yup.string().optional(),
    reference: yup
      .string()
      .transform(normalizeUrl)
      .url('Please enter a valid URL')
      .optional(),
    _id: yup.string().optional(),
  });

const contributorsSchema: yup.ObjectSchema<IContributors> = yup.object().shape({
  name: yup.string().required('name is required'),
  role: yup.string().required('role is required'),
  address: yup.string().required('address or social identifier is required'),
  _id: yup.string().optional(),
});

const endorsersSchema: yup.ObjectSchema<IEndorser> = yup.object().shape({
  name: yup.string().required('name is required'),
  socialIdentifier: yup.string().required('social identifier is required'),
  reference: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .optional(),
  _id: yup.string().optional(),
});

const contributorsOrganizationSchema: yup.ObjectSchema<IContributorsOrganization> =
  yup.object().shape({
    name: yup.string().required('name is required'),
    role: yup.string().required('role is required'),
    address: yup.string().required('address or social identifier is required'),
    _id: yup.string().optional(),
  });

const advisorsSchema: yup.ObjectSchema<IAdvisors> = yup.object().shape({
  name: yup.string().required('name is required'),
  title: yup.string().required('title is required'),
  address: yup.string().required('address is required'),
  active: yup.string().required('please select active option'),
  _id: yup.string().optional(),
});

const stackIntegrationSchema: yup.ObjectSchema<IStackIntegration> = yup
  .object()
  .shape({
    project: yup
      .mixed<string | string[]>()
      .test('project-required', 'project is required', function (value) {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return typeof value === 'string' && value.trim().length > 0;
      })
      .required('project is required'),
    type: yup.string().required('type is required'),
    description: yup.string().optional(),
    reference: yup
      .string()
      .transform(normalizeUrl)
      .url('Please enter a valid URL')
      .optional(),
    repository: yup
      .string()
      .transform(normalizeUrl)
      .url('Please enter a valid URL')
      .optional(),
    _id: yup.string().optional(),
  });

const auditReportSchema: yup.ObjectSchema<IAuditReport> = yup.object().shape({
  reportLink: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Report link is required'),
  auditorName: yup.string().required('Auditor name is required'),
  _id: yup.string().optional(),
});

export const itemValidationSchemas = {
  // Basics
  name: yup
    .string()
    .required('Project name is required')
    .max(250, 'Project name cannot exceed 250 characters'),

  tagline: yup
    .string()
    .required('Tagline is required')
    .max(250, 'Tagline cannot exceed 250 characters'),

  categories: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one category')
    .required('Categories are required'),

  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one tag')
    .required('Tags are required'),

  mainDescription: yup.string().required('Main description is required'),

  logoUrl: yup
    .string()
    .url('Invalid Logo URL')
    .required('Project logo is required'),

  websites: yup
    .array()
    .of(websiteSchema)
    .min(1, 'At least one website is required')
    .required('Project website is required'),

  social_links: yup
    .array()
    .of(socialLinkSchema)
    .test(
      'unique-platforms',
      'Each platform can only be added once',
      function (value) {
        if (!value || value.length === 0) return true;
        // Only check uniqueness for non-empty platforms
        const platforms = value
          .map((link) => link.platform)
          .filter((platform) => platform && platform.trim() !== '');

        // If no platforms are selected, skip uniqueness check
        if (platforms.length === 0) return true;

        const uniquePlatforms = new Set(platforms);
        return platforms.length === uniquePlatforms.size;
      },
    ),

  appUrl: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('App URL is required when applicable'),

  whitePaper: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Whitepaper URL is required when applicable'),

  dateFounded: yup
    .date()
    .test(
      'date-constraints',
      'Invalid date',
      createDateConstraintValidator(dateFoundedConstraints),
    )
    .required('Foundation date is required'),

  dateLaunch: yup
    .date()
    .test(
      'date-constraints',
      'Invalid date',
      createDateConstraintValidator(dateLaunchConstraints),
    )
    .required('Launch date is required when applicable'),

  adoption_plan: yup.string().required('Adoption plan is required'),

  launch_plan: yup.string().required('Launch plan is required'),

  roadmap: yup.string().required('Roadmap is required'),

  // Technicals
  devStatus: yup.string().required('Development status is required'),

  openSource: yup
    .string()
    .required('Please select whether the project is open source'),

  codeRepo: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Code repository URL is required when applicable'),

  dappSmartContracts: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required(),
        chain: yup.string().required('Chain selection is required'),
        addresses: yup
          .string()
          .required('Contract addresses are required')
          .test(
            'valid-addresses',
            'Invalid Ethereum address format',
            function (value) {
              if (!value) return false;
              const addresses = value
                .split(',')
                .map((addr) => addr.trim())
                .filter(Boolean);
              return addresses.every((addr) =>
                /^0x[a-fA-F0-9]{40}$/.test(addr),
              );
            },
          ),
      }),
    )
    .min(1, 'At least one smart contract is required')
    .required('Smart contracts are required when applicable'),

  audit_status: yup.string().required('Audit status is required'),

  // Smart Contract Audits (boolean via Yes/No select)
  // Align to Airdrops style: required string with Yes/No options at UI layer
  smart_contract_audits: yup
    .string()
    .required('Smart contract audits status is required'),

  dapp_category: yup.string().required('Dapp category is required'),

  protocol_built_on: yup.string().required('Protocol built on is required'),

  // Organization
  orgStructure: yup.string().required('Organization structure is required'),

  publicGoods: yup
    .string()
    .oneOf(['Yes', 'No', ''], 'Please select a valid option')
    .required('Please select whether the project is a public good'),

  founders: yup
    .array()
    .test('founders-validation', 'Founder validation failed', function (value) {
      if (!Array.isArray(value)) {
        return false;
      }

      let hasValidFounder = false;

      for (let i = 0; i < value.length; i++) {
        const founder = value[i] || {};
        const { name, title } = founder;
        const hasName = Boolean(name && name.trim() !== '');
        const hasTitle = Boolean(title && title.trim() !== '');

        // Check for empty rows (both fields are empty)
        if (!hasName && !hasTitle) {
          return this.createError({
            path: `founders[${i}].name`,
            message: 'Founder name is required',
          });
        }

        // Check for partially filled rows
        if (hasName && !hasTitle) {
          return this.createError({
            path: `founders[${i}].title`,
            message: 'Founder title is required',
          });
        }

        if (!hasName && hasTitle) {
          return this.createError({
            path: `founders[${i}].name`,
            message: 'Founder name is required',
          });
        }

        // If both fields have content, mark as valid
        if (hasName && hasTitle) {
          hasValidFounder = true;
        }
      }

      // Ensure at least one valid founder exists
      if (!hasValidFounder) {
        return this.createError({
          path: 'founders[0].name',
          message: 'At least one founder is required',
        });
      }

      return true;
    })
    .required('Founder information is required'),

  core_team: yup
    .array()
    .test(
      'core-team-validation',
      'Core team validation failed',
      function (value) {
        if (!Array.isArray(value)) return false;

        let hasValidMember = false;

        for (let i = 0; i < value.length; i++) {
          const member = value[i] || {};
          const { name, title } = member;
          const hasName = name && name.trim() !== '';
          const hasTitle = title && title.trim() !== '';

          // Check for empty rows (both fields are empty)
          if (!hasName && !hasTitle) {
            return this.createError({
              path: `${i}.name`,
              message: 'Founder name is required',
            });
          }

          // Check for partially filled rows
          if (hasName && !hasTitle) {
            return this.createError({
              path: `${i}.title`,
              message: 'Founder title is required',
            });
          }

          if (!hasName && hasTitle) {
            return this.createError({
              path: `${i}.name`,
              message: 'Founder name is required',
            });
          }

          // If both fields have content, mark as valid
          if (hasName && hasTitle) {
            hasValidMember = true;
          }
        }

        // Ensure at least one valid core team member exists
        if (!hasValidMember) {
          return this.createError({
            path: '0.name',
            message: 'At least one core team member is required',
          });
        }

        return true;
      },
    )
    .required('Core team information is required'),

  team_incentives: yup.string().required('Team incentives is required'),

  ownership_of_project: yup
    .string()
    .required('Ownership of project is required'),

  ownership_of_projects: yup
    .string()
    .required('Ownership of projects is required'),

  governance_structure: yup
    .string()
    .required('Governance structure is required'),

  physical_entity: yup
    .array()
    .of(physicalEntitySchema)
    .min(1, 'At least one physical entity is required')
    .required('Physical entity information is required'),

  funding_received_grants: yup
    .array()
    .of(fundingReceivedGrantsSchema)
    .min(1, 'At least one funding received(grants) is required')
    .required('Funding received(grants) information is required'),

  private_funding_rounds: yup
    .array()
    .of(privateFundingRoundSchema)
    .min(1, 'At least one private funding round is required')
    .required('Private funding rounds information is required'),

  affiliated_projects: yup
    .array()
    .of(affiliatedProjectsSchema)
    .min(1, 'At least one affiliated project is required')
    .required('Affiliated project information is required'),

  contributing_teams: yup
    .array()
    .of(contributingTeamsSchema)
    .min(1, 'At least one contributing team is required')
    .required('Contributing teams information is required'),

  contributors: yup
    .array()
    .of(contributorsSchema)
    .min(1, 'At least one contributor is required')
    .required('Contributors information is required'),

  endorsers: yup
    .array()
    .of(endorsersSchema)
    .min(1, 'At least one endorser is required')
    .required('Endorsers information is required'),

  contributors_organization: yup
    .array()
    .of(contributorsOrganizationSchema)
    .min(1, 'At least one contributor is required')
    .required('Contributors organization information is required'),

  stack_integrations: yup
    .array()
    .of(stackIntegrationSchema)
    .min(1, 'At least one stack & integration is required')
    .required('Stack & Integrations information is required'),

  audit_report: yup
    .array()
    .of(auditReportSchema)
    .min(1, 'At least one audit report is required')
    .required('Audit report information is required'),

  // Financial
  fundingStatus: yup
    .string()
    .required('Funding status is required when applicable'),

  tokenContract: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .required('Token contract address is required when applicable'),

  project_funded_date: yup.date().required('Project funded date is required'),

  budget_plans: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Budget plans URL is required'),

  expense_statements: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Expense statements URL is required'),

  runway: yup.string().required('Runway is required'),

  income_and_revenue_statements: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one income/revenue statement is required')
    .required('Income and revenue statements are required'),

  token_sales: yup.string().required('Token sales status is required'),

  token_type: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one token type')
    .required('Token type is required'),

  token_issuance_mechanism: yup
    .string()
    .required('Token issuance mechanism is required'),

  token_launch_date: yup.date().required('Token launch date is required'),

  total: yup.string().required('Total investment is required'),

  treasury_vault_address: yup
    .string()
    .matches(
      /^(0x[a-fA-F0-9]{40}|N\/A)$/,
      'Invalid format. Use Ethereum address or N/A',
    )
    .required('Treasury vault address is required when applicable'),

  treasury_mechanism: yup.string().required('Treasury mechanism is required'),

  constitution: yup.string().required('Constitution is required'),

  milestone_type: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one milestone type')
    .required('Milestone type is required'),

  software_license: yup.string().required('Software license is required'),

  airdrops: yup.string().required('Airdrop status is required'),

  team_location: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one team location')
    .required('Team location is required'),

  token_benefits: yup.string().required('Token benefits are required'),

  token_risks: yup.string().required('Token risks are required'),

  token_rights: yup.string().required('Token rights are required'),

  token_obligations: yup.string().required('Token obligations are required'),

  dapp_storage_stack: yup
    .string()
    .required('Dapp storage stack information is required'),

  dapp_account_management_stack: yup
    .string()
    .required('Dapp account management stack information is required'),

  dapp_logic_program_stack: yup
    .string()
    .required('Dapp logic/program stack information is required'),

  user_data_storage_stack: yup
    .string()
    .required('User data storage stack information is required'),

  unique_value_proposition: yup
    .string()
    .required('Unique value proposition is required'),

  previous_funding_rounds: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Previous funding rounds URL is required'),

  vault_multi_sig_holder_addresses_step2: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Vault multi-sig holder reference is required'),

  on_chain_treasury_step1: yup
    .string()
    .oneOf(['Yes', 'No'], 'Select whether an on-chain treasury exists')
    .required('On-chain treasury status is required'),

  token_utility: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one token utility')
    .required('Token utility is required'),

  blockchain_explorer: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Blockchain explorer URL is required'),

  financial_status: yup.string().required('Financial status is required'),

  income_revenue: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Income or revenue statement URL is required'),

  advisors: yup
    .array()
    .of(advisorsSchema)
    .min(1, 'At least one advisor is required')
    .required('advisor information is required'),
};

export { founderSchema, smartFounderSchema };
