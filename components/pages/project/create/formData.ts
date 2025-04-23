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
    label: '项目名称',
    description: '为要提议的项目输入名称',
    shortDescription: '项目的唯一标识符。',
    weight: '00',
    type: 'text',
    placeholder: '输入名称',
    showReference: true,
  },
  tagline: {
    key: 'tagline',
    label: '标语',
    description: '提供关于此项目的简短描述，显示在其卡片上',
    shortDescription: '项目的简明扼要的口号或描述。',
    weight: '00',
    type: 'text',
    placeholder: '输入简短描述',
    showReference: true,
  },
  categories: {
    key: 'categories',
    label: '类别',
    description: '选择项目类别',
    shortDescription: '将项目归入相关类别。',
    weight: '00',
    type: 'selectMultiple',
    placeholder: '选择或输入类别...',
    presetCategories: ['开发', '设计', '社区', '金融', '治理', '数据'],
    showReference: true,
  },
  mainDescription: {
    key: 'mainDescription',
    label: '主要描述',
    description: '提供关于此项目的详细长描述',
    shortDescription: '项目的全面描述。',
    weight: '00',
    type: 'textarea',
    placeholder: '输入描述',
    minRows: 4,
    showReference: true,
  },
  projectLogo: {
    key: 'projectLogo',
    label: '项目 Logo',
    description: '建议 1:1 比例。支持格式：JPG、PNG、GIF（最大 2MB）',
    shortDescription: '项目的视觉标志。',
    type: 'photo',
    showReference: true,
  },
  websiteUrl: {
    key: 'websiteUrl',
    label: '项目网站',
    description: '提供此项目的主要网站',
    shortDescription: '项目的主要在线地址。',
    weight: '00',
    type: 'url',
    placeholder: '输入 URL',
    startContentText: 'https://',
    showReference: true,
  },
  appUrl: {
    key: 'appUrl',
    label: '应用 URL',
    description: '提供此项目的主要应用程序 URL (如果适用)',
    shortDescription: '项目应用程序的直接链接（如果不同于网站）。',
    weight: '00',
    type: 'switchableUrl',
    placeholder: '输入 URL',
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
    label: '成立日期',
    description: '选择项目成立的日期。',
    shortDescription: '项目正式开始的日期。',
    weight: '10',
    type: 'date',
    placeholder: '选择日期',
    showReference: true,
  },
  dateLaunch: {
    key: 'dateLaunch',
    label: '产品发布日期',
    description: '选择主要产品或服务发布的日期（如果适用）。',
    shortDescription: '产品首次向公众发布的日期。',
    weight: '10',
    type: 'switchableDate',
    placeholder: '选择日期',
    showApplicable: true,
    showReference: true,
  },
  devStatus: {
    key: 'devStatus',
    label: '开发状态',
    description: '项目当前的开发阶段。',
    shortDescription: '项目的最新开发进展状态。',
    weight: '05',
    type: 'select',
    placeholder: '选择开发状态',
    options: [
      { value: 'Live', label: '已上线' },
      { value: 'In Development', label: '开发中' },
      { value: 'Discontinued', label: '已停止' },
      { value: 'Stealth', label: '隐身模式' },
    ],
    showReference: true,
  },
  fundingStatus: {
    key: 'fundingStatus',
    label: '融资状态',
    description: '项目的当前融资情况（如果适用）。',
    shortDescription: '项目的资金来源和状态。',
    weight: '05',
    type: 'select',
    placeholder: '选择融资状态',
    showApplicable: true,
    options: [
      { value: 'Funded', label: '已获得资金' },
      { value: 'VC Invested', label: 'VC 投资' },
      { value: 'No Funding', label: '无资金' },
    ],
    showReference: true,
  },
};

export const technicalsFieldsConfig: {
  [K in TechnicalsKeys]: FormFieldConfig<K>;
} = {
  openSource: {
    key: 'openSource',
    label: '开源',
    description: '项目代码是否根据开源许可证发布。',
    shortDescription: '项目是否采用开源模式。',
    weight: '15',
    type: 'radio',
    options: [
      { value: 'Yes', label: '是' },
      { value: 'No', label: '否' },
    ],
    showReference: true,
  },
  codeRepo: {
    key: 'codeRepo',
    label: '代码仓库 URL',
    description: '项目主要代码仓库的链接（如果开源）。',
    shortDescription: '托管项目源代码的仓库链接。',
    weight: '15',
    type: 'switchableUrl',
    placeholder: 'https://github.com/your-org/repo',
    showApplicable: true,
    showReference: true,
  },
  tokenContract: {
    key: 'tokenContract',
    label: 'Token 合约地址',
    description: '项目主要代币合约的地址（如果适用）。',
    shortDescription: '项目代币在区块链上的合约地址。',
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
    label: '组织结构',
    description: '项目运行所依据的治理和运营结构。',
    shortDescription: '项目的组织和治理模型。',
    weight: '10',
    type: 'select',
    placeholder: '选择组织结构',
    options: [
      { value: 'Centralized', label: '中心化' },
      { value: 'DAO', label: 'DAO' },
      { value: 'Decentralized', label: '去中心化' },
    ],
    showReference: true,
  },
  publicGoods: {
    key: 'publicGoods',
    label: '公共物品',
    description: '项目是否旨在创造或支持公共物品。',
    shortDescription: '项目是否贡献于公共领域。',
    weight: '10',
    type: 'radio',
    options: [
      { value: 'Yes', label: '是' },
      { value: 'No', label: '否' },
    ],
    showReference: true,
  },
  founders: {
    key: 'founders',
    label: '创始人',
    description: '项目的核心创始人和团队成员信息。',
    shortDescription: '项目的创始团队成员列表。',
    weight: '20',
    type: 'founderList',
    showReference: true,
  },
};
