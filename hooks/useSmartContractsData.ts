import { useMemo } from 'react';

import type { SmartContract } from '@/components/biz/project/smart-contracts/ContractEntry';
import { isNAValue, NA_VALUE } from '@/constants/naSelection';
import { generateUUID } from '@/lib/utils/uuid';

/**
 * Hook to transform smart contracts data between different formats
 */
export const useSmartContractsData = (
  data: string | any | null | undefined,
) => {
  return useMemo(() => {
    // Handle NA marker explicitly
    const isNA =
      data === NA_VALUE ||
      (Array.isArray(data) && data.length === 1 && data[0] === NA_VALUE) ||
      (typeof data === 'object' && data !== null && data.applicable === false);

    // Handle null/undefined
    if (!data || isNA) {
      return {
        applicable: false,
        contracts: [] as SmartContract[],
        references: [] as string[],
        isEmpty: true,
        isLegacyFormat: false,
      };
    }

    // Handle legacy string format
    if (typeof data === 'string') {
      const trimmed = data.trim();

      if (!trimmed || isNAValue(trimmed)) {
        return {
          applicable: false,
          contracts: [] as SmartContract[],
          references: [] as string[],
          isEmpty: true,
          isLegacyFormat: true,
        };
      }

      return {
        applicable: true,
        contracts: trimmed
          ? ([
              {
                id: generateUUID(),
                chain: 'ethereum',
                addresses: trimmed,
              },
            ] as SmartContract[])
          : [],
        references: [] as string[],
        isEmpty: !trimmed,
        isLegacyFormat: true,
      };
    }

    // Handle canonical JSONB array format
    if (Array.isArray(data)) {
      const contracts = data.map((contract: any, index: number) => ({
        id: `contract-${index}-${Date.now()}`,
        chain: contract.chain,
        addresses: contract.addresses || '',
      }));

      return {
        applicable: contracts.length > 0,
        contracts,
        references: [] as string[],
        isEmpty:
          contracts.length === 0 ||
          contracts.every(
            (c: any) => !c.addresses || c.addresses.trim() === '',
          ),
        isLegacyFormat: false,
      };
    }

    // Handle legacy/new object JSONB format
    if (typeof data === 'object') {
      const contracts = (data.contracts || []).map(
        (contract: any, index: number) => ({
          id: `contract-${index}-${Date.now()}`,
          chain: contract.chain,
          addresses: contract.addresses || '',
        }),
      );

      return {
        applicable: data.applicable ?? true,
        contracts,
        references: data.references || ([] as string[]),
        isEmpty:
          contracts.length === 0 ||
          contracts.every(
            (c: any) => !c.addresses || c.addresses.trim() === '',
          ),
        isLegacyFormat: false,
      };
    }

    // Default case
    return {
      applicable: true,
      contracts: [] as SmartContract[],
      references: [] as string[],
      isEmpty: true,
      isLegacyFormat: false,
    };
  }, [data]);
};

/**
 * Hook to convert smart contracts data to display format
 */
export const useSmartContractsDisplay = (
  data: string | any | null | undefined,
) => {
  const { applicable, contracts, references, isEmpty } =
    useSmartContractsData(data);

  return useMemo(() => {
    if (!applicable) {
      return {
        summary: NA_VALUE,
        details: null,
        isEmpty: true,
      };
    }

    if (isEmpty) {
      return {
        summary: 'No contracts',
        details: null,
        isEmpty: true,
      };
    }

    // Create summary
    const summary = contracts
      .map((contract: any) => {
        const addresses = contract.addresses
          ? contract.addresses
              .split(',')
              .map((a: string) => a.trim())
              .filter(Boolean)
          : [];
        const addressCount = addresses.length;
        return `${contract.chain}: ${addressCount} address${addressCount !== 1 ? 'es' : ''}`;
      })
      .join(', ');

    // Create detailed view
    const details = {
      contracts: contracts.map((contract: any) => ({
        chain: contract.chain,
        addresses: contract.addresses,
        addressCount: contract.addresses
          ? contract.addresses
              .split(',')
              .map((a: string) => a.trim())
              .filter(Boolean).length
          : 0,
      })),
      references,
    };

    return {
      summary,
      details,
      isEmpty: false,
    };
  }, [applicable, contracts, references, isEmpty]);
};

/**
 * Hook to convert smart contracts data back to string format (for backward compatibility)
 */
export const useSmartContractsToString = (
  data: string | any | null | undefined,
) => {
  const { contracts } = useSmartContractsData(data);

  return useMemo(() => {
    if (contracts.length === 0) {
      return '';
    }

    // Concatenate all addresses from all chains
    const allAddresses = contracts
      .map((contract: any) => contract.addresses)
      .filter(Boolean)
      .join(', ');
    return allAddresses;
  }, [contracts]);
};
