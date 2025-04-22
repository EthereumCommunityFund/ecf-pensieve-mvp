import { initTRPC, TRPCError } from '@trpc/server';
import superJSON from 'superjson';

import { db } from '@/lib/db';
import { getServiceSupabase } from '@/lib/supabase/client';

export type Context = {
  user: { id: string } | null;
  db: typeof db;
  supabase: ReturnType<typeof getServiceSupabase>;
};

export const createTRPCContext = async (opts: {
  headers: Headers;
}): Promise<Context> => {
  const supabase = getServiceSupabase();

  const authHeader = opts.headers.get('authorization');
  if (!authHeader) {
    return { user: null, db, supabase };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { user: null, db, supabase };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { user: null, db, supabase };
  }

  return {
    user: { id: user.id },
    db,
    supabase,
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
