import '../styles/globals.css';

import { MainLayout } from '@/components/layout/mainLayout';

import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="light">
			<body className="font-sans">
				<Providers>
					<MainLayout>{children}</MainLayout>
				</Providers>
			</body>
		</html>
	);
}
