'use client';

import { HeroUIProvider } from '@heroui/react';

import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';

import { config } from '@/config/wagmi';
import { SupabaseProvider } from '@/lib/supabase/provider';
import { TRPCProvider } from '@/lib/trpc/provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider locale="en-US">
        <SupabaseProvider>
          <TRPCProvider>
            <HeroUIProvider>{children}</HeroUIProvider>
          </TRPCProvider>
        </SupabaseProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
