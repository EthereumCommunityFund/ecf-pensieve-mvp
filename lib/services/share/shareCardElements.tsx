import type { JSX } from 'react';

import { QUORUM_AMOUNT } from '@/lib/constants';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import type { ShareItemMetadata, SharePayload } from './shareService';

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

const PUBLISHED_PROJECT_STATS = [
  {
    key: 'transparency',
    label: 'Transparency',
    icon: '/images/share/PlayCircle.svg',
  },
  {
    key: 'communityVotes',
    label: 'Community Votes',
    icon: '/images/share/CaretCircleUp.svg',
  },
  {
    key: 'totalContributions',
    label: 'Total Contributions',
    icon: '/images/share/Users.svg',
  },
] as const;

const PENDING_PROJECT_STATS = [
  {
    key: 'progress',
    label: 'Progress',
    icon: '/images/share/PlayCircle.svg',
  },
  {
    key: 'totalProposals',
    label: 'Total Proposals',
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

function getGenericStatValue(payload: SharePayload, key: string): string {
  return (
    payload.metadata.stats?.find((stat) => stat.key === key)?.primary ?? '—'
  );
}

function renderShareFooter(origin: string): JSX.Element {
  return (
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
  );
}

function renderTagPills(tags: string[]): JSX.Element | null {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 10px',
            borderRadius: '6px',
            background: 'rgba(0,0,0,0.05)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(0,0,0,0.7)',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function renderMetricRow(
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
                color: 'rgba(0,0,0,0.65)',
              }}
            >
              {getGenericStatValue(payload, stat.key)}
            </span>
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              color: 'rgba(0,0,0,0.45)',
            }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
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

      {/* Footer */}
      {renderShareFooter(origin)}
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
      {renderShareFooter(origin)}
    </div>
  );
}

function resolveProjectTags(payload: SharePayload): string[] {
  const tags = payload.metadata.tags?.length
    ? payload.metadata.tags
    : (payload.metadata.project.categories ?? []);
  return tags.filter(Boolean).slice(0, 4);
}

function renderPublishedProjectCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const projectLogo = buildAbsoluteUrl(
    payload.metadata.project.logoUrl ?? '/pensieve-logo.svg',
    origin,
  );
  const tags = resolveProjectTags(payload);

  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        padding: '24px',
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`,
        background: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        rowGap: '24px',
        fontFamily: FONT_FAMILY,
        color: COLORS.name,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '18px',
        }}
      >
        <img
          src={projectLogo}
          width={72}
          height={72}
          alt={payload.metadata.project.name || 'Project logo'}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            objectFit: 'cover',
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#F5F5F5',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
            flex: '1 1 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: '6px',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 600 }}>
              {payload.metadata.project.name}
            </span>
            {payload.metadata.subtitle && (
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.65)',
                }}
              >
                {payload.metadata.subtitle}
              </span>
            )}
            {payload.metadata.description && (
              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(0,0,0,0.55)',
                  lineHeight: '20px',
                }}
              >
                {payload.metadata.description}
              </span>
            )}
          </div>
          {renderTagPills(tags)}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'rgba(0,0,0,0.08)',
        }}
      />

      {renderMetricRow(payload, PUBLISHED_PROJECT_STATS, origin)}

      {renderShareFooter(origin)}
    </div>
  );
}

function renderPendingProjectCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const statusLabel = payload.metadata.statusBadge?.label ?? 'Pending Project';
  const tags = resolveProjectTags(payload);

  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`,
        background: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        rowGap: '20px',
        fontFamily: FONT_FAMILY,
        color: COLORS.name,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(126,169,255,0.40)',
            background: 'rgba(126,169,255,0.12)',
            color: '#608BE1',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          <img
            src={`${origin}/images/share/GitPullRequest.svg`}
            width={24}
            height={24}
            alt="Pending Project"
          />
          <span>{statusLabel}</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '6px',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 600 }}>
            {payload.metadata.project.name}
          </span>
          {payload.metadata.subtitle && (
            <span
              style={{
                fontSize: '16px',
                color: 'rgba(0,0,0,0.65)',
              }}
            >
              {payload.metadata.subtitle}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'rgba(0,0,0,0.08)',
        }}
      />

      {renderMetricRow(payload, PENDING_PROJECT_STATS, origin)}

      {renderShareFooter(origin)}
    </div>
  );
}

