import '../styles/globals.css';

import { Suspense } from 'react';

import { MainLayout } from '@/components/layout/mainLayout';
import { Providers } from '@/components/layout/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light min-w-[390px]">
      <body className="font-sans">
        <Suspense fallback={<div>Loading penseive...</div>}>
          <Providers>
            <MainLayout>{children}</MainLayout>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
