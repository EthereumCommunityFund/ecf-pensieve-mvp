'use client';

import { HeroUIProvider } from '@heroui/react';

import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { config } from '@/config/wagmi';
import { SupabaseProvider } from '@/lib/supabase/provider';
import { TRPCProvider } from '@/lib/trpc/provider';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en-US">
          <TRPCProvider>
            <SupabaseProvider>
              <HeroUIProvider>{children}</HeroUIProvider>
            </SupabaseProvider>
          </TRPCProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
