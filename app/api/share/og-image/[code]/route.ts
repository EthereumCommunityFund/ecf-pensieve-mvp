import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import ShareService from '@/lib/services/share';
import {
  getOgFonts,
  renderShareOgImage,
} from '@/lib/services/share/ogImageRenderer';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code) {
    return new Response('Not Found', { status: 404 });
  }

  const payload = await ShareService.getSharePayload(code);

  if (!payload || payload.visibility === 'private') {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const timestampParam = request.nextUrl.searchParams.get('ts');
    let normalizedTimestamp = payload.imageTimestamp;

    if (timestampParam != null && timestampParam.trim().length > 0) {
      const parsedTimestamp = Number(timestampParam);
      if (Number.isFinite(parsedTimestamp)) {
        normalizedTimestamp = parsedTimestamp;
      }
    }

    const fonts = await getOgFonts();
    const origin = new URL(request.url).origin;
    const element = renderShareOgImage(payload, origin);

    const response = new ImageResponse(element, {
      width: SHARE_CARD_WIDTH,
      height: SHARE_CARD_HEIGHT,
      fonts,
    });

    response.headers.set('Content-Type', 'image/png');
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=604800, stale-while-revalidate=86400',
    );

    if (Number.isFinite(normalizedTimestamp)) {
      response.headers.set(
        'Last-Modified',
        new Date(normalizedTimestamp).toUTCString(),
      );
      response.headers.set('ETag', `W/"share-${code}-${normalizedTimestamp}"`);
    }

    return response;
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
