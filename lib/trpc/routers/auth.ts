import { SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import { ethers } from 'ethers';
import { generateSiweNonce } from 'viem/siwe';
import { z } from 'zod';

import { loginNonces, profiles } from '@/lib/db/schema';
import { invitationCodes } from '@/lib/db/schema/invitations';
import { addDefaultListToUser } from '@/lib/services/listService';
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
        const profile = await ctx.db.query.profiles.findFirst({
          where: eq(profiles.address, lowerCaseAddress),
        });

        return { registered: !!profile };
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
        inviteCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { address, signature, message, username, inviteCode } = input;
      const normalizedAddress = address.toLowerCase();
      const email = getFakeEmail(normalizedAddress);

      verifySignature(message, signature, normalizedAddress);

      let nonceData: { nonce: string; expiresAt: Date } | undefined;
      let profileData: { userId: string } | undefined;

      try {
        const [nonceResult, profileResult] = await Promise.all([
          ctx.db.query.loginNonces.findFirst({
            where: eq(loginNonces.address, normalizedAddress),
            columns: {
              nonce: true,
              expiresAt: true,
            },
          }),

          ctx.db.query.profiles.findFirst({
            where: eq(profiles.address, normalizedAddress),
            columns: {
              userId: true,
            },
          }),
        ]);

        nonceData = nonceResult;
        profileData = profileResult;
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

      // Note: Nonce deletion moved to the end of successful flow to prevent issues with retries

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

          // Clean up nonce after successful token generation for existing user
          ctx.db
            .delete(loginNonces)
            .where(eq(loginNonces.address, normalizedAddress))
            .catch((deleteError: any) => {
              console.error(
                `[TRPC Verify Cleanup] Error deleting used nonce for existing user ${normalizedAddress}:`,
                deleteError,
              );
            });

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

      let invitationCodeId: number;
      if (isNewUser) {
        if (!inviteCode) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'New account requires an invite code.',
          });
        }

        try {
          const codes = await ctx.db.query.invitationCodes.findFirst({
            where: eq(invitationCodes.code, inviteCode),
          });

          if (!codes) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Invalid invite code.',
            });
          }

          if (codes.currentUses >= codes.maxUses) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Invite code has been used to its maximum capacity.',
            });
          }

          await ctx.db
            .update(invitationCodes)
            .set({ currentUses: sql`${invitationCodes.currentUses} + 1` })
            .where(eq(invitationCodes.id, codes.id));

          invitationCodeId = codes.id;
        } catch (error: any) {
          console.error(
            `[TRPC Verify Flow] Error during invite code validation for ${normalizedAddress} (code: ${inviteCode}):`,
            error,
          );
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error validating invite code.',
            cause: error,
          });
        }
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
        // Insert profile record
        await ctx.db.insert(profiles).values({
          userId: userId,
          address: normalizedAddress,
          name: username,
          invitationCodeId: invitationCodeId!,
        });

        // Verify profile was created successfully by querying it back
        const profileCheck = await ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, userId),
        });

        if (!profileCheck) {
          throw new Error(
            'Profile data is not immediately available for reading - this may be due to database replication delay or caching. Please try again in a moment.',
          );
        }

        await addDefaultListToUser(userId, ctx.db);

        // Generate token only after confirming profile exists and is queryable
        const token = await generateAuthToken(normalizedAddress, ctx.supabase);

        // Clean up nonce after successful profile creation and token generation
        ctx.db
          .delete(loginNonces)
          .where(eq(loginNonces.address, normalizedAddress))
          .catch((deleteError: any) => {
            console.error(
              `[TRPC Verify Cleanup] Error deleting used nonce for new user ${normalizedAddress}:`,
              deleteError,
            );
          });

        return { isNewUser, token };
      } catch (error: any) {
        console.error(
          `[TRPC Verify Flow] Error in profile creation or token generation for ${normalizedAddress}:`,
          error,
        );

        // If error occurs during profile creation
        if (
          error.message?.includes('profile') ||
          error.message?.includes('database')
        ) {
          try {
            await ctx.supabase.auth.admin.deleteUser(userId);
          } catch (deleteUserError) {
            console.error(
              `[TRPC Verify Flow Rollback] Failed to delete orphaned Auth user ${userId}:`,
              deleteUserError,
            );
          }
        }

        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error.message || 'Error creating profile or generating token',
          cause: error,
        });
      }
    }),
});
