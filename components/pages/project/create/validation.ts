import * as yup from 'yup';

import { ApplicableField, FounderInput, ProjectFormData } from './types';

// Rename ValidationContext for clarity
export type FieldApplicabilityContext = Record<ApplicableField, boolean>;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];

const founderSchema: yup.ObjectSchema<FounderInput> = yup.object().shape({
  fullName: yup.string().required('Founder name is required'),
  titleRole: yup.string().required('Founder title/role is required'),
});

export const basicsSchema = yup.object().shape({
  projectName: yup
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
  mainDescription: yup
    .string()
    .required('Main description is required')
    .max(250, 'Main description cannot exceed 250 characters'),
  projectLogo: yup
    .string()
    .url('Invalid Logo URL') // Basic URL validation
    .nullable()
    .optional(), // Logo is optional
  websiteUrl: yup
    .string()
    .url('Please enter a valid URL')
    .required('Project website is required'),
  appUrl: yup
    .string()
    .url('Please enter a valid URL')
    .nullable()
    .test('appUrlRequired', 'App URL is required', function (value) {
      // Use renamed context type
      const context = this.options.context as
        | FieldApplicabilityContext
        | undefined;
      // Logic remains: check if applicability is set to false (meaning required)
      if (!context?.appUrl && !value) {
        return false;
      }
      return true;
    }),
});

// Step 2: Dates & Statuses
export const datesSchema = yup.object().shape({
  dateFounded: yup
    .date()
    .required('Foundation date is required')
    .max(new Date(), 'Foundation date cannot be later than today')
    .nullable(), // Using nullable because DatePicker might return null
  dateLaunch: yup
    .date()
    .nullable()
    .test('dateLaunchRequired', 'Launch date is required', function (value) {
      // Use renamed context type
      const context = this.options.context as
        | FieldApplicabilityContext
        | undefined;
      if (!context?.dateLaunch && !value) {
        return false;
      }
      return true;
    }),
  devStatus: yup.string().required('Development status is required'),
  fundingStatus: yup
    .string()
    .nullable()
    .test(
      'fundingStatusRequired',
      'Funding status is required',
      function (value) {
        const context = this.options.context as
          | FieldApplicabilityContext
          | undefined;
        if (!context?.fundingStatus && value === null) {
          return this.createError({
            message: 'Funding status is required',
            path: this.path,
          });
        }
        return true;
      },
    ),
});

// Step 3: Technicals
export const technicalsSchema = yup.object().shape({
  openSource: yup
    .string()
    .required('Please select whether the project is open source'),
  codeRepo: yup
    .string()
    .url('Please enter a valid URL')
    .nullable()
    .test(
      'codeRepoRequired',
      'Code repository URL is required',
      function (value) {
        // Use renamed context type
        const context = this.options.context as
          | FieldApplicabilityContext
          | undefined;
        if (!context?.codeRepo && !value) {
          return false;
        }
        return true;
      },
    ),
  tokenContract: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .nullable()
    .test(
      'tokenContractRequired',
      'Token contract address is required',
      function (value) {
        // Use renamed context type
        const context = this.options.context as
          | FieldApplicabilityContext
          | undefined;
        if (!context?.tokenContract && !value) {
          return false;
        }
        return true;
      },
    ),
});

// Step 4: Organization
export const organizationSchema = yup.object().shape({
  orgStructure: yup
    .string()
    .oneOf(
      ['Centralized', 'DAO', 'Decentralized'],
      'Invalid organization structure',
    )
    .required('Organization structure is required'),
  publicGoods: yup
    .string()
    .required('Please select whether the project is a public good'),
  founders: yup
    .array()
    .of(founderSchema)
    .min(1, 'At least one founder is required')
    .required('Founder information is required'),
});
// Combine all step schemas
// Explicitly type the final schema object and use type assertion
export const projectSchema = yup
  .object()
  .shape({
    /**
     * Basics
     */
    projectName: basicsSchema.fields.projectName,
    tagline: basicsSchema.fields.tagline,
    categories: basicsSchema.fields.categories,
    mainDescription: basicsSchema.fields.mainDescription,
    projectLogo: basicsSchema.fields.projectLogo,
    websiteUrl: basicsSchema.fields.websiteUrl,
    appUrl: basicsSchema.fields.appUrl,

    /**
     * Dates & Statuses
     */
    dateFounded: datesSchema.fields.dateFounded,
    dateLaunch: datesSchema.fields.dateLaunch,
    devStatus: datesSchema.fields.devStatus,
    fundingStatus: datesSchema.fields.fundingStatus,

    /**
     * Technicals
     */
    openSource: technicalsSchema.fields.openSource,
    codeRepo: technicalsSchema.fields.codeRepo,
    tokenContract: technicalsSchema.fields.tokenContract,

    /**
     * Organization
     */
    orgStructure: organizationSchema.fields.orgStructure,
    publicGoods: organizationSchema.fields.publicGoods,
    founders: organizationSchema.fields.founders,
  })
  .defined() as yup.ObjectSchema<ProjectFormData>;
