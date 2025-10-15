import '../styles/globals.css';

import { ChatwootWidget } from '@/components/layout/ChatwootWidget';
import { MainLayout } from '@/components/layout/mainLayout';
import { Providers } from '@/components/layout/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="min-w-[390px]">
      <body className="font-sans">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
        <ChatwootWidget position="right" />
      </body>
    </html>
  );
}
