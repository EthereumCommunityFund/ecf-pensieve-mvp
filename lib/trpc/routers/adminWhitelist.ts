import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  ADMIN_WHITELIST_ROLES,
  AdminWhitelistError,
  createAdminWhitelistEntry,
  deleteAdminWhitelistEntry,
  listAdminWhitelist,
  updateAdminWhitelistEntry,
} from '@/lib/services/adminWhitelist';
import { adminProcedure, router } from '@/lib/trpc/server';

const roleEnum = z.enum(ADMIN_WHITELIST_ROLES);

const handleAdminWhitelistError = (error: unknown): never => {
  if (error instanceof AdminWhitelistError) {
    switch (error.code) {
      case 'invalid_address':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      case 'duplicate_address':
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      case 'not_found':
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      case 'last_entry':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      default:
        break;
    }
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Admin whitelist operation failed',
    cause: error instanceof Error ? error : undefined,
  });
};

export const adminWhitelistRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return listAdminWhitelist(ctx.db);
  }),

  create: adminProcedure
    .input(
      z.object({
        address: z.string().min(1, 'address is required'),
        nickname: z
          .string()
          .max(120, 'nickname is too long')
          .optional()
          .or(z.literal('').transform(() => undefined)),
        role: roleEnum.optional(),
        isDisabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await createAdminWhitelistEntry(
          {
            address: input.address,
            nickname: input.nickname,
            role: input.role,
            isDisabled: input.isDisabled,
          },
          ctx.db,
        );

        return created;
      } catch (error) {
        handleAdminWhitelistError(error);
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        nickname: z
          .string()
          .max(120, 'nickname is too long')
          .optional()
          .or(z.literal('').transform(() => undefined)),
        role: roleEnum.optional(),
        isDisabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await updateAdminWhitelistEntry(
          input.id,
          {
            nickname: input.nickname,
            role: input.role,
            isDisabled: input.isDisabled,
          },
          ctx.db,
        );
        return updated;
      } catch (error) {
        handleAdminWhitelistError(error);
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const deleted = await deleteAdminWhitelistEntry(input.id, ctx.db);
        return deleted;
      } catch (error) {
        handleAdminWhitelistError(error);
      }
    }),
});
