import {
  BasicsKeys,
  DatesKeys,
  OrganizationKeys,
  ProjectFormData,
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

export interface FormFieldConfig<K extends keyof ProjectFormData> {
  key: K;
  label: string;
  description?: string;
  shortDescription?: string; // For tooltip
  weight?: string;
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
  projectName: {
    key: 'projectName',
    label: 'Project Name',
    description: 'type in the name of the project to propose',
    shortDescription: 'The unique identifier for the project.',
    weight: '00',
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
    weight: '00',
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
    weight: '00',
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
  mainDescription: {
    key: 'mainDescription',
    label: 'Main Description',
    description: 'provide a longer description about this project in detail',
    shortDescription: 'A comprehensive description of the project.',
    weight: '00',
    type: 'textarea',
    placeholder: 'Type in a description',
    minRows: 4,
    showReference: true,
  },
  projectLogo: {
    key: 'projectLogo',
    label: 'Project Logo',
    description: 'provide a logo for this project',
    shortDescription: 'The visual logo of the project.',
    type: 'photo',
    showReference: true,
  },
  websiteUrl: {
    key: 'websiteUrl',
    label: 'Project Website',
    description: 'provide the main website for this project',
    shortDescription: 'The main online address of the project.',
    weight: '00',
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
    weight: '00',
    type: 'switchableUrl',
    placeholder: 'Type in a URL',
    startContentText: 'https://',
    showApplicable: true,
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
    weight: '10',
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
    weight: '10',
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
    weight: '05',
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
    weight: '05',
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
    weight: '15',
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
    weight: '15',
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
    weight: '10',
    type: 'switchableUrl',
    placeholder: '0x...',
    showApplicable: true,
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
    weight: '10',
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
    weight: '10',
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
    weight: '20',
    type: 'founderList',
    showReference: true,
  },
};

export type ApplicableField =
  | 'appUrl'
  | 'dateLaunch'
  | 'fundingStatus'
  | 'codeRepo'
  | 'tokenContract';

// Default field applicability
export const DEFAULT_FIELD_APPLICABILITY: Record<ApplicableField, boolean> = {
  appUrl: true,
  dateLaunch: true,
  fundingStatus: true,
  codeRepo: true,
  tokenContract: true,
};

// TODO delete: Default project logo, for test
const DEFAULT_PROJECT_LOGO =
  'https://pub-d00cee3ff1154a18bdf38c29db9a51c5.r2.dev/uploads/2d55d07c-1616-4cd4-b929-795751a6bc30.jpeg';

export const DEFAULT_CREATE_PROJECT_FORM_DATA: ProjectFormData = {
  projectName: '',
  tagline: '',
  categories: [],
  mainDescription: '',
  projectLogo: '',
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
};
