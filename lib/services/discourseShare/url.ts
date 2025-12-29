import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

export function buildDiscourseShareUrl(
  code: string,
  origin: string = getAppOrigin(),
): string {
  return buildAbsoluteUrl(`/discourse/s/${code}`, origin);
}

export function buildDiscourseShareOgImageUrl(params: {
  code: string;
  version?: string | null;
  origin?: string;
}): string {
  const origin = params.origin ?? getAppOrigin();
  const base = buildAbsoluteUrl(
    `/api/discourse/share/og-image/${params.code}`,
    origin,
  );
  const version = params.version?.trim();
  if (!version) {
    return base;
  }
  return `${base}?v=${encodeURIComponent(version)}`;
}
