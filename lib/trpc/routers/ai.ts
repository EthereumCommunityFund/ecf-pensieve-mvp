import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, router } from '@/lib/trpc/server';

const DEFAULT_BASE_URL = 'https://api.dify.ai/v1';
const RESPONSE_MODES = ['blocking', 'streaming', 'waiting'] as const;
type ResponseMode = (typeof RESPONSE_MODES)[number];

const buildDifyPayload = (
  inputs: Record<string, unknown>,
  responseMode: ResponseMode,
) => {
  const payload: Record<string, unknown> = {
    inputs,
    response_mode: responseMode,
  };

  return payload;
};

export const aiRouter = router({
  runWorkflow: protectedProcedure
    .input(
      z.object({
        inputs: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const apiKey = process.env.DIFY_API_KEY?.trim();
      if (!apiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'DIFY_WORKFLOW_API_KEY is not configured',
        });
      }

      const responseMode = 'blocking';
      const difyBaseUrl = DEFAULT_BASE_URL;
      const endpoint = `${difyBaseUrl}/workflows/run`;

      const requestBody = buildDifyPayload(input.inputs, responseMode);

      let difyResponse: Response;
      try {
        difyResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      } catch (error) {
        console.error('Error calling Dify workflow:', error);
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: 'Failed to call Dify workflow',
          cause: error,
        });
      }

      const data = await difyResponse.json();
      return {
        data,
      };
    }),
});

export type AiRouter = typeof aiRouter;
