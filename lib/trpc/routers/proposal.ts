import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { proposals } from '@/lib/db/schema/proposals';
import { projects } from '@/lib/db/schema/projects';

import { protectedProcedure, router } from '../server';

export const proposalRouter = router({
  createProposal: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        items: z.array(
          z.object({
            key: z.string().min(1, 'Key cannot be empty'),
            value: z.string().min(1, 'Value cannot be empty'),
          }),
        ),
        refs: z
          .array(
            z.object({
              key: z.string().min(1, 'Key cannot be empty'),
              value: z.string().min(1, 'Value cannot be empty'),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      const proposal = await ctx.db.insert(proposals).values({
        ...input,
        creator: ctx.user.id,
      });

      return proposal;
    }),
});
