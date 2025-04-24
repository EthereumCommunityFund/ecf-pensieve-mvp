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
    .required('App URL is required when applicable'),
});

// Step 2: Dates & Statuses
export const datesSchema = yup.object().shape({
  dateFounded: yup
    .date()
    .required('Foundation date is required')
    .max(new Date(), 'Foundation date cannot be later than today'),
  dateLaunch: yup.date().required('Launch date is required when applicable'),
  devStatus: yup.string().required('Development status is required'),
  fundingStatus: yup
    .string()
    .required('Funding status is required when applicable'),
});

// Step 3: Technicals
export const technicalsSchema = yup.object().shape({
  openSource: yup
    .string()
    .required('Please select whether the project is open source'),
  codeRepo: yup
    .string()
    .url('Please enter a valid URL')
    .required('Code repository URL is required when applicable'),
  tokenContract: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .required('Token contract address is required when applicable'),
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

export const projectSchema = basicsSchema
  .concat(datesSchema)
  .concat(technicalsSchema)
  .concat(organizationSchema)
  .defined() as yup.ObjectSchema<ProjectFormData>;
