import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import DiscourseShareService from '@/lib/services/discourseShare';
import { buildDiscourseShareOgImageUrl } from '@/lib/services/discourseShare/url';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import ShareRedirectClient from './ShareRedirectClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

function buildMetadata(
  payload: Awaited<ReturnType<typeof DiscourseShareService.getSharePayload>>,
  origin: string,
): Metadata {
  if (!payload) {
    return {} as Metadata;
  }

  const shareUrl = buildAbsoluteUrl(payload.sharePath, origin);
  const targetUrl = buildAbsoluteUrl(payload.targetUrl, origin);
  const ogImageUrl = buildDiscourseShareOgImageUrl({
    code: payload.code,
    version: payload.imageVersion,
    origin,
  });
  const ogImageSize = { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT };

  return {
    title: payload.metadata.title,
    description: payload.metadata.description,
    openGraph: {
      title: payload.metadata.title,
      description: payload.metadata.description,
      type: 'website',
      url: shareUrl,
      siteName: 'Pensieve',
      images: [
        {
          url: ogImageUrl,
          width: ogImageSize.width,
          height: ogImageSize.height,
          alt: payload.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: payload.metadata.title,
      description: payload.metadata.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: targetUrl,
    },
    robots: {
      index: false,
      follow: false,
    },
    other: {
      'og:see_also': targetUrl,
    },
  } as Metadata;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const payload = await DiscourseShareService.getSharePayload(code);
  if (!payload) {
    notFound();
  }
  const origin = getAppOrigin();
  return buildMetadata(payload, origin);
}

export default async function DiscourseSharePage({ params }: PageProps) {
  const { code } = await params;
  const payload = await DiscourseShareService.getSharePayload(code);
  if (!payload) {
    notFound();
  }

  const origin = getAppOrigin();
  const targetUrl = buildAbsoluteUrl(payload.targetUrl, origin);

  return (
    <main className="opacity-0">
      <ShareRedirectClient targetUrl={targetUrl} />
    </main>
  );
}
