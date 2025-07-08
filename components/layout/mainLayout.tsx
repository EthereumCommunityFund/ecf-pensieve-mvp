import { Topbar } from '../topbar/topbar';

import { NotificationBanner } from './NotificationBanner';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <NotificationBanner />
      <main
        className="mx-auto h-full max-w-[1440px]"
        style={{
          paddingTop: 'calc(50px + var(--notification-banner-height, 0px))',
        }}
      >
        {children}
      </main>
    </div>
  );
}
