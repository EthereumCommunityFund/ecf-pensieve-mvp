'use client';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { WagmiProvider } from 'wagmi';

import AuthPrompt from '@/components/auth/AuthPrompt';
import { config } from '@/config/wagmi';
import { AuthProvider } from '@/context/AuthContext';
import { ExternalLinkProvider } from '@/context/ExternalLinkContext';
import { NavigationProvider } from '@/hooks/useNavigation';
import { SupabaseProvider } from '@/lib/supabase/provider';
import { TRPCProvider } from '@/lib/trpc/provider';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <NavigationProvider>
      <HeroUIProvider navigate={router.push}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider locale="en-US">
              <TRPCProvider>
                <SupabaseProvider>
                  <AuthProvider>
                    <ExternalLinkProvider>
                      <ToastProvider
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
                      <AuthPrompt />
                    </ExternalLinkProvider>
                  </AuthProvider>
                </SupabaseProvider>
              </TRPCProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </HeroUIProvider>
    </NavigationProvider>
  );
}
