import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import DiscourseShareService from '@/lib/services/discourseShare';
import {
  getOgFonts,
  renderDiscourseOgImage,
} from '@/lib/services/discourseShare/ogImageRenderer';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code) {
    return new Response('Not Found', { status: 404 });
  }

  const cacheKeySuffix = request.nextUrl.searchParams.get('v');
  const payload = await DiscourseShareService.getSharePayload(code, {
    cacheKeySuffix,
  });
  if (!payload) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const fonts = await getOgFonts();
    const origin = new URL(request.url).origin;
    const element = renderDiscourseOgImage(payload, origin);

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

    if (Number.isFinite(payload.imageTimestamp)) {
      response.headers.set(
        'Last-Modified',
        new Date(payload.imageTimestamp).toUTCString(),
      );
      response.headers.set(
        'ETag',
        `W/"discourse-share-${code}-${payload.imageTimestamp}"`,
      );
    }

    return response;
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
