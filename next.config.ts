import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/images/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'pub-d00cee3ff1154a18bdf38c29db9a51c5.r2.dev',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
