'use client';

import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { Profile } from '../db/schema/profiles';
import { trpc } from '../trpc/client';

import { supabase } from './client';

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const utils = trpc.useUtils();
  const { data: profile } = trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: !!user?.id,
  });

  useEffect(() => {
    const initializeSupabase = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user || null);
          setIsLoading(false);
          if (event === 'SIGNED_OUT') {
            utils.user.getCurrentUser.setData(undefined, undefined);
          }
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    initializeSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SupabaseContext.Provider
      value={{ user, session, isLoading, profile: profile || null }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);
