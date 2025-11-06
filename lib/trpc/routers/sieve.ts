import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { profiles } from '@/lib/db/schema';
import SieveService, {
  type SieveVisibility,
  type SieveWithShareLink,
  SieveServiceError,
} from '@/lib/services/sieveService';
import type { StoredSieveFilterConditions } from '@/types/sieve';

import { protectedProcedure, publicProcedure, router } from '../server';

const visibilityEnum = z.enum(['public', 'private']);

const advancedConditionSchema = z.object({
  id: z.string(),
  connector: z.enum(['AND', 'OR']).optional(),
  fieldType: z.string(),
  fieldKey: z.string(),
  operator: z.string(),
  value: z.string().optional().nullable(),
});

const advancedFilterSchema = z.object({
  id: z.string(),
  conditions: z.array(advancedConditionSchema),
});

const filterConditionsSchema = z.object({
  version: z.number(),
  basePath: z.string(),
  sort: z.string().nullable(),
  categories: z.array(z.string()),
  search: z.string().nullable(),
  advancedFilters: z.array(advancedFilterSchema),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

const createInput = z.object({
  name: z.string().min(1),
  description: z.string().max(5000).optional().nullable(),
  targetPath: z.string().min(1),
  visibility: visibilityEnum,
  filterConditions: filterConditionsSchema.optional(),
});

const updateInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().max(5000).optional().nullable(),
  targetPath: z.string().min(1).optional(),
  visibility: visibilityEnum.optional(),
  filterConditions: filterConditionsSchema.optional(),
});

const followInput = z.object({
  sieveId: z.number(),
});

const deleteInput = z.object({
  id: z.number(),
});

const getByCodeInput = z.object({
  code: z.string().min(1),
});

const getPublicByAddressInput = z.object({
  address: z.string().min(1),
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
    followCount: sieve.followCount ?? 0,
    filterConditions:
      (sieve.filterConditions as StoredSieveFilterConditions | null) ?? null,
    creatorId: sieve.creator,
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
          filterConditions: input.filterConditions ?? undefined,
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
  getPublicSievesByAddress: publicProcedure
    .input(getPublicByAddressInput)
    .query(async ({ ctx, input }) => {
      try {
        const normalizedAddress = input.address.trim().toLowerCase();
        const profile = await ctx.db.query.profiles.findFirst({
          columns: {
            userId: true,
          },
          where: eq(profiles.address, normalizedAddress),
        });

        if (!profile?.userId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profile not found',
          });
        }

        const sieves = await SieveService.getPublicSievesByCreator(
          profile.userId,
        );
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
          filterConditions: input.filterConditions ?? undefined,
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
  getPublicSieveByCode: publicProcedure
    .input(getByCodeInput)
    .query(async ({ ctx, input }) => {
      try {
        const record = await SieveService.getSieveByCode(input.code);
        if (!record) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Feed not found' });
        }

        const isOwner = ctx.user?.id === record.creator;
        if (record.visibility !== 'public' && !isOwner) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this feed',
          });
        }

        const serialized = serializeSieve(record);

        const creatorProfile = await ctx.db.query.profiles.findFirst({
          columns: {
            name: true,
            avatarUrl: true,
            address: true,
          },
          where: eq(profiles.userId, record.creator),
        });

        let isFollowing = false;
        if (ctx.user?.id && !isOwner) {
          isFollowing = await SieveService.isUserFollowingSieve(
            record.id,
            ctx.user.id,
            ctx.db,
          );
        }

        return {
          ...serialized,
          creator: creatorProfile
            ? {
                name: creatorProfile.name,
                avatarUrl: creatorProfile.avatarUrl,
                address: creatorProfile.address,
              }
            : null,
          isOwner,
          isFollowing,
        };
      } catch (error) {
        handleServiceError(error);
      }
    }),
  followSieve: protectedProcedure
    .input(followInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const record = await SieveService.followSieve({
          sieveId: input.sieveId,
          userId: ctx.user.id,
        });

        return serializeSieve(record);
      } catch (error) {
        handleServiceError(error);
      }
    }),
  unfollowSieve: protectedProcedure
    .input(followInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const record = await SieveService.unfollowSieve({
          sieveId: input.sieveId,
          userId: ctx.user.id,
        });

        return serializeSieve(record);
      } catch (error) {
        handleServiceError(error);
      }
    }),
  getUserFollowedSieves: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sieves = await SieveService.getUserFollowedSieves(ctx.user.id);
      return sieves.map(serializeSieve);
    } catch (error) {
      handleServiceError(error);
    }
  }),
});
