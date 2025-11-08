import type { Abi } from 'viem';

import harbergerAbi from '@/abi/HarbergerFactory.json';
import valuationTaxEnabledSlotAbi from '@/abi/ValuationTaxEnabledSlot.json';
import valuationTaxShieldedSlotAbi from '@/abi/ValuationTaxShieldedSlot.json';

export type SlotTypeKey = 'enabled' | 'shielded';

export const factoryAddress = process.env.NEXT_PUBLIC_HARBERGER_FACTORY_ADDRESS;
export const factoryOwnerAddress = process.env.HARBERGER_FACTORY_OWNER;

export const HARBERGER_FACTORY_ADDRESS = factoryAddress as `0x${string}`;
export const HARBERGER_FACTORY_OWNER = factoryOwnerAddress as `0x${string}`;

export const HARBERGER_FACTORY_ABI = harbergerAbi as Abi;

export const VALUATION_TAX_ENABLED_SLOT_ABI = valuationTaxEnabledSlotAbi as Abi;

export const VALUATION_TAX_SHIELDED_SLOT_ABI =
  valuationTaxShieldedSlotAbi as Abi;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
