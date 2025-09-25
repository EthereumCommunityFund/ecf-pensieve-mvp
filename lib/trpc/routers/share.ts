import { z } from 'zod';

import ShareService from '@/lib/services/share';

import { publicProcedure, router } from '../server';

const ensureInput = z.object({
  entityType: z.enum(['proposal', 'itemProposal', 'project']),
  entityId: z.union([z.string().min(1), z.number()]),
});

export const shareRouter = router({
  ensure: publicProcedure.input(ensureInput).query(async ({ input, ctx }) => {
    const payload = await ShareService.ensureShareLink({
      entityType: input.entityType,
      entityId: input.entityId,
      createdBy: ctx.user?.id,
    });

    return {
      ...payload,
      shareUrl: ShareService.buildShareUrl(payload.code),
    };
  }),
});
