import { Metadata } from 'next';

import {
  buildAdManagementJsonLd,
  getAdManagementOverview,
} from '@/lib/services/adManagementJsonLd';
import { buildAbsoluteUrl } from '@/lib/utils/url';

const AD_MANAGEMENT_ROUTE = '/ad-management';

export async function generateMetadata(): Promise<Metadata> {
  const { totalSlots, activeSlots, enabledSlots, shieldedSlots, pageLabels } =
    getAdManagementOverview();

  const slotSummary = buildSlotSummary(
    totalSlots,
    activeSlots,
    enabledSlots,
    shieldedSlots,
  );

  const pageSummary = buildPageSummary(pageLabels);

  const description =
    'Manage Harberger tax advertising slots on ECF Pensieve. Claim, renew, and take over placements using on-chain auctions that keep ads accountable.' +
    slotSummary +
    pageSummary;

  const keywords = [
    'ECF Pensieve ad management',
    'Harberger tax advertising',
    'on-chain ad slots',
    'web3 marketing operations',
  ];

  const pageUrl = buildAbsoluteUrl(AD_MANAGEMENT_ROUTE);

  return {
    title: 'Ad Management | ECF Pensieve',
    description,
    keywords,
    openGraph: {
      title: 'Ad Management | ECF Pensieve',
      description,
      url: pageUrl,
      images: ['/images/home-og.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ad Management | ECF Pensieve',
      description,
    },
  };
}

export default function AdManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdNodes = buildAdManagementJsonLd();
  const jsonLdString = JSON.stringify(jsonLdNodes);

  return (
    <>
      <script
        id="ad-management-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      {children}
    </>
  );
}

function buildSlotSummary(
  totalSlots: number,
  activeSlots: number,
  enabledSlots: number,
  shieldedSlots: number,
): string {
  if (totalSlots === 0) {
    return '';
  }

  const segments: string[] = [];

  segments.push(`${totalSlots} registered slots`);

  if (activeSlots > 0) {
    segments.push(`${activeSlots} active`);
  }

  if (enabledSlots > 0 || shieldedSlots > 0) {
    const variants: string[] = [];
    if (enabledSlots > 0) {
      variants.push(`${enabledSlots} enabled`);
    }
    if (shieldedSlots > 0) {
      variants.push(`${shieldedSlots} shielded`);
    }
    if (variants.length > 0) {
      segments.push(variants.join(', '));
    }
  }

  if (segments.length === 0) {
    return '';
  }

  return ` Currently tracking ${segments.join(' | ')}.`;
}

function buildPageSummary(pageLabels: string[]): string {
  if (!pageLabels || pageLabels.length === 0) {
    return '';
  }

  const formatted = pageLabels.join(', ');
  return ` Featured across ${formatted} views.`;
}
