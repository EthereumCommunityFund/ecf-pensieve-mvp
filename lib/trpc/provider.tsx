'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { useState } from 'react';
import superJSON from 'superjson';

import { getSessionWithTimeout } from '@/lib/utils/supabaseUtils';

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
          transformer: superJSON,
          url: `/api/trpc`,
          async headers() {
            const headers: Record<string, string> = {};
            // Only try to get session in browser environment
            if (typeof window !== 'undefined') {
              try {
                const {
                  data: { session },
                } = await getSessionWithTimeout();
                if (session?.access_token) {
                  headers['authorization'] = `Bearer ${session.access_token}`;
                }
              } catch (error) {
                // Ignore errors in getting session
                console.warn('Failed to get session for tRPC headers:', error);
              }
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
