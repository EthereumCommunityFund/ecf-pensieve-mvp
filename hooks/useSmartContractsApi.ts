import type { SmartContract } from '@/components/biz/project/smart-contracts';
import { trpc } from '@/lib/trpc/client';

export interface UseSmartContractsApiProps {
  projectId: number;
}

/**
 * Hook for smart contracts API operations
 */
export const useSmartContractsApi = ({
  projectId,
}: UseSmartContractsApiProps) => {
  const utils = trpc.useContext();

  // Get smart contracts data
  const { data, isLoading, error } = (
    trpc as any
  ).smartContracts?.get?.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  ) || { data: null, isLoading: false, error: null };

  // Update smart contracts mutation
  const updateMutation = (trpc as any).smartContracts?.update?.useMutation({
    onSuccess: () => {
      // Invalidate related queries
      (utils as any).smartContracts?.get?.invalidate({ projectId });
      (utils as any).project?.get?.invalidate({ id: projectId });
    },
  }) || {
    mutateAsync: async () => ({}),
    isPending: false,
    error: null,
    reset: () => {},
  };

  // Validate smart contracts mutation
  const validateMutation = (
    trpc as any
  ).smartContracts?.validate?.useMutation() || {
    mutateAsync: async () => ({}),
    isPending: false,
    error: null,
    reset: () => {},
  };

  return {
    // Data
    smartContracts: data?.contracts || [],
    isLoading,
    error,

    // Actions
    updateSmartContracts: async (contracts: SmartContract[]) => {
      return updateMutation.mutateAsync({
        projectId,
        contracts,
      });
    },

    validateContracts: async (contracts: SmartContract[]) => {
      return validateMutation.mutateAsync({ contracts });
    },

    // States
    isUpdating: updateMutation.isPending,
    isValidating: validateMutation.isPending,
    updateError: updateMutation.error,
    validateError: validateMutation.error,

    // Utils
    reset: () => {
      updateMutation.reset();
      validateMutation.reset();
    },
  };
};
