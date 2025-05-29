import * as yup from 'yup';

import { normalizeUrl } from '@/utils/url';

import { IFounderInput, IProjectFormData } from '../types';

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

const founderSchema: yup.ObjectSchema<IFounderInput> = yup.object().shape({
  fullName: yup.string().required('Founder name is required'),
  titleRole: yup.string().required('Founder title/role is required'),
});

export const basicsSchema = yup.object().shape({
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
  mainDescription: yup.string().required('Main description is required'),
  logoUrl: yup
    .string()
    .url('Invalid Logo URL')
    .required('Project logo is required'),
  websiteUrl: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Project website is required'),
  appUrl: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('App URL is required when applicable'),
  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one tag')
    .required('Tags are required'),
  whitePaper: yup
    .string()
    .transform(normalizeUrl)
    .url('Please enter a valid URL')
    .required('Whitepaper URL is required when applicable'),
  dateFounded: yup.date().required('Foundation date is required'),
  dateLaunch: yup.date().required('Launch date is required when applicable'),
});

export const technicalsSchema = yup.object().shape({
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
    .string()
    .isContractAddressList(
      'One or more addresses are invalid. Addresses must be valid Ethereum addresses, separated by commas. An empty field is allowed if not applicable.',
    )
    .required('Dapp smart contract address is required when applicable'),
});

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

export const financialSchema = yup.object().shape({
  fundingStatus: yup
    .string()
    .required('Funding status is required when applicable'),
  tokenContract: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .required('Token contract address is required'),
});

export const projectSchema = basicsSchema
  .concat(technicalsSchema)
  .concat(organizationSchema)
  .concat(financialSchema)
  .defined() as yup.ObjectSchema<IProjectFormData>;
