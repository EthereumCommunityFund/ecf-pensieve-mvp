import { Topbar } from '../topbar/Topbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<Topbar />
			<main className="pt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
			</main>
		</div>
	);
}
