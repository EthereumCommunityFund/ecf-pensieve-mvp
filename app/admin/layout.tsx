import { ReactNode } from 'react';

import { AdminAccessBoundary } from '@/components/admin/AdminAccessBoundary';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminAccessBoundary>{children}</AdminAccessBoundary>;
}
