import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      lg: { min: '1400px' },
      pc: { min: '1200px', max: '1399px' },
      tablet: { min: '810px', max: '1199px' },
      mobile: { min: '1px', max: '809px' },
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        danger: '#D75454',
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'Arial', 'sans-serif'],
        saira: ['var(--font-saira)', 'Arial', 'sans-serif'],
        mona: ['var(--font-mona-sans)', 'Arial', 'sans-serif'],
      },
      scale: {
        '120': '1.2',
      },
    },
  },
  plugins: [
    heroui(),
    require('@tailwindcss/line-clamp'),
    function ({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};

export default config;
