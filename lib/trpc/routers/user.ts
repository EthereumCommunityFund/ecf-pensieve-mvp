import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { users } from '../../db/schema/users';
import { protectedProcedure, router } from '../server';

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id));

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'user not found',
      });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatar_url: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...input,
          updated_at: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updatedUser;
    }),
});
