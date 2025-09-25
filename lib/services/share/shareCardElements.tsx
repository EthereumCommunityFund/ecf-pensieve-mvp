import type { JSX } from 'react';

import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import type { SharePayload } from './shareService';

interface ShareCardOptions {
  origin?: string;
  mode?: 'og' | 'preview';
}

const CARD_WIDTH = 540;
const FONT_FAMILY = 'Mona Sans, Inter, sans-serif';

const COLORS = {
  border: '#E1E5EE',
  background: '#FFFFFF',
  statusBg: '#EAF2FF',
  statusBorder: '#C2D8FF',
  statusText: '#1F5FD7',
  name: '#111827',
  muted: '#4B5563',
  statTitle: '#5C6478',
  statValue: '#101828',
  footer: '#7C8499',
  badgeBorder: 'rgba(45, 164, 120, 0.45)',
  badgeBg: '#EFFBF4',
};

const STAT_LAYOUT = [
  { key: 'progress', label: 'Progress', icon: '/images/share/PlayCircle.svg' },
  {
    key: 'support',
    label: 'Total Support',
    icon: '/images/share/CaretCircleUp.svg',
  },
  {
    key: 'participation',
    label: 'Minimum Participation',
    icon: '/images/share/Users.svg',
  },
] as const;

function truncate(text: string | undefined | null, limit: number): string {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function formatNumber(value: string | undefined): string {
  if (!value) return '0';
  const numeric = Number(value.replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(numeric)) {
    return value;
  }
  return new Intl.NumberFormat('en-US').format(numeric);
}

function getStatValue(
  payload: SharePayload,
  key: (typeof STAT_LAYOUT)[number]['key'],
): string {
  const direct = payload.metadata.stats?.find(
    (stat) => stat.key === key,
  )?.primary;
  const fallback =
    payload.metadata.highlights?.[
      STAT_LAYOUT.findIndex((item) => item.key === key)
    ]?.value;
  switch (key) {
    case 'progress':
      return direct ?? fallback ?? '0%';
    case 'support':
      return formatNumber(direct ?? fallback);
    case 'participation':
      return direct ?? fallback ?? '0 / 0';
    default:
      return '—';
  }
}

function renderProposalCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const projectLogo = buildAbsoluteUrl(
    payload.metadata.project.logoUrl ?? '/pensieve-logo.svg',
    origin,
  );
  const statusLabel = payload.metadata.statusBadge?.label ?? 'Pending Project';
  const proposalBadge =
    payload.metadata.badges?.find((badge) =>
      badge.label?.toLowerCase().includes('proposal'),
    )?.label ?? 'Proposal';
  const leadingBadge =
    payload.metadata.badges?.find((badge) =>
      badge.label?.toLowerCase().includes('leading'),
    )?.label ?? null;

  const containerStyle: React.CSSProperties = {
    width: `${CARD_WIDTH}px`,
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: '#fff',
    boxSizing: 'border-box',
    fontFamily: FONT_FAMILY,
    color: COLORS.name,
    display: 'flex',
    flexDirection: 'column',
  };

  if (options.mode === 'preview') {
    containerStyle.boxShadow = '0px 18px 36px rgba(102, 112, 134, 0.18)';
  }

  return (
    <div style={containerStyle}>
      {/* Status Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '5px',
          height: '38px',
          padding: '5px 10px',
          borderRadius: '4px',
          textAlign: 'center',
          border: `1px solid rgba(126, 169, 255, 0.40)`,
          background: 'rgba(126, 169, 255, 0.10)',
        }}
      >
        <img
          src={`${origin}/images/share/GitPullRequest.svg`}
          width={28}
          height={28}
          alt="Pending Project"
        />
        <span
          style={{
            fontFamily: 'Mona Sans',
            fontSize: '18px',
            fontWeight: 500,
            color: '#608BE1',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* proposal name status */}
      <div
        style={{
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '8px',
            flex: '1 1 auto',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 600 }}>
            {truncate(payload.metadata.project.name, 34)}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
              gap: '10px',
            }}
          >
            <img
              src={`${origin}/images/share/ArrowElbowDownRight.png`}
              width={24}
              height={24}
              alt="ArrowElbowDownRight"
            />
            <span style={{ fontWeight: 600, fontSize: '20px', opacity: 0.5 }}>
              {proposalBadge}
            </span>
            {leadingBadge && (
              <span
                style={{
                  height: '32px',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: `1px solid rgba(104, 204, 174, 0.80)`,
                  background: COLORS.badgeBg,
                  color: '#40A486',
                  fontSize: '16px',
                  lineHeight: '22px',
                }}
              >
                {leadingBadge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* divide line */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'rgba(0,0,0,0.1)',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      />

      {/* vote info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '20px',
        }}
      >
        {STAT_LAYOUT.map((stat) => (
          <div
            key={stat.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <img
                src={`${origin}${stat.icon}`}
                width={24}
                height={24}
                alt={stat.key}
                style={{ opacity: 0.5 }}
              />
              <span
                style={{
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.5)',
                }}
              >
                {getStatValue(payload, stat.key)}
              </span>
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                color: 'rgba(0,0,0,0.5)',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Logo */}
      <div
        style={{
          marginTop: '20px',
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
    </div>
  );
}

function renderFallbackCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const projectLogo = buildAbsoluteUrl(
    payload.metadata.project.logoUrl ?? '/pensieve-logo.svg',
    origin,
  );

  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        padding: '28px',
        borderRadius: '16px',
        border: `1px solid ${COLORS.border}`,
        background: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        rowGap: '14px',
        fontFamily: FONT_FAMILY,
      }}
    >
      <span style={{ fontSize: '24px', fontWeight: 700 }}>
        {payload.metadata.title}
      </span>
      {payload.metadata.subtitle && (
        <span style={{ fontSize: '16px', color: COLORS.muted }}>
          {payload.metadata.subtitle}
        </span>
      )}
      {payload.metadata.description && (
        <span style={{ fontSize: '14px', color: COLORS.muted }}>
          {payload.metadata.description}
        </span>
      )}
      <img
        src={projectLogo}
        alt="Preview"
        width={120}
        height={120}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '12px',
          objectFit: 'cover',
          border: '1px solid #E2E6F0',
        }}
      />
    </div>
  );
}

function renderShareCard(
  payload: SharePayload,
  options: ShareCardOptions = {},
): JSX.Element {
  if (payload.layout === 'proposal') {
    return renderProposalCard(payload, options);
  }
  return renderFallbackCard(payload, options);
}

export function renderShareCardForOg(
  payload: SharePayload,
  origin: string,
): JSX.Element {
  return renderShareCard(payload, { origin, mode: 'og' });
}

export function renderShareCardForPreview(
  payload: SharePayload,
  origin?: string,
): JSX.Element {
  return renderShareCard(payload, { origin, mode: 'preview' });
}
