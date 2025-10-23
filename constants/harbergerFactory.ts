'use client';

import type { Abi } from 'viem';

import harbergerFactoryArtifact from '@/smart-contracts/ignition/deployments/chain-11155111/artifacts/HarbergerFactoryModule.json';
import deployedAddresses from '@/smart-contracts/ignition/deployments/chain-11155111/deployed_addresses.json';

export type SlotTypeKey = 'enabled' | 'shielded';

export const factoryAddress =
  deployedAddresses['HarbergerFactoryModule#HarbergerFactory'];

export const HARBERGER_FACTORY_ADDRESS = (factoryAddress ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const HARBERGER_FACTORY_ABI = harbergerFactoryArtifact.abi as Abi;

export const VALUATION_TAX_ENABLED_SLOT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'newValuation', type: 'uint256' },
      { internalType: 'uint256', name: 'taxPeriods', type: 'uint256' },
      { internalType: 'string', name: 'newUri', type: 'string' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'newValuation', type: 'uint256' },
      { internalType: 'uint256', name: 'taxPeriods', type: 'uint256' },
      { internalType: 'string', name: 'newUri', type: 'string' },
    ],
    name: 'takeOver',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'taxPeriods', type: 'uint256' }],
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'forfeit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poke',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governanceReset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'newUri', type: 'string' }],
    name: 'updateAdCreative',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSlotDetails',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'currentOwner', type: 'address' },
          { internalType: 'uint256', name: 'valuation', type: 'uint256' },
          { internalType: 'uint256', name: 'lockedValuation', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'prepaidTaxBalance',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'taxPaidUntil', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'timeRemainingInSeconds',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'contentUpdateCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'contentUpdateLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'taxPeriodInSeconds',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'annualTaxRate', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'minBidIncrementRate',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'bondRate', type: 'uint256' },
          { internalType: 'uint256', name: 'minValuation', type: 'uint256' },
          { internalType: 'uint256', name: 'baseValuation', type: 'uint256' },
          { internalType: 'uint256', name: 'dustRate', type: 'uint256' },
          { internalType: 'string', name: 'currentAdURI', type: 'string' },
          { internalType: 'address', name: 'treasury', type: 'address' },
          { internalType: 'address', name: 'governance', type: 'address' },
          { internalType: 'bool', name: 'isOccupied', type: 'bool' },
        ],
        internalType: 'struct ValuationTaxEnabledSlot.SlotDetails',
        name: 'details',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export const VALUATION_TAX_SHIELDED_SLOT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'newValuation', type: 'uint256' },
      { internalType: 'uint256', name: 'taxPeriods', type: 'uint256' },
      { internalType: 'string', name: 'newUri', type: 'string' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'newValuation', type: 'uint256' },
      { internalType: 'uint256', name: 'taxPeriods', type: 'uint256' },
      { internalType: 'string', name: 'newUri', type: 'string' },
    ],
    name: 'takeOver',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'taxPeriods', type: 'uint256' }],
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'forfeit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poke',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governanceReset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'newUri', type: 'string' }],
    name: 'updateAdCreative',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSlotDetails',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'currentOwner', type: 'address' },
          { internalType: 'uint256', name: 'valuation', type: 'uint256' },
          { internalType: 'uint256', name: 'bondedAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'prepaidTaxBalance',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'taxPaidUntil', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'timeRemainingInSeconds',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'isExpired', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'contentUpdateCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'contentUpdateLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'taxPeriodInSeconds',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'annualTaxRate', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'minBidIncrementRate',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'bondRate', type: 'uint256' },
          { internalType: 'uint256', name: 'minValuation', type: 'uint256' },
          { internalType: 'string', name: 'currentAdURI', type: 'string' },
          { internalType: 'address', name: 'treasury', type: 'address' },
          { internalType: 'address', name: 'governance', type: 'address' },
          { internalType: 'bool', name: 'isOccupied', type: 'bool' },
        ],
        internalType: 'struct ValuationTaxShieldedSlot.SlotDetails',
        name: 'details',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
