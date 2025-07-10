import { supabase } from '@/lib/supabase/client';

export const getSessionWithTimeout = async (timeoutMs = 3000) => {
  return Promise.race([
    supabase.auth.getSession(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Session fetch timeout')), timeoutMs),
    ),
  ]);
};
