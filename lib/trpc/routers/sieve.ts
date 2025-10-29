import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import SieveService, {
  type SieveVisibility,
  type SieveWithShareLink,
  SieveServiceError,
} from '@/lib/services/sieveService';

import { protectedProcedure, router } from '../server';

const visibilityEnum = z.enum(['public', 'private']);

const createInput = z.object({
  name: z.string().min(1),
  description: z.string().max(5000).optional().nullable(),
  targetPath: z.string().min(1),
  visibility: visibilityEnum,
});

const updateInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().max(5000).optional().nullable(),
  targetPath: z.string().min(1).optional(),
  visibility: visibilityEnum.optional(),
});

const deleteInput = z.object({
  id: z.number(),
});

const getByCodeInput = z.object({
  code: z.string().min(1),
});

type SerializedSieve = ReturnType<typeof serializeSieve>;

function serializeSieve(sieve: SieveWithShareLink) {
  const payload = sieve.sharePayload;

  return {
    id: sieve.id,
    name: sieve.name,
    description: sieve.description,
    targetPath: sieve.targetPath,
    visibility: sieve.visibility as SieveVisibility,
    createdAt: sieve.createdAt,
    updatedAt: sieve.updatedAt,
    share: {
      code: sieve.shareLink.code,
      url: sieve.shareUrl,
      visibility: payload.visibility,
      targetUrl: payload.targetUrl,
    },
  };
}

function handleServiceError(error: unknown): never {
  if (error instanceof TRPCError) {
    throw error;
  }

  if (error instanceof SieveServiceError) {
    throw new TRPCError({
      code:
        error.statusCode === 400
          ? 'BAD_REQUEST'
          : error.statusCode === 403
            ? 'FORBIDDEN'
            : error.statusCode === 404
              ? 'NOT_FOUND'
              : error.statusCode === 409
                ? 'CONFLICT'
                : 'INTERNAL_SERVER_ERROR',
      message: error.message,
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected sieve service error',
  });
}

export const sieveRouter = router({
  createSieve: protectedProcedure
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const sieved = await SieveService.createSieve({
          name: input.name,
          description: input.description ?? undefined,
          targetPath: input.targetPath,
          visibility: input.visibility,
          creatorId: ctx.user.id,
        });

        return serializeSieve(sieved);
      } catch (error) {
        handleServiceError(error);
      }
    }),
  getUserSieves: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sieves = await SieveService.getUserSieves(ctx.user.id);
      return sieves.map(serializeSieve);
    } catch (error) {
      handleServiceError(error);
    }
  }),
  updateSieve: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const sieved = await SieveService.updateSieve({
          sieveId: input.id,
          creatorId: ctx.user.id,
          name: input.name,
          description: input.description ?? undefined,
          targetPath: input.targetPath,
          visibility: input.visibility,
        });

        return serializeSieve(sieved);
      } catch (error) {
        handleServiceError(error);
      }
    }),
  deleteSieve: protectedProcedure
    .input(deleteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        await SieveService.deleteSieve({
          sieveId: input.id,
          creatorId: ctx.user.id,
        });

        return { success: true } as const;
      } catch (error) {
        handleServiceError(error);
      }
    }),
  getSieveByCode: protectedProcedure
    .input(getByCodeInput)
    .query(async ({ ctx, input }) => {
      try {
        const record = await SieveService.getSieveByCode(input.code);
        if (!record) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Feed not found' });
        }

        if (!SieveService.checkSieveOwnership(record, ctx.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this feed',
          });
        }

        return serializeSieve(record);
      } catch (error) {
        handleServiceError(error);
      }
    }),
});
