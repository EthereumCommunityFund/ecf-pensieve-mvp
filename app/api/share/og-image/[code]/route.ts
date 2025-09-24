import { ImageResponse } from '@vercel/og';

import ShareService from '@/lib/services/share';

import { getOgFonts, renderShareOgImage } from '../../ogImageRenderer';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;

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
      width: 1200,
      height: 630,
      fonts,
      headers: {
        'Cache-Control':
          'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate share OG image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
