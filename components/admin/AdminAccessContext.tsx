'use client';

import { createContext, ReactNode, useContext } from 'react';

import type {
  AdminWhitelistRole,
  AdminWhitelistSource,
} from '@/lib/services/adminWhitelist';

export type AdminAccessContextValue = {
  walletAddress: string | null;
  normalizedAddress: string | null;
  role: AdminWhitelistRole | null;
  source: AdminWhitelistSource | null;
};

const AdminAccessContext = createContext<AdminAccessContextValue | null>(null);

export const AdminAccessProvider = ({
  value,
  children,
}: {
  value: AdminAccessContextValue;
  children: ReactNode;
}) => {
  return (
    <AdminAccessContext.Provider value={value}>
      {children}
    </AdminAccessContext.Provider>
  );
};

export const useAdminAccess = (): AdminAccessContextValue => {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error('useAdminAccess must be used within AdminAccessProvider');
  }
  return context;
};
