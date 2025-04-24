import { SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { count, eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { generateSiweNonce } from 'viem/siwe';
import { z } from 'zod';

import { loginNonces, profiles } from '@/lib/db/schema';
import { publicProcedure, router } from '@/lib/trpc/server';

const NONCE_EXPIRY_MS = 10 * 60 * 1000;

const getFakeEmail = (address: string): string =>
  `${address.toLowerCase()}@pensieve.com`;

const generateAuthToken = async (
  address: string,
  supabaseAdmin: SupabaseClient,
): Promise<string> => {
  const normalizedAddress = address.toLowerCase();
  const email = getFakeEmail(normalizedAddress);
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) {
    console.error(
      `[TRPC Verify Token] Database error when generating auth token for ${normalizedAddress} (${email}):`,
      error,
    );
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Database error when generating auth token',
      cause: error,
    });
  }

  if (!data?.properties?.hashed_token) {
    console.error(
      `[TRPC Verify Token] Missing hashed_token in response for ${normalizedAddress} (${email}).`,
      data,
    );
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Invalid response when generating auth token.',
    });
  }

  return data.properties.hashed_token;
};

const verifySignature = (
  message: string,
  signature: string,
  expectedAddress: string,
): void => {
  let recoveredAddress: string;

  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch (verifyError: any) {
    console.error(
      `[TRPC Verify] ethers.verifyMessage call failed (${expectedAddress}):`,
      verifyError,
    );
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid signature format or verification failed',
    });
  }

  if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.warn(
      `[TRPC Verify] Address mismatch: recovered address ${recoveredAddress.toLowerCase()} != provided address ${expectedAddress.toLowerCase()}`,
    );
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Signature does not match provided address',
    });
  }
};

export const authRouter = router({
  generateNonce: publicProcedure
    .input(z.object({ address: z.string().min(1, 'address is required') }))
    .mutation(async ({ ctx, input }) => {
      const { address } = input;
      const lowerCaseAddress = address.toLowerCase();
      const nonce = generateSiweNonce();
      const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MS);

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
              nonce,
              expiresAt,
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
      const lowerCaseAddress = input.address.toLowerCase();

      try {
        const result = await ctx.db
          .select({ value: count() })
          .from(profiles)
          .where(eq(profiles.address, lowerCaseAddress));

        const registrationCount = result?.[0]?.value ?? 0;
        return { registered: registrationCount > 0 };
      } catch (error: unknown) {
        console.error('Check registration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check user registration status.',
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),

  verify: publicProcedure
    .input(
      z.object({
        address: z.string().min(1, 'Address is required'),
        signature: z.string().min(1, 'Signature is required'),
        message: z.string().min(1, 'Message is required'),
        username: z
          .string()
          .trim()
          .min(1, 'Username cannot be empty')
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { address, signature, message, username } = input;
      const normalizedAddress = address.toLowerCase();
      const email = getFakeEmail(normalizedAddress);

      verifySignature(message, signature, normalizedAddress);

      let nonceData: { nonce: string; expiresAt: Date } | undefined;
      let profileData: { userId: string } | undefined;

      try {
        const [nonceResult, profileResult] = await Promise.all([
          ctx.db
            .select({
              nonce: loginNonces.nonce,
              expiresAt: loginNonces.expiresAt,
            })
            .from(loginNonces)
            .where(eq(loginNonces.address, normalizedAddress))
            .limit(1),

          ctx.db
            .select({
              userId: profiles.userId,
            })
            .from(profiles)
            .where(eq(profiles.address, normalizedAddress))
            .limit(1),
        ]);

        nonceData = nonceResult[0];
        profileData = profileResult[0];
      } catch (dbError: any) {
        console.error(
          `[TRPC Verify DB] Error fetching Nonce or Profile for ${normalizedAddress}:`,
          dbError,
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database error when retrieving nonce or profile',
          cause: dbError,
        });
      }

      if (nonceData) {
        ctx.db
          .delete(loginNonces)
          .where(eq(loginNonces.address, normalizedAddress))
          .catch((deleteError: any) => {
            console.error(
              `[TRPC Verify Cleanup] Error deleting used nonce for ${normalizedAddress}:`,
              deleteError,
            );
          });
      }

      if (!nonceData) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid or expired nonce, please try again.',
        });
      }

      if (new Date(nonceData.expiresAt) < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Nonce has expired, please try again.',
        });
      }

      if (!message.includes(nonceData.nonce)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid nonce in signature message.',
        });
      }

      const isNewUser = !profileData;

      if (!isNewUser) {
        try {
          const token = await generateAuthToken(
            normalizedAddress,
            ctx.supabase,
          );
          return { isNewUser, token };
        } catch (tokenError) {
          console.error(
            `[TRPC Verify Flow] Failed to generate token for existing user ${normalizedAddress}:`,
            tokenError,
          );
          if (!(tokenError instanceof TRPCError)) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to generate token for existing user.',
              cause: tokenError,
            });
          }
          throw tokenError;
        }
      }

      if (!username) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New account requires a username',
        });
      }

      let userId: string;
      try {
        const { data: newUserResponse, error: createUserError } =
          await ctx.supabase.auth.admin.createUser({
            user_metadata: { wallet_address: normalizedAddress },
            email,
            email_confirm: true,
          });

        if (createUserError) throw createUserError;
        if (!newUserResponse?.user?.id) {
          throw new Error(
            'Supabase Auth user creation response did not contain user ID.',
          );
        }

        userId = newUserResponse.user.id;
      } catch (createUserError: any) {
        console.error(
          `[TRPC Verify Flow] Failed to create Supabase Auth user for ${normalizedAddress}:`,
          createUserError,
        );
        if (
          createUserError.message.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email or address may already be registered.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database error when creating user',
          cause: createUserError,
        });
      }

      try {
        await ctx.db.insert(profiles).values({
          userId: userId,
          address: normalizedAddress,
          name: username,
        });
      } catch (createProfileError: any) {
        console.error(
          `[TRPC Verify Flow] Failed to create profile for user ${userId} (${normalizedAddress}):`,
          createProfileError,
        );
        try {
          await ctx.supabase.auth.admin.deleteUser(userId);
        } catch (deleteUserError) {
          console.error(
            `[TRPC Verify Flow Rollback] Failed to delete orphaned Auth user ${userId}:`,
            deleteUserError,
          );
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database error when creating profile',
          cause: createProfileError,
        });
      }

      try {
        const token = await generateAuthToken(normalizedAddress, ctx.supabase);
        return { isNewUser, token };
      } catch (tokenError) {
        console.error(
          `[TRPC Verify Flow] Failed to generate token for new user ${normalizedAddress}:`,
          tokenError,
        );
        if (!(tokenError instanceof TRPCError)) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate token for new user.',
            cause: tokenError,
          });
        }
        throw tokenError;
      }
    }),
});
