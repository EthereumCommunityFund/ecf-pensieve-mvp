import { initTRPC, TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import superJSON from 'superjson';

import { db } from '@/lib/db';
import type { AdminWhitelist } from '@/lib/db/schema';
import { profiles } from '@/lib/db/schema';
import {
  checkAdminWhitelist,
  type AdminWhitelistRole,
  type AdminWhitelistSource,
} from '@/lib/services/adminWhitelist';
import { getServiceSupabase } from '@/lib/supabase/client';

const SYSTEM_TOKEN_HEADER = 'x-ai-system-token';

export type AdminGuardContext = {
  wallet: string;
  role: AdminWhitelistRole;
  source: AdminWhitelistSource;
  entry: AdminWhitelist | null;
};

export type Context = {
  user: { id: string } | null;
  db: typeof db;
  supabase: ReturnType<typeof getServiceSupabase>;
  admin?: AdminGuardContext;
};

export const createTRPCContext = async (opts: {
  headers: Headers;
}): Promise<Context> => {
  const supabase = getServiceSupabase();

  const systemToken = opts.headers.get(SYSTEM_TOKEN_HEADER);
  if (systemToken) {
    return {
      user: { id: systemToken },
      db,
      supabase,
      admin: undefined,
    };
  }

  const authHeader = opts.headers.get('authorization');
  if (!authHeader) {
    return { user: null, db, supabase, admin: undefined };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { user: null, db, supabase, admin: undefined };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { user: null, db, supabase, admin: undefined };
  }

  return {
    user: { id: user.id },
    db,
    supabase,
    admin: undefined,
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'user not authenticated',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);

const requireAdminAccess = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'user not authenticated',
    });
  }

  const profile = await ctx.db.query.profiles.findFirst({
    columns: {
      address: true,
    },
    where: eq(profiles.userId, ctx.user.id),
  });

  if (!profile?.address) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Wallet address is required for admin access',
    });
  }

  const whitelistCheck = await checkAdminWhitelist(profile.address, ctx.db);

  if (
    !whitelistCheck.isWhitelisted ||
    !whitelistCheck.normalizedAddress ||
    !whitelistCheck.role ||
    !whitelistCheck.source
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Wallet is not authorized to access this resource',
    });
  }

  const adminContext: AdminGuardContext = {
    wallet: whitelistCheck.normalizedAddress,
    role: whitelistCheck.role,
    source: whitelistCheck.source,
    entry: whitelistCheck.entry,
  };

  return next({
    ctx: {
      ...ctx,
      admin: adminContext,
    },
  });
});

export const adminProcedure = protectedProcedure.use(requireAdminAccess);
