import { and, eq } from 'drizzle-orm';
import { ethers } from 'ethers';

import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import type { DappSmartContractsData } from '@/lib/db/schema/projects';

export interface SmartContract {
  chain: string;
  addresses: string[];
}

export interface SmartContractsUpdateData {
  applicable: boolean;
  contracts: SmartContract[];
  references?: string[];
}

export interface SmartContractsData {
  applicable: boolean;
  contracts: SmartContract[];
  references: string[];
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

      if (!contract.addresses || contract.addresses.length === 0) {
        errors.push(`No addresses provided for ${contract.chain}`);
        continue;
      }

      const addressSet = chainMap.get(contract.chain) || new Set<string>();

      for (const address of contract.addresses) {
        const trimmed = address.trim();

        if (!trimmed) {
          continue;
        }

        if (!ethers.isAddress(trimmed)) {
          errors.push(
            `Invalid address format on ${contract.chain}: ${trimmed}`,
          );
          continue;
        }

        const normalized = trimmed.toLowerCase();
        if (addressSet.has(normalized)) {
          errors.push(`Duplicate address on ${contract.chain}: ${trimmed}`);
          continue;
        }

        addressSet.add(normalized);
      }

      chainMap.set(contract.chain, addressSet);
    }

    // Check for duplicate chains
    const chainCounts = new Map<string, number>();
    for (const contract of contracts) {
      if (contract.chain) {
        chainCounts.set(
          contract.chain,
          (chainCounts.get(contract.chain) || 0) + 1,
        );
      }
    }

    for (const [chain, count] of chainCounts.entries()) {
      if (count > 1) {
        errors.push(
          `Chain "${chain}" appears multiple times. Please consolidate addresses into a single entry.`,
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
    data: SmartContractsUpdateData,
  ): Promise<void> {
    // Construct JSONB data structure
    const smartContractsData: DappSmartContractsData = {
      applicable: data.applicable,
      contracts: data.applicable
        ? data.contracts.map((contract) => ({
            chain: contract.chain,
            addresses: contract.addresses
              .map((addr) => addr.trim())
              .filter(Boolean),
          }))
        : [],
      references: data.references || [],
    };

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
    const smartContractsData = project.dappSmartContracts as
      | DappSmartContractsData
      | string
      | null;

    // Handle old data format (if it's a string)
    if (typeof smartContractsData === 'string') {
      // Old data is comma-separated addresses string
      const addresses = smartContractsData
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      return {
        applicable: addresses.length > 0,
        contracts:
          addresses.length > 0
            ? [
                {
                  chain: 'ethereum',
                  addresses,
                },
              ]
            : [],
        references: [],
      };
    }

    // Return structured data or default values
    const result: SmartContractsData = {
      applicable: smartContractsData?.applicable ?? true,
      contracts: smartContractsData?.contracts || [],
      references: smartContractsData?.references || [],
    };
    return result;
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
    if (!legacyData) return [];

    // Assume old data is comma-separated addresses
    const addresses = legacyData
      .split(',')
      .map((addr) => addr.trim())
      .filter(Boolean);

    if (addresses.length === 0) return [];

    // Group all addresses under Ethereum by default
    return [
      {
        chain: 'ethereum',
        addresses,
      },
    ];
  }

  /**
   * Transform new format to legacy format (for backwards compatibility)
   */
  transformToLegacyFormat(contracts: SmartContract[]): string {
    // For backwards compatibility, concatenate all addresses
    return contracts.flatMap((contract) => contract.addresses).join(', ');
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService();