function renderShareCard(
  payload: SharePayload,
  options: ShareCardOptions = {},
): JSX.Element {
  switch (payload.layout) {
    case 'proposal':
      return renderProposalCard(payload, options);
    case 'project': {
      const isPublished = payload.metadata.project.isPublished ?? true;
      return isPublished
        ? renderPublishedProjectCard(payload, options)
        : renderPendingProjectCard(payload, options);
    }
    case 'projectPublished':
      return renderPublishedProjectCard(payload, options);
    case 'projectPending':
      return renderPendingProjectCard(payload, options);
    default:
      return renderFallbackCard(payload, options);
  }
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

function renderItemProposalBody(
  item: ShareItemMetadata | undefined,
  origin: string,
): JSX.Element | null {
  if (!item) {
    return null;
  }

  switch (item.type) {
    case 'item':
    case undefined: {
      const itemStats = [
        {
          label: 'Updates',
          icon: '/UploadSimple.svg',
          alt: 'Updates icon',
          value: item.updates,
        },
        {
          label: 'Submissions',
          icon: '/Users.svg',
          alt: 'Submissions icon',
          value: item.submissions,
        },
        {
          label: 'Item weight',
          icon: '/CaretCircleUp.svg',
          alt: 'Item weight icon',
          value: item.weight,
        },
      ];

      return (
        <div
          style={{
            width: '100%',
            height: '141px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: '40px',
          }}
        >
          {itemStats.map(({ label, icon, alt, value }) => (
            <div
              key={label}
              style={{
                width: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '10px',
              }}
            >
              <div
                style={{
                  height: '50px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <img
                  src={buildAbsoluteUrl(icon, origin)}
                  width={48}
                  height={48}
                  alt={alt}
                />
                <div
                  style={{
                    height: '50px',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'black',
                    fontSize: 18,
                    fontFamily: 'Mona Sans',
                    fontWeight: '500',
                    lineHeight: 24,
                    wordWrap: 'break-word',
                  }}
                >
                  {value ?? 'N/A'}
                </div>
              </div>
              <div
                style={{
                  height: '50px',
                  opacity: 0.5,
                  color: 'black',
                  fontSize: 24,
                  fontFamily: 'Mona Sans',
                  fontWeight: '500',
                  wordWrap: 'break-word',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'pending':
      const pendingStats = [
        {
          label: 'Supported',
          icon: '/Users.svg',
          alt: 'Supported icon',
          value: `${item.supported} of ${QUORUM_AMOUNT}`,
        },
        {
          label: 'Item weight',
          icon: '/CaretCircleUp.svg',
          alt: 'Item weight icon',
          value: item.weight,
        },
      ];
      return (
        <div
          style={{
            width: '100%',
            height: '141px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '40px',
          }}
        >
          <div
            style={{
              padding: '10px 20px 10px 20px',
              height: '80px',
              border: '1px solid rgba(126, 169, 255, 0.4)',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(126, 169, 255, 0.1)',
            }}
          >
            <img
              src={buildAbsoluteUrl('/GitPullRequest.svg', origin)}
              width={56}
              height={56}
              alt="Git pull request"
            />
            <div
              style={{
                color: '#608BE1',
                fontSize: 24,
                fontFamily: 'Mona Sans',
                fontWeight: '500',
                wordWrap: 'break-word',
              }}
            >
              Pending Validation
            </div>
          </div>

          {pendingStats.map(({ label, icon, alt, value }) => (
            <div
              key={label}
              style={{
                width: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '10px',
              }}
            >
              <div
                style={{
                  height: '50px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <img
                  src={buildAbsoluteUrl(icon, origin)}
                  width={48}
                  height={48}
                  alt={alt}
                />
                <div
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'black',
                    fontSize: 18,
                    fontFamily: 'Mona Sans',
                    fontWeight: '500',
                    lineHeight: 24,
                    wordWrap: 'break-word',
                  }}
                >
                  {value ?? 'N/A'}
                </div>
              </div>
              <div
                style={{
                  opacity: 0.5,
                  color: 'black',
                  fontSize: 24,
                  fontFamily: 'Mona Sans',
                  fontWeight: '500',
                  wordWrap: 'break-word',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      );
    case 'empty':
      const emptyStats = [
        {
          label: 'Starting weight',
          icon: '/CoinVertical.svg',
          alt: 'Starting weight icon',
          value: item.initialWeight,
        },
      ];
      return (
        <div
          style={{
            width: '100%',
            height: '141px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '40px',
          }}
        >
          <div
            style={{
              padding: '10px 20px 10px 20px',
              height: '80px',
              border: '1px solid rgba(126, 169, 255, 0.4)',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(126, 169, 255, 0.1)',
            }}
          >
            <img
              src={buildAbsoluteUrl('/PencilCircle.svg', origin)}
              width={56}
              height={56}
              alt="Pencil circle"
            />
            <div
              style={{
                color: '#608BE1',
                fontSize: 24,
                fontFamily: 'Mona Sans',
                fontWeight: '500',
                wordWrap: 'break-word',
              }}
            >
              Empty Item
            </div>
          </div>

          {emptyStats.map(({ label, icon, alt, value }) => (
            <div
              key={label}
              style={{
                width: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '10px',
              }}
            >
              <div
                style={{
                  height: '50px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <img
                  src={buildAbsoluteUrl(icon, origin)}
                  width={48}
                  height={48}
                  alt={alt}
                />
                <div
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'black',
                    fontSize: 18,
                    fontFamily: 'Mona Sans',
                    fontWeight: '500',
                    lineHeight: 24,
                    wordWrap: 'break-word',
                  }}
                >
                  {value ?? 'N/A'}
                </div>
              </div>
              <div
                style={{
                  height: '50px',
                  opacity: 0.5,
                  color: 'black',
                  fontSize: 24,
                  fontFamily: 'Mona Sans',
                  fontWeight: '500',
                  wordWrap: 'break-word',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function renderItemProposalOgImage(
  payload: SharePayload,
  origin: string,
): JSX.Element {
  const logoUrl = payload.metadata.project.logoUrl;
  const projectName = truncate(payload.metadata.project.name ?? '', 36);
  const itemName = truncate(payload.metadata.item?.key ?? '', 36);
  const category = truncate(payload.metadata.item?.category ?? '', 36);
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        fontFamily: 'MonaSans',
        color: '#0C1C22',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '100px',
        }}
      >
        <div
          style={{
            width: '100%',
            gap: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              height: '100px',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
              justifyContent: 'flex-start',
            }}
          >
            <img
              src={logoUrl!}
              width={100}
              height={100}
              style={{
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 10,
                background: 'white',
                objectFit: 'contain',
              }}
              alt="Project Logo"
            />
            <div
              style={{
                opacity: 0.8,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: 'black',
                fontSize: 30,
                fontFamily: 'Inter',
                fontWeight: '1800',
                lineHeight: 35,
                wordWrap: 'break-word',
              }}
            >
              {projectName}
            </div>
          </div>
          <div
            style={{
              width: '100%',
              height: '70px',
              paddingLeft: 20,
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
              display: 'flex',
            }}
          >
            <img
              src={buildAbsoluteUrl('/ArrowElbowDownRight.svg', origin)}
              width={30}
              height={39}
              alt="Arrow elbow down right"
            />
            <div
              style={{
                opacity: 0.5,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: 'black',
                fontSize: 25,
                fontFamily: 'Inter',
                fontWeight: '600',
                textTransform: 'capitalize',
                lineHeight: 24,
                wordWrap: 'break-word',
              }}
            >
              {category} /
            </div>
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: 'black',
                fontSize: 25,
                fontFamily: 'Inter',
                fontWeight: '600',
                textTransform: 'capitalize',
                lineHeight: 24,
                wordWrap: 'break-word',
              }}
            >
              {itemName}
            </div>
          </div>
        </div>
        {renderItemProposalBody(payload.metadata.item, origin)}
        <div
          style={{
            width: '100%',
            height: '35px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <img
            src={buildAbsoluteUrl('/new-pensieve-logo.svg', origin)}
            width={54}
            height={32}
            alt="New pensieve logo"
          />
          <div
            style={{
              color: 'black',
              fontSize: 22,
              fontFamily: 'Mona Sans',
              fontWeight: '600',
              wordWrap: 'break-word',
            }}
          >
            Pensieve.ecf
          </div>
        </div>
      </div>
    </div>
  );
}
