'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { usePublicClient } from 'wagmi';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
  ZERO_ADDRESS,
} from '@/constants/harbergerFactory';

export interface HarbergerFactoryState {
  owner: Address;
  treasury: Address;
  governance: Address;
  slotIdCounter: bigint;
  enabledSlots: Address[];
  shieldedSlots: Address[];
}

export interface UseHarbergerFactoryStateResult {
  data: HarbergerFactoryState | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isConfigured: boolean;
  lastUpdatedAt: number | null;
}

function normalizeAddress(address: string): Address {
  return (address as Address) ?? ZERO_ADDRESS;
}

export function useHarbergerFactoryState(): UseHarbergerFactoryStateResult {
  const publicClient = usePublicClient();
  const [data, setData] = useState<HarbergerFactoryState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const isConfigured = useMemo(() => {
    if (!data) return false;
    return data.treasury !== ZERO_ADDRESS && data.governance !== ZERO_ADDRESS;
  }, [data]);

  const fetchState = useCallback(async () => {
    if (!HARBERGER_FACTORY_ADDRESS) {
      setError(
        () =>
          new Error(
            'Harberger factory address is not configured. Please set NEXT_PUBLIC_HARBERGER_FACTORY_ADDRESS.',
          ),
      );
      return;
    }

    if (!publicClient) {
      setError(() => new Error('Public client is unavailable.'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        owner,
        treasury,
        governance,
        slotIdCounter,
        enabledSlots,
        shieldedSlots,
      ] = (await Promise.all([
        publicClient.readContract({
          address: HARBERGER_FACTORY_ADDRESS,
          abi: HARBERGER_FACTORY_ABI,
          functionName: 'owner',
        }),
        publicClient.readContract({
          address: HARBERGER_FACTORY_ADDRESS,
          abi: HARBERGER_FACTORY_ABI,
          functionName: 'treasury',
        }),
        publicClient.readContract({
          address: HARBERGER_FACTORY_ADDRESS,
          abi: HARBERGER_FACTORY_ABI,
          functionName: 'governance',
        }),
        publicClient.readContract({
          address: HARBERGER_FACTORY_ADDRESS,
          abi: HARBERGER_FACTORY_ABI,
          functionName: 'slotIdCounter',
        }),
        publicClient.readContract({
          address: HARBERGER_FACTORY_ADDRESS,
          abi: HARBERGER_FACTORY_ABI,
          functionName: 'getValuationTaxEnabledSlots',
        }),
        publicClient.readContract({
          address: HARBERGER_FACTORY_ADDRESS,
          abi: HARBERGER_FACTORY_ABI,
          functionName: 'getValuationTaxShieldedSlots',
        }),
      ])) as [Address, Address, Address, bigint, Address[], Address[]];

      const normalized: HarbergerFactoryState = {
        owner: normalizeAddress(owner),
        treasury: normalizeAddress(treasury),
        governance: normalizeAddress(governance),
        slotIdCounter,
        enabledSlots: enabledSlots.map(normalizeAddress),
        shieldedSlots: shieldedSlots.map(normalizeAddress),
      };

      setData(normalized);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      const errorInstance =
        err instanceof Error ? err : new Error('Failed to load factory state');
      setError(errorInstance);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    void fetchState();
  }, [fetchState]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchState,
    isConfigured,
    lastUpdatedAt,
  };
}
