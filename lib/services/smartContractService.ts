import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { AddressValidator } from '@/lib/utils/addressValidation';

export interface SmartContract {
  chain: string;
  addresses: string;
}

// SmartContractsUpdateData interface removed - using SmartContract[] directly

export interface SmartContractsData {
  contracts: SmartContract[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class SmartContractService {
  /**
   * Validate smart contracts data
   */
  async validateContracts(
    contracts: SmartContract[],
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const chainMap = new Map<string, Set<string>>();

    for (const contract of contracts) {
      if (!contract.chain) {
        errors.push('Chain selection is required');
        continue;
      }

      if (!contract.addresses || !contract.addresses.trim()) {
        errors.push(`No addresses provided for ${contract.chain}`);
        continue;
      }

      // Use original chain name for storage but check duplicates case-insensitively
      const addressSet = chainMap.get(contract.chain) || new Set<string>();

      // Parse addresses from string (comma-separated)
      const addressList = contract.addresses
        .split(',')
        .map((addr) => addr.trim())
        .filter(Boolean);

      for (const address of addressList) {
        if (!AddressValidator.isValidFormat(address)) {
          errors.push(
            `Invalid address format on ${contract.chain}: ${address}`,
          );
          continue;
        }

        // Normalize to checksum format for consistency
        const normalized =
          AddressValidator.normalizeAddress(address).toLowerCase();
        if (addressSet.has(normalized)) {
          errors.push(`Duplicate address on ${contract.chain}: ${address}`);
          continue;
        }

        addressSet.add(normalized);
      }

      chainMap.set(contract.chain, addressSet);
    }

    // Check for duplicate chains (case-insensitive)
    const chainCounts = new Map<string, number>();
    const chainOriginalNames = new Map<string, string>();

    for (const contract of contracts) {
      if (contract.chain) {
        const chainLower = contract.chain.toLowerCase();
        chainCounts.set(chainLower, (chainCounts.get(chainLower) || 0) + 1);

        // Store the original name for error messages
        if (!chainOriginalNames.has(chainLower)) {
          chainOriginalNames.set(chainLower, contract.chain);
        }
      }
    }

    for (const [chainLower, count] of chainCounts.entries()) {
      if (count > 1) {
        const originalName = chainOriginalNames.get(chainLower) || chainLower;
        errors.push(
          `Chain "${originalName}" appears multiple times (case-insensitive). Please consolidate addresses into a single entry.`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update smart contracts for a project
   */
  async updateSmartContracts(
    projectId: number,
    contracts: SmartContract[],
  ): Promise<void> {
    // Construct JSONB array data structure (DB stores array only)
    // Empty array is stored as null to match other nullable fields behavior
    const smartContractsData =
      contracts.length > 0
        ? contracts.map((contract) => {
            // Normalize addresses to checksum format for consistency
            const addressList = contract.addresses
              .split(',')
              .map((addr) => addr.trim())
              .filter(Boolean)
              .map((addr) => AddressValidator.normalizeAddress(addr)); // Convert to normalized format

            return {
              chain: contract.chain,
              addresses: addressList.join(','),
            };
          })
        : null;

    // Update project's dappSmartContracts field
    await db
      .update(projects)
      .set({
        dappSmartContracts: smartContractsData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  }

  /**
   * Get smart contracts for a project
   */
  async getSmartContracts(projectId: number): Promise<SmartContractsData> {
    const projectResults = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!projectResults[0]) {
      throw new Error('Project not found');
    }

    const project = projectResults[0];
    const smartContractsData = project.dappSmartContracts as any;

    // Handle old data format (if it's a string)
    if (typeof smartContractsData === 'string') {
      // Old data is comma-separated addresses string
      return {
        contracts: smartContractsData.trim()
          ? [
              {
                chain: 'ethereum',
                addresses: smartContractsData.trim(),
              },
            ]
          : [],
      };
    }

    // Handle new array format (canonical)
    if (Array.isArray(smartContractsData)) {
      return {
        contracts: smartContractsData,
      };
    }

    // Handle old object format (for backwards compatibility during migration)
    if (smartContractsData && typeof smartContractsData === 'object') {
      return {
        contracts: smartContractsData.contracts || [],
      };
    }

    // No data -> return empty array
    return {
      contracts: [],
    };
  }

  /**
   * Check if user has permission to update project
   */
  async checkUserPermission(
    userId: string,
    projectId: number,
  ): Promise<boolean> {
    const projectResults = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.creator, userId)))
      .limit(1);

    return projectResults.length > 0;
  }

  /**
   * Transform legacy smart contracts data to new format
   */
  transformLegacyData(legacyData: string | null): SmartContract[] {
    if (!legacyData || !legacyData.trim()) return [];

    // Filter out empty addresses when transforming legacy data
    const addressList = legacyData
      .split(',')
      .map((addr) => addr.trim())
      .filter(Boolean);

    if (addressList.length === 0) return [];

    // Group all addresses under Ethereum by default
    return [
      {
        chain: 'ethereum',
        addresses: addressList.join(', '),
      },
    ];
  }

  /**
   * Transform new format to legacy format (for backwards compatibility)
   */
  transformToLegacyFormat(contracts: SmartContract[]): string {
    // For backwards compatibility, concatenate all addresses
    return contracts.map((contract) => contract.addresses).join(', ');
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService();
