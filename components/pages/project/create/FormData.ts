import { ESSENTIAL_ITEM_MAP } from '@/lib/constants';
import { IProject } from '@/types';

import {
  BasicsKeys,
  CreateProjectStep,
  DatesKeys,
  EssentialItemKeys,
  IFormTypeEnum,
  OrganizationKeys,
  ProjectFormData,
  ProjectStepFieldsMap,
  ReferenceData,
  TechnicalsKeys,
} from './types';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'selectMultiple'
  | 'photo'
  | 'url'
  | 'switchableUrl'
  | 'date'
  | 'switchableDate'
  | 'select'
  | 'radio'
  | 'founderList';

export type ApplicableField =
  | 'appUrl'
  | 'dateLaunch'
  | 'fundingStatus'
  | 'codeRepo'
  | 'tokenContract';

export const DEFAULT_FIELD_APPLICABILITY: Record<ApplicableField, boolean> = {
  appUrl: true,
  dateLaunch: true,
  fundingStatus: true,
  codeRepo: true,
  tokenContract: true,
};

export const CreateProjectStepFields: ProjectStepFieldsMap = {
  [CreateProjectStep.Basics]: {
    name: true,
    tagline: true,
    categories: true,
    mainDescription: true,
    logoUrl: true,
    websiteUrl: true,
    appUrl: true,
    tags: true,
    whitePaper: true,
  },
  [CreateProjectStep.Dates]: {
    dateFounded: true,
    dateLaunch: true,
    devStatus: true,
    fundingStatus: true,
  },
  [CreateProjectStep.Technicals]: {
    openSource: true,
    codeRepo: true,
    tokenContract: true,
    dappSmartContracts: true,
  },
  [CreateProjectStep.Organization]: {
    orgStructure: true,
    publicGoods: true,
    founders: true,
  },
};

export const getCreateProjectStepFields = <T extends CreateProjectStep>(
  step: T,
): string[] => {
  return Object.keys(CreateProjectStepFields[step]);
};

export interface FormFieldConfig<K extends EssentialItemKeys> {
  key: K;
  label: string;
  description?: string;
  shortDescription?: string; // For tooltip
  weight?: string | number;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select, radio
  presetCategories?: string[]; // Specific for categories
  showApplicable?: boolean; // Whether the applicable switch should be shown
  showReference?: boolean; // Whether the reference button should be shown
  startContentText?: string; // For URL inputs
  minRows?: number; // For Textarea
  // Add other field-specific configurations here if needed
}

