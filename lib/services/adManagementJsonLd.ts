import { formatEther } from 'viem';

import { isProduction } from '@/constants/env';
import { listHarbergerSlotMetadata } from '@/constants/harbergerSlotsMetadata';
import { buildAbsoluteUrl } from '@/lib/utils/url';
import type { HarbergerSlotMetadata } from '@/types/harbergerSlotMetadata';

const AD_MANAGEMENT_ROUTE = '/ad-management';

const ACTIVE_STATUS_URL = 'https://schema.org/InStock';
const INACTIVE_STATUS_URL = 'https://schema.org/OutOfStock';

interface AdManagementOverview {
  slots: HarbergerSlotMetadata[];
  totalSlots: number;
  activeSlots: number;
  enabledSlots: number;
  shieldedSlots: number;
  pageLabels: string[];
}

export function resolveAdManagementChainId(): number {
  return isProduction ? 1 : 11155111;
}

export function getAdManagementOverview(): AdManagementOverview {
  const slots = listHarbergerSlotMetadata(resolveAdManagementChainId());

  const totalSlots = slots.length;
  let activeSlots = 0;
  let enabledSlots = 0;
  let shieldedSlots = 0;

  const pageLabelSet = new Set<string>();

  slots.forEach((slot) => {
    if (slot.isActive) {
      activeSlots += 1;
    }

    const slotType = slot.contractMeta?.slotType;
    if (slotType === 'enabled') {
      enabledSlots += 1;
    } else if (slotType === 'shielded') {
      shieldedSlots += 1;
    }

    const formattedPage = formatLabel(slot.page);
    if (formattedPage) {
      pageLabelSet.add(formattedPage);
    }
  });

  return {
    slots,
    totalSlots,
    activeSlots,
    enabledSlots,
    shieldedSlots,
    pageLabels: Array.from(pageLabelSet).sort(),
  };
}

export function buildAdManagementJsonLd(): Array<Record<string, unknown>> {
  const { slots } = getAdManagementOverview();
  const pageUrl = buildAbsoluteUrl(AD_MANAGEMENT_ROUTE);

  const jsonLdNodes: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#ad-management`,
      url: pageUrl,
      name: 'ECF Pensieve Harberger Ad Management',
      description:
        'Manage continuous auction ad placements on ECF Pensieve using Harberger tax slots.',
    },
  ];

  const itemListElements = slots
    .map((slot, index) => buildSlotListItem(slot, index, pageUrl))
    .filter((value): value is Record<string, unknown> => Boolean(value));

  if (itemListElements.length > 0) {
    jsonLdNodes.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Harberger Ad Slots',
      description:
        'Registered advertising slots available for claim or takeover through the Harberger tax marketplace.',
      url: pageUrl,
      numberOfItems: itemListElements.length,
      itemListOrder: 'ItemListOrderAscending',
      itemListElement: itemListElements,
    });
  }

  return jsonLdNodes;
}

function buildSlotListItem(
  slot: HarbergerSlotMetadata,
  index: number,
  pageUrl: string,
): Record<string, unknown> | null {
  const slotUrl = `${pageUrl}#slot-${slot.slotAddress.toLowerCase()}`;
  const slotName = resolveSlotName(slot, index);
  const offer = buildSlotOffer(slot, slotUrl, slotName);

  if (!offer) {
    return null;
  }

  return {
    '@type': 'ListItem',
    position: index + 1,
    name: slotName,
    item: offer,
  };
}

function buildSlotOffer(
  slot: HarbergerSlotMetadata,
  slotUrl: string,
  slotName: string,
): Record<string, unknown> | null {
  const description = buildSlotDescription(slot);

  const additionalProperty = buildSlotProperties(slot);

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    '@id': `${slotUrl}-offer`,
    url: slotUrl,
    name: slotName,
    category: 'Advertising Slot',
    availability: slot.isActive ? ACTIVE_STATUS_URL : INACTIVE_STATUS_URL,
    itemOffered: {
      '@type': 'Service',
      name: slotName,
      serviceType: 'Digital advertising placement',
      provider: {
        '@type': 'Organization',
        name: 'ECF Pensieve',
      },
      areaServed: 'Global',
    },
  };

  if (description) {
    offer.description = description;
  }

  if (additionalProperty.length > 0) {
    offer.additionalProperty = additionalProperty;
  }

  return offer;
}

