'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { useState } from 'react';
import superJSON from 'superjson';

import { trpc } from './client';
import { getSessionToken } from './sessionStore';

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
          headers() {
            const headers: Record<string, string> = {};
            const token = getSessionToken();
            if (token) {
              headers['authorization'] = `Bearer ${token}`;
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
