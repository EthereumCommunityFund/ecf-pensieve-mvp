import { TRPCError } from '@trpc/server';
import { generateSiweNonce } from 'viem/siwe';
import { z } from 'zod';
import { count, eq } from 'drizzle-orm';

import { loginNonces, profiles } from '@/lib/db/schema';
import { publicProcedure, router } from '@/lib/trpc/server';

export const authRouter = router({
  generateNonce: publicProcedure
    .input(z.object({ address: z.string().min(1, 'address is required') }))
    .mutation(async ({ ctx, input }) => {
      const { address } = input;
      const lowerCaseAddress = address.toLowerCase();

      const nonce = generateSiweNonce();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      try {
        await ctx.db
          .insert(loginNonces)
          .values({
            address: lowerCaseAddress,
            nonce,
            expiresAt,
          })
          .onConflictDoUpdate({
            target: loginNonces.address,
            set: {
              nonce: nonce,
              expiresAt: expiresAt,
            },
          });

        return { nonce };
      } catch (error: unknown) {
        console.error('Error creating nonce (tRPC):', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate or store authentication nonce.',
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
  checkRegistration: publicProcedure
    .input(z.object({ address: z.string().min(1, 'address is required') }))
    .query(async ({ ctx, input }) => {
      const { address } = input;
      const lowerCaseAddress = address.toLowerCase();

      try {
        const result = await ctx.db
          .select({ value: count() })
          .from(profiles)
          .where(eq(profiles.address, lowerCaseAddress));

        const registrationCount = result?.[0]?.value ?? 0;
        const isRegistered = registrationCount > 0;

        return { registered: isRegistered };
      } catch (error: unknown) {
        console.error('Check registration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check user registration status.',
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
});
