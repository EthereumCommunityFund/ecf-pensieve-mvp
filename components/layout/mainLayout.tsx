import { Topbar } from '../topbar/topbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto px-5 pb-[63px] pt-[70px]">{children}</main>
    </div>
  );
}
