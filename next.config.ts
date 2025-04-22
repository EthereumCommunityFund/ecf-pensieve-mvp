import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  strictMode: true,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/images/**',
        port: '',
      },
    ],
  },
};

export default nextConfig;
