import { Topbar } from '../topbar/topbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen">
			<Topbar />
			<main className="pt-[70px] pl-5 pr-5 mx-auto">{children}</main>
		</div>
	);
}
