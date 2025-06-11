export const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
export const isDev = process.env.NEXT_PUBLIC_ENV === 'dev';

export const isAutoFillForm = process.env.NEXT_PUBLIC_AUTO_FILL_FORM === 'true';
export const canScanPendingProject =
  process.env.NEXT_PUBLIC_SCAN_PENDING_PROJECT === 'true';
