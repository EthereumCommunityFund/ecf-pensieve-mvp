export function getAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  const envOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (envOrigin) {
    return envOrigin.replace(/\/$/, '');
  }

  // Fallback for local development or unknown environment
  return 'http://localhost:3000';
}

export function buildAbsoluteUrl(
  path: string,
  origin: string = getAppOrigin(),
): string {
  if (!path) {
    return origin;
  }

  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  const prefix = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${prefix}${normalizedPath}`;
}
