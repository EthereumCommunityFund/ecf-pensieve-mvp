export const isLocalDev = process.env.NODE_ENV !== 'production';
export const isAutoFillForm = process.env.NEXT_PUBLIC_AUTO_FILL_FORM === 'true';
export const isScanPendingProject =
  process.env.NEXT_PUBLIC_SCAN_PENDING_PROJECT === 'true';
