import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
		'./node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: 'var(--primary)',
				'primary-foreground': 'var(--primary-foreground)',
			},
			fontFamily: {
				sans: ['var(--font-open-sans)', 'Arial', 'sans-serif'],
				special: ['var(--font-saira)', 'Arial', 'sans-serif'],
			},
		},
	},
	plugins: [heroui()],
};

export default config;
