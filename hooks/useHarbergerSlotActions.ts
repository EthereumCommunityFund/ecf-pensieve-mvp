'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Abi, Address } from 'viem';
import { BaseError, isHex } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { addToast } from '@/components/base/toast';
import {
  VALUATION_TAX_ENABLED_SLOT_ABI,
  VALUATION_TAX_SHIELDED_SLOT_ABI,
  type SlotTypeKey,
} from '@/constants/harbergerFactory';
import {
  ZERO_BIGINT,
  calculateBond,
  calculateTaxForPeriods,
} from '@/utils/harberger';

import type { ActiveSlotData, VacantSlotData } from './useHarbergerSlots';

type ActionKind =
  | 'claim'
  | 'takeover'
  | 'renew'
  | 'forfeit'
  | 'poke'
  | 'updateCreative';

interface ClaimParams {
  slot: VacantSlotData;
  valuationWei: bigint;
  taxPeriods: bigint;
  creativeUri: string;
}

interface TakeoverParams {
  slot: ActiveSlotData;
  valuationWei: bigint;
  taxPeriods: bigint;
  creativeUri: string;
}

interface RenewParams {
  slot: ActiveSlotData;
  taxPeriods: bigint;
}

interface ForfeitParams {
  slot: ActiveSlotData;
}

interface PokeParams {
  slot: ActiveSlotData;
}

interface UpdateCreativeParams {
  slot: ActiveSlotData;
  creativeUri: string;
}

type ContractFunctionName =
  | 'claim'
  | 'takeOver'
  | 'renew'
  | 'forfeit'
  | 'poke'
  | 'updateAdCreative';

type ExecuteArgs =
  | readonly [bigint, bigint, string]
  | readonly [bigint]
  | readonly [string]
  | readonly [];

interface ExecuteConfig {
  slotType: SlotTypeKey;
  slotAddress: Address;
  functionName: ContractFunctionName;
  args: ExecuteArgs;
  value?: bigint;
  successMessage: string;
}

const SLOT_ABI_BY_TYPE: Record<SlotTypeKey, Abi> = {
  enabled: VALUATION_TAX_ENABLED_SLOT_ABI,
  shielded: VALUATION_TAX_SHIELDED_SLOT_ABI,
};