export const basicsFieldsConfig: {
  [K in BasicsKeys]: FormFieldConfig<K>;
} = {
  name: {
    key: 'name',
    label: 'Project Name',
    description: 'type in the name of the project to propose',
    shortDescription: 'The unique identifier for the project.',
    weight: ESSENTIAL_ITEM_MAP.name.weight,
    type: 'text',
    placeholder: 'Type in a name',
    showReference: true,
  },
  tagline: {
    key: 'tagline',
    label: 'Tagline',
    description:
      'provide a simple short description about this project to display on its card',
    shortDescription: 'A simple and catchy slogan for the project.',
    weight: ESSENTIAL_ITEM_MAP.tagline.weight,
    type: 'text',
    placeholder: 'Type in a tagline',
    showReference: true,
  },
  categories: {
    key: 'categories',
    label: 'Categories',
    description:
      'provide a simple short description about this project to display on its card',
    shortDescription: 'Categorize the project into relevant categories.',
    weight: ESSENTIAL_ITEM_MAP.categories.weight,
    type: 'selectMultiple',
    placeholder: 'Select categories',
    presetCategories: [
      'Development',
      'Design',
      'Community',
      'Finance',
      'Governance',
      'Data',
    ],
    showReference: true,
  },
  tags: {
    key: 'tags',
    label: 'Tags',
    description: 'provide a list of tags for this project',
    shortDescription: 'A list of tags for the project.',
    weight: ESSENTIAL_ITEM_MAP.tags.weight,
    type: 'selectMultiple',
    placeholder: 'Select tags',
    showReference: true,
    options: [
      { value: 'd/acc', label: 'd/acc' },
      { value: 'Ethereum', label: 'Ethereum' },
      { value: 'Solana', label: 'Solana' },
      { value: 'Polygon', label: 'Polygon' },
      { value: 'Polkadot', label: 'Polkadot' },
      { value: 'Optimism', label: 'Optimism' },
      { value: 'Arbitrum', label: 'Arbitrum' },
      { value: 'ZK Rollup', label: 'ZK Rollup' },
      { value: 'IPFS', label: 'IPFS' },
      { value: 'DID', label: 'DID' },
      { value: 'Wallet', label: 'Wallet' },
      { value: 'ZK', label: 'ZK' },
      { value: 'Privacy', label: 'Privacy' },
      { value: 'Layer 1', label: 'Layer 1' },
      { value: 'Layer 2', label: 'Layer 2' },
      { value: 'AI Integration', label: 'AI Integration' },
      { value: 'Interoperability', label: 'Interoperability' },
      { value: 'Decentralised Storage', label: 'Decentralised Storage' },
      { value: 'Governance', label: 'Governance' },
      { value: 'Funding', label: 'Funding' },
      { value: 'Social', label: 'Social' },
      { value: 'GameFi', label: 'GameFi' },
      { value: 'DeFi', label: 'DeFi' },
      { value: 'NFT', label: 'NFT' },
      { value: 'Education', label: 'Education' },
      { value: 'Open-source', label: 'Open-source' },
      { value: 'Public goods', label: 'Public goods' },
    ],
  },
  mainDescription: {
    key: 'mainDescription',
    label: 'Main Description',
    description: 'provide a longer description about this project in detail',
    shortDescription: 'A comprehensive description of the project.',
    weight: ESSENTIAL_ITEM_MAP.mainDescription.weight,
    type: 'textarea',
    placeholder: 'Type in a description',
    minRows: 4,
    showReference: true,
  },
  logoUrl: {
    key: 'logoUrl',
    label: 'Project Logo',
    description: 'provide a logo for this project',
    shortDescription: 'The visual logo of the project.',
    weight: ESSENTIAL_ITEM_MAP.logoUrl.weight,
    type: 'photo',
    showReference: true,
  },
  websiteUrl: {
    key: 'websiteUrl',
    label: 'Project Website',
    description: 'provide the main website for this project',
    shortDescription: 'The main online address of the project.',
    weight: ESSENTIAL_ITEM_MAP.websiteUrl.weight,
    type: 'url',
    placeholder: 'Type in a URL',
    startContentText: 'https://',
    showReference: true,
  },
  appUrl: {
    key: 'appUrl',
    label: 'App URL',
    description: 'provide the main application URL for this project',
    shortDescription:
      'The direct link to the project application (if different from the website).',
    weight: ESSENTIAL_ITEM_MAP.appUrl.weight,
    type: 'switchableUrl',
    placeholder: 'Type in a URL',
    startContentText: 'https://',
    showApplicable: true,
    showReference: true,
  },
  whitePaper: {
    key: 'whitePaper',
    label: 'White Paper',
    description: 'provide the white paper for this project',
    shortDescription: 'The white paper of the project.',
    weight: ESSENTIAL_ITEM_MAP.whitePaper.weight,
    type: 'switchableUrl',
    placeholder: 'Type in a URL',
    startContentText: 'https://',
    showReference: true,
  },
};

export const datesFieldsConfig: {
  [K in DatesKeys]: FormFieldConfig<K>;
} = {
  dateFounded: {
    key: 'dateFounded',
    label: 'Date Founded',
    description: 'Select the date at which the project was founded.',
    shortDescription: 'The date when the project officially began.',
    weight: ESSENTIAL_ITEM_MAP.dateFounded.weight,
    type: 'date',
    placeholder: 'Select date',
    showReference: true,
  },
  dateLaunch: {
    key: 'dateLaunch',
    label: 'Product Launch Date',
    description:
      'Select the date when the main product or service was launched (if applicable).',
    shortDescription:
      'The date when the product was first released to the public.',
    weight: ESSENTIAL_ITEM_MAP.dateLaunch.weight,
    type: 'switchableDate',
    placeholder: 'Select date',
    showApplicable: true,
    showReference: true,
  },
  devStatus: {
    key: 'devStatus',
    label: 'Development Status',
    description: 'Select the current status of their development',
    shortDescription: 'The most recent development status of the project.',
    weight: ESSENTIAL_ITEM_MAP.devStatus.weight,
    type: 'select',
    placeholder: 'Select status',
    options: [
      { value: 'Idea/Whitepaper', label: 'Idea/Whitepaper' },
      { value: 'Prototype', label: 'Prototype' },
      { value: 'In Development', label: 'In Development' },
      { value: 'Alpha', label: 'Alpha' },
      { value: 'Beta', label: 'Beta' },
      { value: 'Live', label: 'Live (working product)' },
      { value: 'Broken/Abandoned', label: 'Broken / Abandoned' },
      { value: 'Concept', label: 'Concept' },
      { value: 'Stealth', label: 'Stealth' },
    ],
    showReference: true,
  },
  fundingStatus: {
    key: 'fundingStatus',
    label: 'Funding Status',
    description: 'Select the current status of their funding phase',
    shortDescription: 'The sources and status of project funding.',
    weight: ESSENTIAL_ITEM_MAP.fundingStatus.weight,
    type: 'select',
    placeholder: 'Select funding status',
    showApplicable: true,
    options: [
      { value: 'Funded', label: 'Funded' },
      { value: 'VC Invested', label: 'VC Invested' },
      { value: 'No Funding', label: 'No Funding' },
    ],
    showReference: true,
  },
};

