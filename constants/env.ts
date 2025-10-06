export const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
export const isDev = process.env.NEXT_PUBLIC_ENV === 'dev';

export const FallbackOrigin = {
  prod: process.env.NEXT_PUBLIC_SITE_URL || 'https://pensieve.ecf.network',
  dev: process.env.NEXT_PUBLIC_SITE_URL || 'https://dev-test.ecf.network',
  local: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export const isAutoFillForm = process.env.NEXT_PUBLIC_AUTO_FILL_FORM === 'true';
export const canScanPendingProject =
  process.env.NEXT_PUBLIC_SCAN_PENDING_PROJECT === 'true';
