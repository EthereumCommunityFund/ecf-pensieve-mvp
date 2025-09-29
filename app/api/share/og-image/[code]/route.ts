import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

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
    const fonts = await getOgFonts();
    const origin = new URL(request.url).origin;
    const element = renderShareOgImage(payload, origin);

    return new ImageResponse(element, {
      width: 540,
      height: 300,
      fonts,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control':
          'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate share OG image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
