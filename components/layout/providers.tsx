'use client';

import {
  ToastProvider as HeroToastProvider,
  HeroUIProvider,
} from '@heroui/react';

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
              <HeroUIProvider>
                <HeroToastProvider
                  placement={'bottom-left'}
                  toastOffset={20}
                  toastProps={{
                    classNames: {
                      base: 'max-w-[350px]',
                      content: 'min-w-0',
                      wrapper: 'min-w-0',
                      title: 'break-words whitespace-normal',
                      description: 'break-words whitespace-normal',
                    },
                    variant: 'flat',
                  }}
                  regionProps={{
                    classNames: {
                      base: 'z-[1500]',
                    },
                  }}
                />
                {children}
              </HeroUIProvider>
            </SupabaseProvider>
          </TRPCProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
