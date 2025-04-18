'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { useState } from 'react';

import { supabase } from '../supabase/client';

import { trpc } from './client';

const customRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code;

    if (code === 'UNAUTHORIZED') {
      return false;
    }
  }

  return failureCount < 3;
};

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: customRetry,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `/api/trpc`,
          async headers() {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            const headers: Record<string, string> = {};
            if (session?.access_token) {
              headers['authorization'] = `Bearer ${session.access_token}`;
            }
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