export const technicalsFieldsConfig: {
  [K in TechnicalsKeys]: FormFieldConfig<K>;
} = {
  openSource: {
    key: 'openSource',
    label: 'Open-Source?',
    description: 'Is this project now open-source?',
    shortDescription: 'Whether the project follows an open-source model.',
    placeholder: 'Select open-source status',
    weight: ESSENTIAL_ITEM_MAP.openSource.weight,
    type: 'radio',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
    ],
    showReference: true,
  },
  codeRepo: {
    key: 'codeRepo',
    label: 'Code Repository',
    description: 'Provide a URL to their repository',
    shortDescription: 'The repository link hosting the project source code.',
    weight: ESSENTIAL_ITEM_MAP.codeRepo.weight,
    type: 'switchableUrl',
    placeholder: 'https://github.com/your-org/repo',
    startContentText: 'https://',
    showApplicable: true,
    showReference: true,
  },
  tokenContract: {
    key: 'tokenContract',
    label: 'Token Contract',
    description: 'Input the projects token contract address',
    shortDescription:
      'The contract address of the project token on the blockchain.',
    weight: ESSENTIAL_ITEM_MAP.tokenContract.weight,
    type: 'switchableUrl',
    placeholder: '0x...',
    showApplicable: true,
    showReference: true,
  },
  dappSmartContracts: {
    key: 'dappSmartContracts',
    label: 'Dapp Smart Contracts',
    description: 'Input the projects smart contracts',
    shortDescription: 'The smart contracts of the project.',
    weight: ESSENTIAL_ITEM_MAP.dappSmartContracts.weight,
    type: 'switchableUrl',
    placeholder: '0x...',
    showReference: true,
  },
};

export const organizationFieldsConfig: {
  [K in OrganizationKeys]: FormFieldConfig<K>;
} = {
  orgStructure: {
    key: 'orgStructure',
    label: 'Organization Structure',
    description: 'With what structure does this project operate?',
    shortDescription: 'The organizational and governance model of the project.',
    weight: ESSENTIAL_ITEM_MAP.orgStructure.weight,
    type: 'select',
    placeholder: 'Select structure',
    options: [
      { value: 'Centralized', label: 'Centralized' },
      { value: 'DAO', label: 'DAO' },
      { value: 'Decentralized', label: 'Decentralized' },
    ],
    showReference: true,
  },
  publicGoods: {
    key: 'publicGoods',
    label: 'Public-Goods Nature',
    description: 'Is this project a public good?',
    shortDescription: 'Whether the project contributes to the public domain.',
    weight: ESSENTIAL_ITEM_MAP.publicGoods.weight,
    placeholder: 'Select public goods',
    type: 'radio',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
    ],
    showReference: true,
  },
  founders: {
    key: 'founders',
    label: 'Founders',
    description:
      'Provide the founders of this project (minimum of 1 founder is required)',
    shortDescription: 'The list of founding team members of the project.',
    weight: ESSENTIAL_ITEM_MAP.founders.weight,
    type: 'founderList',
    showReference: true,
  },
};

export const DEFAULT_CREATE_PROJECT_FORM_DATA: ProjectFormData = {
  name: '',
  tagline: '',
  categories: [],
  mainDescription: '',
  logoUrl: '',
  websiteUrl: '',
  appUrl: null,
  dateFounded: null,
  dateLaunch: null,
  devStatus: '',
  fundingStatus: null,
  openSource: '',
  codeRepo: null,
  tokenContract: null,
  orgStructure: '',
  publicGoods: '',
  founders: [{ fullName: '', titleRole: '' }],
  tags: [],
  whitePaper: '',
  dappSmartContracts: '',
};

export const convertProjectToFormData = (
  project: IProject,
): ProjectFormData => {
  return {
    name: project.name,
    tagline: project.tagline,
    categories: project.categories,
    mainDescription: project.mainDescription,
    logoUrl: project.logoUrl,
    websiteUrl: project.websiteUrl,
    appUrl: project.appUrl || null,
    tags: project.tags,
    whitePaper: project.whitePaper,
    dappSmartContracts: project.dappSmartContracts,
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
      fullName: founder.name,
      titleRole: founder.title,
    })),
  };
};

export const convertProjectRefsToReferenceData = (
  project: IProject,
): ReferenceData[] => {
  if (!project.refs || !Array.isArray(project.refs)) {
    return [];
  }

  return project.refs.map((ref: any) => ({
    key: ref.key,
    ref: ref.value,
    value: ref.value,
  }));
};

const isLocalDev = process.env.NODE_ENV !== 'production';
const isAutoFillForm = process.env.NEXT_PUBLIC_AUTO_FILL_FORM === 'true';

export const updateFormWithProjectData = (
  formType: IFormTypeEnum,
  projectData: IProject | undefined,
  setValue: (name: keyof ProjectFormData, value: any) => void,
  setReferences?: (refs: ReferenceData[]) => void,
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
        setValue(key as keyof ProjectFormData, value as any);
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
