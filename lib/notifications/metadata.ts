import type { NotificationMetadata } from '@/types/notification';

const sanitizeString = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeUrl = (value?: string | null): string | undefined => {
  const sanitized = sanitizeString(value);
  if (!sanitized) return undefined;
  return sanitized;
};

const sanitizeNumber = (value?: number | null): number | undefined => {
  if (typeof value !== 'number') {
    return undefined;
  }

  return Number.isFinite(value) ? value : undefined;
};

export type ParsedNotificationMetadata = {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  targetUrl?: string;
  targetProjectId?: number;
  targetItemId?: number;
  extra?: Record<string, unknown>;
  raw: NotificationMetadata | null;
  hasTitle: boolean;
  hasBody: boolean;
  hasCta: boolean;
  hasNavigation: boolean;
};

export const parseNotificationMetadata = (
  metadata?: NotificationMetadata | null,
): ParsedNotificationMetadata => {
  const normalizedTitle = sanitizeString(metadata?.title);
  const normalizedBody = sanitizeString(metadata?.body);
  const normalizedCtaLabel = sanitizeString(metadata?.ctaLabel);
  const normalizedCtaUrl = sanitizeUrl(metadata?.ctaUrl);
  const normalizedTargetUrl = sanitizeUrl(metadata?.targetUrl);
  const normalizedTargetProjectId = sanitizeNumber(metadata?.targetProjectId);
  const normalizedTargetItemId = sanitizeNumber(metadata?.targetItemId);

  const hasNavigation =
    Boolean(normalizedTargetUrl) ||
    Boolean(normalizedCtaUrl) ||
    typeof normalizedTargetProjectId === 'number' ||
    typeof normalizedTargetItemId === 'number';

  return {
    title: normalizedTitle,
    body: normalizedBody,
    ctaLabel: normalizedCtaLabel,
    ctaUrl: normalizedCtaUrl,
    targetUrl: normalizedTargetUrl,
    targetProjectId: normalizedTargetProjectId,
    targetItemId: normalizedTargetItemId,
    extra: metadata?.extra,
    raw: metadata ?? null,
    hasTitle: Boolean(normalizedTitle),
    hasBody: Boolean(normalizedBody),
    hasCta: Boolean(normalizedCtaLabel && normalizedCtaUrl),
    hasNavigation,
  };
};

export const resolveMetadataTitle = (
  parsed: ParsedNotificationMetadata,
  fallback: string,
): string => {
  return parsed.title ?? fallback;
};

export const resolveMetadataBody = (
  parsed: ParsedNotificationMetadata,
  fallback?: string,
): string | undefined => {
  return parsed.body ?? fallback;
};

export const resolveMetadataCta = (
  parsed: ParsedNotificationMetadata,
  fallback?: { label?: string; url?: string },
): { label?: string; url?: string } => {
  return {
    label: parsed.ctaLabel ?? fallback?.label,
    url: parsed.ctaUrl ?? fallback?.url,
  };
};

export const resolveMetadataNavigationUrl = (
  parsed: ParsedNotificationMetadata,
  fallback?: string,
): string | undefined => {
  return parsed.targetUrl ?? parsed.ctaUrl ?? fallback;
};
