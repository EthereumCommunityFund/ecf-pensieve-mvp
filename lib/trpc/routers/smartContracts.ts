import { TRPCError } from '@trpc/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { CACHE_TAGS } from '@/lib/constants';
import { smartContractService } from '@/lib/services/smartContractService';
import { protectedProcedure, publicProcedure, router } from '@/lib/trpc/server';

// Schema definitions
const smartContractSchema = z.object({
  chain: z.string().min(1, 'Chain is required'),
  addresses: z.string().min(1, 'At least one address is required'),
});

const smartContractsInputSchema = z.object({
  projectId: z.number(),
  contracts: z.array(smartContractSchema),
});

export const smartContractsRouter = router({
  /**
   * Update smart contracts for a project
   */
  update: protectedProcedure
    .input(smartContractsInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { projectId, contracts } = input;

      // Check user permission
      const hasPermission = await smartContractService.checkUserPermission(
        ctx.user.id,
        projectId,
      );

      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this project',
        });
      }

      // Validate all contract addresses if there are any
      if (contracts.length > 0) {
        const validationResults =
          await smartContractService.validateContracts(contracts);

        if (!validationResults.valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid contract data',
            cause: validationResults.errors,
          });
        }
      }

      // Update smart contracts data
      await smartContractService.updateSmartContracts(projectId, contracts);

      // Invalidate cache
      revalidateTag(CACHE_TAGS.PROJECTS);
      revalidateTag(`${CACHE_TAGS.PROJECTS}-${projectId}`);

      return { success: true };
    }),

  /**
   * Get smart contracts for a project
   */
  get: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId } = input;

      try {
        const smartContractsData =
          await smartContractService.getSmartContracts(projectId);
        return smartContractsData;
      } catch (error) {
        if (error instanceof Error && error.message === 'Project not found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }
        throw error;
      }
    }),

  /**
   * Validate smart contract addresses
   */
  validate: publicProcedure
    .input(
      z.object({
        contracts: z.array(smartContractSchema),
      }),
    )
    .mutation(async ({ input }) => {
      const { contracts } = input;

      const validationResults =
        await smartContractService.validateContracts(contracts);

      return {
        valid: validationResults.valid,
        errors: validationResults.errors,
      };
    }),
});
