import * as yup from 'yup';

import { FounderInput, ProjectFormData } from './types'; // 确保路径正确

// 定义文件大小限制 (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
// 定义支持的文件类型
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];

const founderSchema: yup.ObjectSchema<FounderInput> = yup.object().shape({
  fullName: yup.string().required('创始人姓名不能为空'),
  titleRole: yup.string().required('创始人职位/角色不能为空'),
});

export const basicsSchema = yup.object().shape({
  projectName: yup
    .string()
    .required('项目名称不能为空')
    .max(250, '项目名称不能超过 250 个字符'),
  tagline: yup
    .string()
    .required('标语不能为空')
    .max(250, '标语不能超过 250 个字符'),
  categories: yup
    .array()
    .of(yup.string().required())
    .min(1, '至少选择或输入一个类别')
    .required('类别不能为空'),
  mainDescription: yup
    .string()
    .required('主要描述不能为空')
    .max(250, '主要描述不能超过 250 个字符'),
  projectLogo: yup
    .string()
    .url('无效的 Logo URL') // 基本 URL 验证
    .nullable()
    .optional(), // Logo 是可选的
  websiteUrl: yup.string().url('请输入有效的 URL').required('项目网站不能为空'),
  isAppUrlApplicable: yup.boolean().required(),
  appUrl: yup
    .string()
    .url('请输入有效的 URL')
    .nullable()
    .when('isAppUrlApplicable', {
      is: true,
      then: (schema) => schema.required('应用 URL 不能为空'),
      otherwise: (schema) => schema.optional(), // 已经是 nullable
    }),
  // logoUrlPreview 不需要验证
});

// 步骤 2: Dates & Statuses
export const datesSchema = yup.object().shape({
  dateFounded: yup
    .date()
    .required('成立日期不能为空')
    .max(new Date(), '成立日期不能晚于今天')
    .nullable(), // 使用 nullable 因为 DatePicker 可能返回 null
  isLaunchDateApplicable: yup.boolean().required(),
  dateLaunch: yup
    .date()
    .nullable()
    .when('isLaunchDateApplicable', {
      is: true,
      then: (schema) => schema.required('产品发布日期不能为空'),
      otherwise: (schema) => schema.optional(),
    }),
  devStatus: yup
    .string()
    .oneOf(
      ['Live', 'In Development', 'Discontinued', 'Stealth'],
      '无效的开发状态',
    )
    .required('开发状态不能为空'),
  isFundingStatusApplicable: yup.boolean().required(),
  fundingStatus: yup
    .string()
    .nullable()
    .oneOf(['Funded', 'VC Invested', 'No Funding', null], '无效的融资状态') // 包含 null
    .when('isFundingStatusApplicable', {
      is: true,
      then: (schema) => schema.required('融资状态不能为空'),
      otherwise: (schema) => schema.optional(),
    }),
});

// 步骤 3: Technicals
export const technicalsSchema = yup.object().shape({
  openSource: yup
    .string()
    .oneOf(['Yes', 'No'], '请选择是否开源')
    .required('请选择是否开源'),
  isCodeRepoApplicable: yup.boolean().required(),
  codeRepo: yup
    .string()
    .url('请输入有效的 URL')
    .nullable()
    .when('isCodeRepoApplicable', {
      is: true,
      then: (schema) => schema.required('代码仓库 URL 不能为空'),
      otherwise: (schema) => schema.optional(),
    }),
  isTokenContractApplicable: yup.boolean().required(),
  tokenContract: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, '无效的以太坊地址格式')
    .nullable()
    .when('isTokenContractApplicable', {
      is: true,
      then: (schema) => schema.required('Token 合约地址不能为空'),
      otherwise: (schema) => schema.optional(),
    }),
});

// 步骤 4: Organization
export const organizationSchema = yup.object().shape({
  orgStructure: yup
    .string()
    .oneOf(['Centralized', 'DAO', 'Decentralized'], '无效的组织结构')
    .required('组织结构不能为空'),
  publicGoods: yup
    .string()
    .oneOf(['Yes', 'No'], '请选择是否属于公共物品')
    .required('请选择是否属于公共物品'),
  founders: yup
    .array()
    .of(founderSchema)
    .min(1, '至少需要一位创始人信息')
    .required('创始人信息不能为空'),
});

// 组合所有步骤的 Schema
export const projectSchema: yup.ObjectSchema<ProjectFormData> = yup
  .object()
  .shape({
    // Basics
    projectName: basicsSchema.fields.projectName,
    tagline: basicsSchema.fields.tagline,
    categories: basicsSchema.fields.categories,
    mainDescription: basicsSchema.fields.mainDescription,
    projectLogo: basicsSchema.fields.projectLogo,
    websiteUrl: basicsSchema.fields.websiteUrl,
    isAppUrlApplicable: basicsSchema.fields.isAppUrlApplicable,
    appUrl: basicsSchema.fields.appUrl,

    // Dates & Statuses
    dateFounded: datesSchema.fields.dateFounded,
    isLaunchDateApplicable: datesSchema.fields.isLaunchDateApplicable,
    dateLaunch: datesSchema.fields.dateLaunch,
    devStatus: datesSchema.fields.devStatus,
    isFundingStatusApplicable: datesSchema.fields.isFundingStatusApplicable,
    fundingStatus: datesSchema.fields.fundingStatus,

    // Technicals
    openSource: technicalsSchema.fields.openSource,
    isCodeRepoApplicable: technicalsSchema.fields.isCodeRepoApplicable,
    codeRepo: technicalsSchema.fields.codeRepo,
    isTokenContractApplicable:
      technicalsSchema.fields.isTokenContractApplicable,
    tokenContract: technicalsSchema.fields.tokenContract,

    // Organization
    orgStructure: organizationSchema.fields.orgStructure,
    publicGoods: organizationSchema.fields.publicGoods,
    founders: organizationSchema.fields.founders,

    // logoUrlPreview is not part of validation schema
  })
  .defined(); // Use .defined() to ensure the object itself is not undefined
