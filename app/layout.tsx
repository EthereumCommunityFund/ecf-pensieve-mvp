import './globals.css';
import { Open_Sans, Saira } from 'next/font/google';

import { MainLayout } from '@/components/layout/MainLayout';

import { Providers } from './providers';

const openSans = Open_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-open-sans',
	display: 'swap',
	preload: true,
});

const saira = Saira({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-saira',
	display: 'swap',
	preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`light ${openSans.variable} ${saira.variable}`}>
			<body className="font-sans">
				<Providers>
					<MainLayout>{children}</MainLayout>
				</Providers>
			</body>
		</html>
	);
}