function formatError(error: unknown): string {
  if (error instanceof BaseError) {
    if (error.shortMessage) {
      return error.shortMessage;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred.';
}

function ensureHttpUri(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('ipfs://') || value.startsWith('ar://')) {
    return value;
  }
  if (value.startsWith('data:')) {
    return value;
  }
  if (isHex(value)) {
    return value;
  }
  return value.trim();
}

export function useHarbergerSlotActions() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [pendingAction, setPendingAction] = useState<ActionKind | null>(null);

  const abiByType = useMemo(() => SLOT_ABI_BY_TYPE, []);

  const execute = useCallback(
    async (
      {
        slotType,
        slotAddress,
        functionName,
        args,
        value,
        successMessage,
      }: ExecuteConfig,
      action: ActionKind,
    ) => {
      if (!walletClient || !publicClient) {
        throw new Error(
          'Wallet client is not available. Connect your wallet again.',
        );
      }

      const abi = abiByType[slotType] as Abi;
      const account = walletClient.account?.address;

      if (!account) {
        throw new Error('Wallet account not found.');
      }

      setPendingAction(action);

      try {
        const simulationConfig: Record<string, unknown> = {
          account,
          address: slotAddress,
          abi,
          functionName,
          args,
        };

        if (typeof value !== 'undefined') {
          simulationConfig.value = value;
        }

        const { request } = await publicClient.simulateContract(
          simulationConfig as Parameters<
            typeof publicClient.simulateContract
          >[0],
        );

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash });

        addToast({
          title: 'Transaction confirmed',
          description: successMessage,
          color: 'success',
        });

        return hash;
      } catch (error) {
        const message = formatError(error);
        addToast({
          title: 'Transaction failed',
          description: message,
          color: 'danger',
          timeout: 5000,
        });
        throw error;
      } finally {
        setPendingAction(null);
      }
    },
    [abiByType, publicClient, walletClient],
  );

  const claim = useCallback(
    async ({ slot, valuationWei, taxPeriods, creativeUri }: ClaimParams) => {
      if (valuationWei < slot.minValuationWei) {
        throw new Error('Valuation must meet the slot minimum.');
      }

      if (taxPeriods <= ZERO_BIGINT) {
        throw new Error('Select at least one tax period.');
      }

      const bondRequired = calculateBond(valuationWei, slot.bondRateBps);
      const taxRequired = calculateTaxForPeriods(
        valuationWei,
        slot.annualTaxRateBps,
        slot.taxPeriodInSeconds,
        taxPeriods,
      );

      const totalValue = bondRequired + taxRequired;

      if (totalValue <= ZERO_BIGINT) {
        throw new Error('Computed value to send is zero.');
      }

      const normalizedUri = ensureHttpUri(creativeUri);

      return execute(
        {
          slotType: slot.slotType,
          slotAddress: slot.slotAddress,
          functionName: 'claim',
          args: [valuationWei, taxPeriods, normalizedUri] as const,
          value: totalValue,
          successMessage: 'Slot claimed successfully.',
        },
        'claim',
      );
    },
    [execute],
  );

  const takeover = useCallback(
    async ({ slot, valuationWei, taxPeriods, creativeUri }: TakeoverParams) => {
      if (taxPeriods <= ZERO_BIGINT) {
        throw new Error('Select at least one tax period.');
      }

      const minimumBid = slot.minTakeoverBidWei;
      if (valuationWei < minimumBid) {
        throw new Error('Bid must meet the minimum takeover requirement.');
      }

      const bondRequired = calculateBond(valuationWei, slot.bondRateBps);
      const taxRequired = calculateTaxForPeriods(
        valuationWei,
        slot.taxRateBps,
        slot.taxPeriodInSeconds,
        taxPeriods,
      );

      const totalValue = bondRequired + taxRequired;

      if (totalValue <= ZERO_BIGINT) {
        throw new Error('Computed value to send is zero.');
      }

      const normalizedUri = ensureHttpUri(creativeUri);

      return execute(
        {
          slotType: slot.slotType,
          slotAddress: slot.slotAddress,
          functionName: 'takeOver',
          args: [valuationWei, taxPeriods, normalizedUri] as const,
          value: totalValue,
          successMessage: 'Takeover completed successfully.',
        },
        'takeover',
      );
    },
    [execute],
  );

  const renew = useCallback(
    async ({ slot, taxPeriods }: RenewParams) => {
      if (taxPeriods <= ZERO_BIGINT) {
        throw new Error('Select at least one tax period.');
      }

      if (!address || !slot.ownerAddress) {
        throw new Error('Only the current slot owner can renew coverage.');
      }

      if (slot.ownerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Only the current slot owner can renew coverage.');
      }

      const valuationBasis =
        slot.valuationWei > ZERO_BIGINT
          ? slot.valuationWei
          : slot.minValuationWei;

      const taxDue = calculateTaxForPeriods(
        valuationBasis,
        slot.taxRateBps,
        slot.taxPeriodInSeconds,
        taxPeriods,
      );

      if (taxDue <= ZERO_BIGINT) {
        throw new Error('Calculated tax due is zero.');
      }

      return execute(
        {
          slotType: slot.slotType,
          slotAddress: slot.slotAddress,
          functionName: 'renew',
          args: [taxPeriods] as const,
          value: taxDue,
          successMessage: 'Tax coverage renewed.',
        },
        'renew',
      );
    },
    [address, execute],
  );

  const forfeit = useCallback(
    async ({ slot }: ForfeitParams) => {
      if (!address || !slot.ownerAddress) {
        throw new Error('Only the current slot owner can forfeit.');
      }

      if (slot.ownerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Only the current slot owner can forfeit.');
      }

      return execute(
        {
          slotType: slot.slotType,
          slotAddress: slot.slotAddress,
          functionName: 'forfeit',
          args: [] as const,
          successMessage: 'Slot forfeited.',
        },
        'forfeit',
      );
    },
    [address, execute],
  );

  const poke = useCallback(
    async ({ slot }: PokeParams) => {
      return execute(
        {
          slotType: slot.slotType,
          slotAddress: slot.slotAddress,
          functionName: 'poke',
          args: [] as const,
          successMessage: 'Slot settlement triggered.',
        },
        'poke',
      );
    },
    [execute],
  );

  const updateCreative = useCallback(
    async ({ slot, creativeUri }: UpdateCreativeParams) => {
      if (!address || !slot.ownerAddress) {
        throw new Error('Only the current slot owner can update creative.');
      }

      if (slot.ownerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Only the current slot owner can update creative.');
      }

      const normalizedUri = ensureHttpUri(creativeUri);

      return execute(
        {
          slotType: slot.slotType,
          slotAddress: slot.slotAddress,
          functionName: 'updateAdCreative',
          args: [normalizedUri] as const,
          successMessage: 'Creative updated successfully.',
        },
        'updateCreative',
      );
    },
    [address, execute],
  );

  return {
    claim,
    takeover,
    renew,
    forfeit,
    poke,
    updateCreative,
    pendingAction,
    isPending: {
      claim: pendingAction === 'claim',
      takeover: pendingAction === 'takeover',
      renew: pendingAction === 'renew',
      forfeit: pendingAction === 'forfeit',
      poke: pendingAction === 'poke',
      updateCreative: pendingAction === 'updateCreative',
    },
  };
}
