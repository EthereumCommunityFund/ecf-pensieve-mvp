import type { IProject } from '@/types';
import type { IFundingReceivedGrants } from '@/types/item';

/**
 * Data migration and transformation utilities for FundingReceivedGrants
 */
export class FundingGrantsDataService {
  /**
   * Normalize organization data format to always return an array
   */
  static normalizeOrganizationData(organization: string | string[]): string[] {
    if (Array.isArray(organization)) {
      return organization;
    }
    return organization ? [organization] : [];
  }

  /**
   * Check if data is in legacy format (single string)
   */
  static isLegacyData(organization: string | string[]): boolean {
    return typeof organization === 'string';
  }

  /**
   * Convert legacy format to new format
   * @param organization - Legacy format project name or ID
   * @param projectNameToIdMap - Mapping from project names to IDs
   */
  static convertLegacyToNewFormat(
    organization: string,
    projectNameToIdMap: Record<string, string>,
  ): string[] {
    // Check if it's already a project ID (numeric string)
    if (/^\d+$/.test(organization)) {
      return [organization];
    }

    // Try to find the project ID from the name map
    const projectId = projectNameToIdMap[organization];
    return projectId ? [projectId] : [];
  }

  /**
   * Migrate organization data from old to new format
   */
  static migrateOrganizationData(
    organization: string | string[],
    projectMap?: Map<string, IProject>,
  ): {
    projectIds: string[];
    isLegacy: boolean;
    needsMigration: boolean;
  } {
    if (Array.isArray(organization)) {
      return {
        projectIds: organization,
        isLegacy: false,
        needsMigration: false,
      };
    }

    // Legacy data: project name format
    const projectId = projectMap?.get(organization)?.id.toString();
    return {
      projectIds: projectId ? [projectId] : [organization],
      isLegacy: true,
      needsMigration: !!projectId,
    };
  }

  /**
   * Batch migrate data
   */
  static async batchMigrateData(
    grants: IFundingReceivedGrants[],
    getProjectByName: (name: string) => Promise<IProject | null>,
  ): Promise<IFundingReceivedGrants[]> {
    const migrated = await Promise.all(
      grants.map(async (grant) => {
        if (typeof grant.organization === 'string') {
          // If it's already a numeric ID, keep it
          if (/^\d+$/.test(grant.organization)) {
            return {
              ...grant,
              organization: [grant.organization],
            };
          }

          // Otherwise, try to find the project by name
          const project = await getProjectByName(grant.organization);
          return {
            ...grant,
            organization: project
              ? [project.id.toString()]
              : [grant.organization],
          };
        }
        return grant;
      }),
    );

    return migrated;
  }

  /**
   * Format organization value for display
   * Returns the organization value in a consistent format for rendering
   */
  static formatOrganizationValue(
    value: string | string[] | undefined,
  ): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter((v) => v && v.trim().length > 0);
    }

    return value.trim() ? [value] : [];
  }

  /**
   * Validate organization IDs
   * Ensures all IDs are valid numeric strings
   */
  static validateOrganizationIds(ids: string[]): string[] {
    return ids.filter((id) => {
      // Check if it's a valid numeric ID
      if (/^\d+$/.test(id)) {
        return true;
      }

      // Log warning for invalid IDs
      console.warn(`Invalid project ID format: ${id}`);
      return false;
    });
  }
}

/**
 * Hook-friendly data transformation utilities
 */
export const useFundingGrantsTransform = () => {
  const normalizeOrganization = (
    value: string | string[] | undefined,
  ): string[] => {
    return FundingGrantsDataService.formatOrganizationValue(value);
  };

  const isMultiSelect = (value: string | string[] | undefined): boolean => {
    return Array.isArray(value);
  };

  const validateIds = (ids: string[]): string[] => {
    return FundingGrantsDataService.validateOrganizationIds(ids);
  };

  return {
    normalizeOrganization,
    isMultiSelect,
    validateIds,
  };
};
