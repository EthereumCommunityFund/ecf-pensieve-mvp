import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { profiles } from '@/lib/db/schema';
import { protectedProcedure, router } from '@/lib/trpc/server';

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, ctx.user.id));

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
        .update(profiles)
        .set({
          ...input,
        })
        .where(eq(profiles.userId, ctx.user.id))
        .returning();

      return updatedUser;
    }),
});
