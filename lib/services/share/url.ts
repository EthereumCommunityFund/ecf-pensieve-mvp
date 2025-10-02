import { buildAbsoluteUrl } from '@/lib/utils/url';

interface ShareOgImagePathInput {
  code: string;
  version?: string | null;
  timestamp?: number | string | null;
}

interface ShareOgImageUrlInput extends ShareOgImagePathInput {
  origin?: string;
}

export function buildShareOgImagePath(input: ShareOgImagePathInput): string {
  const params = new URLSearchParams();

  if (input.version) {
    params.set('v', input.version);
  }

  if (input.timestamp !== null && input.timestamp !== undefined) {
    const value = String(input.timestamp);
    if (value.length > 0) {
      params.set('ts', value);
    }
  }

  const query = params.toString();
  return query.length > 0
    ? `/api/share/og-image/${input.code}?${query}`
    : `/api/share/og-image/${input.code}`;
}

export function buildShareOgImageUrl(input: ShareOgImageUrlInput): string {
  const { origin, ...pathInput } = input;
  return buildAbsoluteUrl(buildShareOgImagePath(pathInput), origin);
}
