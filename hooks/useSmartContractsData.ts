import { useMemo } from 'react';

import type { ISmartContract } from '@/components/pages/project/create/types';
import type { DappSmartContractsData } from '@/lib/db/schema/projects';
import { generateUUID } from '@/lib/utils/uuid';

/**
 * Hook to transform smart contracts data between different formats
 */
export const useSmartContractsData = (
  data: string | DappSmartContractsData | null | undefined,
) => {
  return useMemo(() => {
    // Handle null/undefined
    if (!data) {
      return {
        applicable: true,
        contracts: [] as ISmartContract[],
        references: [] as string[],
        isEmpty: true,
        isLegacyFormat: false,
      };
    }

    // Handle legacy string format
    if (typeof data === 'string') {
      const addresses = data
        .split(',')
        .map((addr) => addr.trim())
        .filter(Boolean);

      return {
        applicable: true,
        contracts:
          addresses.length > 0
            ? ([
                {
                  id: generateUUID(),
                  chain: 'ethereum',
                  addresses,
                },
              ] as ISmartContract[])
            : [],
        references: [] as string[],
        isEmpty: addresses.length === 0,
        isLegacyFormat: true,
      };
    }

    // Handle new JSONB format
    if (typeof data === 'object') {
      const contracts = (data.contracts || []).map((contract, index) => ({
        id: `contract-${index}-${Date.now()}`,
        chain: contract.chain,
        addresses: contract.addresses || [],
      }));

      return {
        applicable: data.applicable ?? true,
        contracts,
        references: data.references || ([] as string[]),
        isEmpty:
          contracts.length === 0 ||
          contracts.every((c) => c.addresses.length === 0),
        isLegacyFormat: false,
      };
    }

    // Default case
    return {
      applicable: true,
      contracts: [] as ISmartContract[],
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
  data: string | DappSmartContractsData | null | undefined,
) => {
  const { applicable, contracts, references, isEmpty } =
    useSmartContractsData(data);

  return useMemo(() => {
    if (!applicable) {
      return {
        summary: 'N/A',
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
      .map((contract) => {
        const addressCount = contract.addresses.length;
        return `${contract.chain}: ${addressCount} address${addressCount !== 1 ? 'es' : ''}`;
      })
      .join(', ');

    // Create detailed view
    const details = {
      contracts: contracts.map((contract) => ({
        chain: contract.chain,
        addresses: contract.addresses,
        addressCount: contract.addresses.length,
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
  data: string | DappSmartContractsData | null | undefined,
) => {
  const { contracts } = useSmartContractsData(data);

  return useMemo(() => {
    if (contracts.length === 0) {
      return '';
    }

    // Flatten all addresses from all chains
    const allAddresses = contracts.flatMap((contract) => contract.addresses);
    return allAddresses.join(', ');
  }, [contracts]);
};