function buildSlotDescription(slot: HarbergerSlotMetadata): string | undefined {
  const parts: string[] = [];

  const page = formatLabel(slot.page);
  const position = formatLabel(slot.position);

  if (page) {
    parts.push(`Page: ${page}`);
  }

  if (position) {
    parts.push(`Placement: ${position}`);
  }

  const slotType = slot.contractMeta?.slotType
    ? formatLabel(slot.contractMeta.slotType)
    : undefined;

  if (slotType) {
    parts.push(`Slot Type: ${slotType}`);
  }

  const dimensions = describeCreativeDimensions(slot);
  if (dimensions) {
    parts.push(`Creative Guidelines: ${dimensions}`);
  }

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(' | ');
}

function buildSlotProperties(
  slot: HarbergerSlotMetadata,
): Array<Record<string, unknown>> {
  const properties: Array<Record<string, unknown>> = [];

  const addProperty = (name: string, value?: string) => {
    const safeValue = value?.trim();
    if (!safeValue) {
      return;
    }
    properties.push({
      '@type': 'PropertyValue',
      name,
      value: safeValue,
    });
  };

  addProperty('Contract Address', slot.slotAddress);

  const page = formatLabel(slot.page);
  addProperty('Page', page);

  const position = formatLabel(slot.position);
  addProperty('Placement', position);

  const dimensions = describeCreativeDimensions(slot);
  addProperty('Creative Dimensions', dimensions);

  const meta = slot.contractMeta;

  if (meta) {
    addProperty('Slot Type', formatLabel(meta.slotType));
    addProperty('Minimum Valuation', formatWei(meta.minValuationWei));
    addProperty('Tax Rate', formatBps(meta.annualTaxRateBps));
    addProperty('Bond Rate', formatBps(meta.bondRateBps));
    addProperty('Minimum Bid Increment', formatBps(meta.minBidIncrementBps));
    addProperty('Tax Period', formatDuration(meta.taxPeriodSeconds));
    addProperty('Content Update Limit', formatCount(meta.contentUpdateLimit));
    addProperty('Dust Rate', formatBps(meta.dustRateBps));
  }

  const extras = slot.extra ?? {};
  Object.entries(extras).forEach(([key, rawValue]) => {
    const label = formatLabel(key);
    const value =
      typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);
    addProperty(label, value);
  });

  return properties;
}

function resolveSlotName(slot: HarbergerSlotMetadata, index: number): string {
  const name = slot.slotDisplayName?.trim();
  if (name) {
    return name;
  }

  const page = formatLabel(slot.page);
  const position = formatLabel(slot.position);

  if (page && position) {
    return `${page} ${position} Slot`;
  }

  if (page) {
    return `${page} Slot`;
  }

  return `Ad Slot ${index + 1}`;
}

function describeCreativeDimensions(
  slot: HarbergerSlotMetadata,
): string | undefined {
  const dimensions = slot.creativeDimensions;
  if (!dimensions) {
    return undefined;
  }

  const parts: string[] = [];

  if (dimensions.desktop) {
    parts.push(
      `Desktop ${dimensions.desktop.width}×${dimensions.desktop.height}`,
    );
  }

  if (dimensions.mobile) {
    parts.push(`Mobile ${dimensions.mobile.width}×${dimensions.mobile.height}`);
  }

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(' / ');
}

function formatLabel(value?: string): string {
  if (!value) {
    return '';
  }

  const formatted = value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();

  if (!formatted) {
    return '';
  }

  return formatted.replace(/(^|\s)(\w)/g, (match) => match.toUpperCase());
}

function formatWei(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const eth = formatEther(BigInt(value));
    const numeric = Number.parseFloat(eth);
    if (Number.isFinite(numeric)) {
      return `${numeric.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      })} ETH`;
    }
    return `${eth} ETH`;
  } catch (error) {
    return undefined;
  }
}

function formatBps(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  const percent = numeric / 100;
  return `${percent.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

function formatDuration(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const seconds = Number.parseInt(value, 10);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }

  const units = [
    { label: 'd', value: 86_400 },
    { label: 'h', value: 3_600 },
    { label: 'm', value: 60 },
  ];

  const parts: string[] = [];
  let remaining = seconds;

  for (const unit of units) {
    if (remaining >= unit.value) {
      const quantity = Math.floor(remaining / unit.value);
      parts.push(`${quantity}${unit.label}`);
      remaining %= unit.value;
    }

    if (parts.length >= 2) {
      break;
    }
  }

  if (parts.length === 0 && remaining > 0) {
    parts.push(`${remaining}s`);
  }

  return parts.join(' ');
}

function formatCount(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }

  return numeric.toString();
}
