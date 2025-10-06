import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { SharePayload } from '@/lib/services/share';
import ShareService from '@/lib/services/share';
import { buildShareOgImageUrl } from '@/lib/services/share/url';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import ShareRedirectClient from './ShareRedirectClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type SharePageSearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<{
    code: string;
  }>;
  searchParams?: Promise<SharePageSearchParams>;
}

function normalizeTimestampParam(
  value: string | string[] | undefined,
): string | null {
  if (!value) {
    return null;
  }
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== 'string') {
    return null;
  }
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildMetadataFromPayload(
  payload: SharePayload,
  origin: string,
  snapshotTimestamp?: string | null,
): Metadata {
  const sharePath = snapshotTimestamp
    ? `${payload.sharePath}?ts=${snapshotTimestamp}`
    : payload.sharePath;
  const shareUrl = buildAbsoluteUrl(sharePath, origin);
  const dynamicOgImageUrl = buildShareOgImageUrl({
    code: payload.code,
    version: payload.imageVersion,
    timestamp: snapshotTimestamp,
    origin,
  });
  const ogImageSize = { width: 540, height: 300 };
  const targetUrl = buildAbsoluteUrl(payload.targetUrl, origin);

  const robots = {
    index: false,
    follow: false,
  };

  const metadata = {
    title: payload.metadata.title,
    description: payload.metadata.subtitle ?? payload.metadata.description,
    openGraph: {
      title: payload.metadata.title,
      description:
        payload.metadata.subtitle ?? payload.metadata.description ?? undefined,
      type: 'website',
      url: shareUrl,
      siteName: 'Pensieve',
      images: [
        {
          url: dynamicOgImageUrl,
          width: ogImageSize.width,
          height: ogImageSize.height,
          alt: payload.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: payload.metadata.title,
      description:
        payload.metadata.subtitle ?? payload.metadata.description ?? undefined,
      images: [dynamicOgImageUrl],
    },
    alternates: {
      canonical: targetUrl,
    },
    robots,
    other: {
      'og:see_also': targetUrl,
    },
  };

  return metadata as Metadata;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const resolvedSearchParams = (
    searchParams ? await searchParams : {}
  ) as SharePageSearchParams;
  const snapshotTimestamp = normalizeTimestampParam(resolvedSearchParams['ts']);
  const payload = await ShareService.getSharePayload(code);

  if (!payload || payload.visibility === 'private') {
    notFound();
  }

  const origin = getAppOrigin();
  return buildMetadataFromPayload(payload, origin, snapshotTimestamp);
}

export default async function SharePage({ params, searchParams }: PageProps) {
  const { code } = await params;

  const payload = await ShareService.getSharePayload(code);

  if (!payload || payload.visibility === 'private') {
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
