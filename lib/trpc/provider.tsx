'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { useState } from 'react';
import superJSON from 'superjson';

import { supabase } from '@/lib/supabase/client';

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
            console.log('Making tRPC request...');
            const {
              data: { session },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
              console.error('Session error:', sessionError);
            }

            const headers: Record<string, string> = {};
            if (session?.access_token) {
              headers['authorization'] = `Bearer ${session.access_token}`;
              console.log('Auth token added to headers');
            } else {
              console.warn('No auth token available');
            }
            return headers;
          },
          fetch: (url, options) => {
            console.log('Fetch request:', {
              url,
              method: options?.method || 'GET',
              timestamp: new Date().toISOString(),
            });

            return fetch(url, options)
              .then((response) => {
                console.log('Fetch response:', {
                  status: response.status,
                  statusText: response.statusText,
                  url: response.url,
                  timestamp: new Date().toISOString(),
                });
                return response;
              })
              .catch((error) => {
                console.error('Fetch error:', {
                  message: error.message,
                  url,
                  timestamp: new Date().toISOString(),
                });
                throw error;
              });
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
