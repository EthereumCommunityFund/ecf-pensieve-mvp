'use client';
import { useParams } from 'next/navigation';
import { createContext, useContext } from 'react';

import { trpc } from '@/lib/trpc/client';
import { IProfile } from '@/types';

export const DataContext = createContext<{
  user: IProfile | null;
  isLoading: boolean;
}>({
  user: null,
  isLoading: false,
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { address } = useParams();

  const { data: user, isLoading } = trpc.user.getUserByAddress.useQuery(
    {
      address: address as string,
    },
    {
      retry: 1,
    },
  );

  return (
    <DataContext.Provider value={{ user: user ?? null, isLoading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useProfileData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within an DataProvider');
  }
  return context;
};
