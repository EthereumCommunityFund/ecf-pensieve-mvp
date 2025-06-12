import { Topbar } from '../topbar/topbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto h-full max-w-[1440px] pt-[50px]">
        {children}
      </main>
    </div>
  );
}
