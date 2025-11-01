import type { CSSProperties, JSX } from 'react';

import { buildAbsoluteUrl } from '@/lib/utils/url';

import type { SharePayload } from './shareService';
import { getGenericStatValue } from './shareUtils';

export function MetricItem({
  origin,
  icon,
  label,
  value,
  alt,
  iconWidth = 24,
  iconHeight = 24,
  styles,
  valueFallback = 'N/A',
}: MetricItemProps): JSX.Element {
  const hasValue = value !== undefined && value !== null && value !== '';
  const displayValue = hasValue ? value : valueFallback;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    width: 'auto',
    gap: '5px',
    ...styles?.container,
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    opacity: 0.5,
    ...styles?.row,
  };

  const iconStyle: CSSProperties = {
    opacity: 0.5,
    ...styles?.icon,
  };

  const valueStyle: CSSProperties = {
    fontSize: '18px',
    lineHeight: '24px',
    color: 'black',
    fontFamily: 'Mona Sans',
    fontWeight: 500,
    ...styles?.value,
  };

  const labelStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    color: 'rgba(0,0,0,0.5)',
    ...styles?.label,
  };

  const resolvedIconWidth = iconWidth ?? 24;
  const resolvedIconHeight = iconHeight ?? 24;

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <img
          src={buildAbsoluteUrl(icon, origin)}
          width={resolvedIconWidth}
          height={resolvedIconHeight}
          alt={alt ?? label}
          style={iconStyle}
        />
        <span style={valueStyle}>{String(displayValue)}</span>
      </div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}
interface MetricItemStyleOverrides {
  container?: CSSProperties;
  row?: CSSProperties;
  icon?: CSSProperties;
  value?: CSSProperties;
  label?: CSSProperties;
}

export interface MetricItemProps {
  origin: string;
  icon: string;
  label: string;
  value?: string | number | null;
  alt?: string;
  iconWidth?: number;
  iconHeight?: number;
  styles?: MetricItemStyleOverrides;
  valueFallback?: string;
}
export function renderShareFooter(origin: string): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        opacity: '0.3',
      }}
    >
      <img
        src={`${origin}/images/share/Logo.svg`}
        width={137}
        height={20}
        alt="Logo"
      />
    </div>
  );
}
export function renderTagPills(tags: string[]): JSX.Element | null {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        maxHeight: '56px',
        overflow: 'hidden',
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            padding: '5px 10px',
            borderRadius: '4px',
            background: 'rgba(0,0,0,0.05)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(0,0,0,0.7)',
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
export function renderMetricRow(
  payload: SharePayload,
  layout: ReadonlyArray<{
    key: string;
    label: string;
    icon: string;
  }>,
  origin: string,
): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '20px',
      }}
    >
      {layout.map((stat) => (
        <MetricItem
          key={stat.key}
          origin={origin}
          icon={stat.icon}
          label={stat.label}
          value={getGenericStatValue(payload, stat.key)}
        />
      ))}
    </div>
  );
}
export function resolveProjectTags(payload: SharePayload): string[] {
  const tags = payload.metadata.tags?.length
    ? payload.metadata.tags
    : (payload.metadata.project.categories ?? []);
  return tags.filter(Boolean).slice(0, 4);
}
