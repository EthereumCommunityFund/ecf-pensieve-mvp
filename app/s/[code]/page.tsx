import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import type { SharePayload } from '@/lib/services/share';
import ShareService from '@/lib/services/share';
import { buildShareOgImageUrl } from '@/lib/services/share/url';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

function buildMetadataFromPayload(
  payload: SharePayload,
  origin: string,
): Metadata {
  const shareUrl = buildAbsoluteUrl(payload.sharePath, origin);
  const dynamicOgImageUrl = buildShareOgImageUrl({
    code: payload.code,
    version: payload.imageVersion,
    timestamp: payload.imageTimestamp,
    origin,
  });
  const ogImageSize = { width: 540, height: 300 };
  const targetUrl = buildAbsoluteUrl(payload.targetUrl, origin);

  const robots =
    payload.visibility === 'public'
      ? undefined
      : {
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
      canonical: shareUrl,
    },
    robots,
    other: {
      'og:see_also': targetUrl,
    },
  };

  return metadata as Metadata;
}

function SharePreview({
  payload,
  origin,
}: {
  payload: SharePayload;
  origin: string;
}) {
  const { metadata } = payload;
  const logoUrl = buildAbsoluteUrl(
    metadata.project.logoUrl ?? '/pensieve-logo.svg',
    origin,
  );
  const shareUrl = buildAbsoluteUrl(payload.sharePath, origin);
  const targetUrl = buildAbsoluteUrl(payload.targetUrl, origin);
  const categories = (metadata.project.categories ?? []).slice(0, 4);
  const highlights = metadata.highlights ?? [];
  const timestamp = metadata.timestamp
    ? new Date(metadata.timestamp).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const badgeLabel = metadata.badge
    ? metadata.badge
    : payload.layout === 'proposal'
      ? 'Proposal'
      : payload.layout === 'itemProposal'
        ? 'Item Proposal'
        : 'Share';

  return (
    <div className="flex flex-col gap-6 p-8 sm:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
          {badgeLabel}
        </span>
        <span className="text-base font-semibold text-neutral-700">
          {metadata.project.name}
        </span>
        {timestamp && (
          <span className="text-sm text-neutral-500">Updated {timestamp}</span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-6">
          <img
            src={logoUrl}
            alt={`${metadata.project.name} logo`}
            className="size-20 rounded-2xl border border-neutral-200 object-cover"
          />
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
              {metadata.title}
            </h1>
            {metadata.subtitle && (
              <p className="text-lg text-neutral-600 sm:text-xl">
                {metadata.subtitle}
              </p>
            )}
            {metadata.description && (
              <p className="text-base leading-relaxed text-neutral-600">
                {metadata.description}
              </p>
            )}
          </div>
        </div>

        {(categories.length > 0 ||
          metadata.author?.name ||
          metadata.author?.address) && (
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
              >
                {category}
              </span>
            ))}
            {metadata.author && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600">
                {metadata.author.name ?? metadata.author.address}
              </span>
            )}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <span className="text-sm font-medium text-neutral-500">
                  {item.label}
                </span>
                <p className="mt-2 text-base font-semibold text-neutral-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-500">
              Share URL
            </span>
            <a
              href={shareUrl}
              className="text-base font-semibold text-emerald-600"
            >
              {shareUrl}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-500">
                Target page
              </span>
              <a
                href={targetUrl}
                className="text-base font-semibold text-neutral-800"
              >
                {targetUrl}
              </a>
            </div>
            <a
              href={payload.targetUrl}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow"
            >
              View now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const payload = await ShareService.getSharePayload(code);

  if (!payload || payload.visibility === 'private') {
    notFound();
  }

  const origin = getAppOrigin();
  return buildMetadataFromPayload(payload, origin);
}

export default async function SharePage({ params }: PageProps) {
  const { code } = await params;
  const payload = await ShareService.getSharePayload(code);

  if (!payload || payload.visibility === 'private') {
    notFound();
  }

  const userAgent = (await headers()).get('user-agent') ?? '';
  const isBot = /bot|crawl|spider|slurp|facebookexternalhit|twitterbot/i.test(
    userAgent,
  );

  if (!isBot) {
    redirect(payload.targetUrl);
  }

  const origin = getAppOrigin();

  return (
    <main className="min-h-screen px-4 py-12 text-neutral-50 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-neutral-800 bg-white text-neutral-900 shadow-2xl">
        <SharePreview payload={payload} origin={origin} />
      </div>
    </main>
  );
}
