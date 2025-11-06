import { z } from 'zod';

import ShareService from '@/lib/services/share';

import { publicProcedure, router } from '../server';

const shareEntityTypeEnum = z.enum([
  'proposal',
  'itemProposal',
  'project',
  'customFilter',
]);

const ensureInput = z.object({
  entityType: shareEntityTypeEnum,
  entityId: z.union([z.string().min(1), z.number()]),
});

const visibilityEnum = z.enum(['public', 'private']);

const ensureCustomFilterInput = z.object({
  targetPath: z.string().min(1),
  visibility: visibilityEnum.optional(),
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
  ensureCustomFilter: publicProcedure
    .input(ensureCustomFilterInput)
    .mutation(async ({ input, ctx }) => {
      const payload = await ShareService.ensureCustomFilterShareLink({
        targetPath: input.targetPath,
        createdBy: ctx.user?.id,
        visibility: input.visibility,
      });

      return {
        ...payload,
        shareUrl: ShareService.buildShareUrl(payload.code),
        targetPath: payload.filterTargetPath ?? payload.targetUrl,
      };
    }),
});
