import type { CSSProperties, JSX } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { SHARE_CARD_WIDTH } from '@/constants/share';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { ALL_POC_ITEM_MAP, QUORUM_AMOUNT } from '@/lib/constants';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import {
  MetricItem,
  renderMetricRow,
  renderShareFooter,
  renderTagPills,
  resolveProjectTags,
} from './baseComponents';
import type { ShareItemMetadata, SharePayload } from './shareService';
import {
  formatInteger,
  formatReadableKey,
  getStatValue,
  truncate,
} from './shareUtils';

interface EmptyItemSharePayloadOptions {
  project: {
    id?: number;
    name?: string;
    tagline?: string | null;
    categories?: string[] | null;
    logoUrl?: string | null;
    isPublished?: boolean | null;
  };
  itemKey?: string | null;
  fallbackUrl: string;
}

interface ShareCardOptions {
  origin?: string;
  mode?: 'og' | 'preview';
}

const FONT_FAMILY = 'Mona Sans, Inter, sans-serif';

export const STAT_LAYOUT = [
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
    icon: '/images/share/ShieldStar.svg',
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

function renderProposalCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const isOgMode = options.mode === 'og';
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

  const containerStyle: CSSProperties = {
    width: `${SHARE_CARD_WIDTH}px`,
    padding: '20px',
    borderRadius: '8px',
    border: isOgMode ? 'none' : `1px solid rgba(0,0,0,0.1)`,
    background: '#fff',
    boxSizing: 'border-box',
    fontFamily: FONT_FAMILY,
    color: '#111827',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
                  background: '#EFFBF4',
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
  const isOgMode = options.mode === 'og';
  const containerStyle: CSSProperties = {
    width: `${SHARE_CARD_WIDTH}px`,
    padding: '28px',
    borderRadius: '16px',
    border: isOgMode ? 'none' : `1px solid rgba(0,0,0,0.1)`,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '14px',
    fontFamily: FONT_FAMILY,
  };

  return (
    <div style={containerStyle}>
      <span style={{ fontSize: '24px', fontWeight: 700 }}>
        {payload.metadata.title}
      </span>
      {payload.metadata.subtitle && (
        <span style={{ fontSize: '16px', color: '#4B5563' }}>
          {payload.metadata.subtitle}
        </span>
      )}
      {payload.metadata.description && (
        <span style={{ fontSize: '14px', color: '#4B5563' }}>
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

function renderPublishedProjectCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const isOgMode = options.mode === 'og';
  const projectLogo = buildAbsoluteUrl(
    payload.metadata.project.logoUrl ?? '/pensieve-logo.svg',
    origin,
  );
  const tags = resolveProjectTags(payload);

  return (
    <div
      style={{
        width: `${SHARE_CARD_WIDTH}px`,
        padding: '24px',
        borderRadius: '12px',
        border: isOgMode ? 'none' : `1px solid rgba(0,0,0,0.1)`,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        rowGap: '24px',
        fontFamily: FONT_FAMILY,
        color: '#111827',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <img
          src={projectLogo}
          width={60}
          height={60}
          alt={payload.metadata.project.name || 'Project logo'}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '5px',
            objectFit: 'cover',
            border: '1px solid rgba(0,0,0,0.1)',
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
              rowGap: '5px',
            }}
          >
            <span
              style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.2 }}
            >
              {payload.metadata.project.name}
            </span>
            {payload.metadata.subtitle && (
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.65)',
                  lineHeight: '18px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxHeight: '36px',
                }}
              >
                {payload.metadata.subtitle}
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

function renderItemProposalCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const isOgMode = options.mode === 'og';
  const projectLogo = buildAbsoluteUrl(
    payload.metadata.project.logoUrl ?? '/pensieve-logo.svg',
    origin,
  );
  const projectName = truncate(payload.metadata.project.name, 36);
  const itemName = truncate(payload.metadata.item?.key, 36);
  const categoryName = truncate(payload.metadata.item?.category, 36);

  const containerStyle: CSSProperties = {
    width: `${SHARE_CARD_WIDTH}px`,
    padding: '20px',
    borderRadius: '12px',
    border: isOgMode ? 'none' : `1px solid rgba(0,0,0,0.1)`,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '20px',
    fontFamily: FONT_FAMILY,
  };

  if (options.mode === 'preview') {
    containerStyle.boxShadow = '0px 18px 36px rgba(102, 112, 134, 0.18)';
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <img
            src={projectLogo}
            width={60}
            height={60}
            alt={payload.metadata.project.name || 'Project logo'}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '5px',
              objectFit: 'cover',
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#fff',
            }}
          />
          <span
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'rgba(0,0,0,0.8)',
              lineHeight: 1.2,
            }}
          >
            {projectName}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '20px',
            fontWeight: 500,
            color: '#000',
          }}
        >
          <img
            src={buildAbsoluteUrl('/ArrowElbowDownRight.svg', origin)}
            width={24}
            height={24}
            alt="Category"
            style={{ opacity: 0.5, marginTop: '3px' }}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <span style={{ opacity: 0.5 }}>{categoryName}</span>
            <span style={{ color: 'rgba(0,0,0,0.35)' }}>/</span>
            <span style={{}}>{itemName}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'block',
          height: '1px',
          background: 'rgba(0,0,0,0.1)',
        }}
      ></div>

      {renderItemProposalBody(payload.metadata.item, origin)}

      {renderShareFooter(origin)}
    </div>
  );
}

function renderPendingProjectCard(
  payload: SharePayload,
  options: ShareCardOptions,
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  const isOgMode = options.mode === 'og';
  const statusLabel = payload.metadata.statusBadge?.label ?? 'Pending Project';
  const tags = resolveProjectTags(payload);

  const containerStyle: CSSProperties = {
    width: `${SHARE_CARD_WIDTH}px`,
    padding: '20px',
    borderRadius: '12px',
    border: isOgMode ? 'none' : `1px solid rgba(0,0,0,0.1)`,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '20px',
    fontFamily: FONT_FAMILY,
    color: '#111827',
  };

  return (
    <div style={containerStyle}>
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
                fontWeight: 500,
                lineHeight: '18px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '36px',
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
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: '15px',
          }}
        >
          {itemStats.map(({ label, icon, alt, value }) => (
            <MetricItem
              key={label}
              origin={origin}
              icon={icon}
              alt={alt}
              label={label}
              value={value}
            />
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
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '20px',
          }}
        >
          <div
            style={{
              padding: '5px 10px',
              border: '1px solid rgba(126, 169, 255, 0.4)',
              borderRadius: '4px',
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
              width={24}
              height={24}
              alt="Git pull request"
            />
            <div
              style={{
                color: '#608BE1',
                fontSize: 16,
                fontFamily: 'Mona Sans',
                fontWeight: '500',
                wordWrap: 'break-word',
              }}
            >
              Pending Validation
            </div>
          </div>

          {pendingStats.map(({ label, icon, alt, value }) => (
            <MetricItem
              key={label}
              origin={origin}
              icon={icon}
              alt={alt}
              label={label}
              value={value}
            />
          ))}
        </div>
      );
    case 'empty':
      const emptyStats = [
        {
          label: 'Starting weight',
          icon: '/CoinVertical.svg',
          alt: 'Starting weight icon',
          value: item.initialWeight ?? '0',
        },
      ];
      return (
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '20px',
          }}
        >
          <div
            style={{
              padding: '5px 10px',
              border: '1px solid rgba(126, 169, 255, 0.4)',
              borderRadius: '4px',
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
              width={28}
              height={28}
              alt="Pencil circle"
            />
            <div
              style={{
                color: '#608BE1',
                fontSize: 16,
                fontFamily: 'Mona Sans',
                fontWeight: '500',
                wordWrap: 'break-word',
              }}
            >
              Empty Item
            </div>
          </div>

          {emptyStats.map(({ label, icon, alt, value }) => (
            <MetricItem
              key={label}
              origin={origin}
              icon={icon}
              alt={alt}
              label={label}
              value={value}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function renderShareCard(
  payload: SharePayload,
  options: ShareCardOptions = {},
): JSX.Element {
  switch (payload.layout) {
    case 'proposal':
      return renderProposalCard(payload, options);
    case 'itemProposal':
      return renderItemProposalCard(payload, options);
    case 'projectPublished':
      return renderPublishedProjectCard(payload, options);
    case 'projectPending':
      return renderPendingProjectCard(payload, options);
    case 'project': {
      const isPublished = payload.metadata.project.isPublished ?? true;
      return isPublished
        ? renderPublishedProjectCard(payload, options)
        : renderPendingProjectCard(payload, options);
    }
    default:
      return renderFallbackCard(payload, options);
  }
}

function resolveEmptyItemLabels(itemKey?: string | null): {
  itemLabel: string;
  categoryLabel: string;
} {
  if (!itemKey) {
    return {
      itemLabel: 'Item',
      categoryLabel: 'Item',
    };
  }

  const typedKey = itemKey as keyof typeof AllItemConfig;
  const itemConfig = AllItemConfig[typedKey];
  const itemLabel = itemConfig?.label ?? formatReadableKey(itemKey);

  if (itemConfig?.category) {
    const categoryConfig = ProjectTableFieldCategory.find(
      (category) => category.key === itemConfig.category,
    );
    const categoryLabel =
      categoryConfig?.label ??
      categoryConfig?.title ??
      formatReadableKey(String(itemConfig.category));

    return { itemLabel, categoryLabel };
  }

  return {
    itemLabel,
    categoryLabel: 'Item',
  };
}

export function buildEmptyItemSharePayload({
  project,
  itemKey,
  fallbackUrl,
}: EmptyItemSharePayloadOptions): SharePayload | null {
  if (!itemKey || !project?.id || !project.name) {
    return null;
  }

  const { itemLabel, categoryLabel } = resolveEmptyItemLabels(itemKey);
  const typedKey = itemKey as keyof typeof ALL_POC_ITEM_MAP;
  const baseWeight = ALL_POC_ITEM_MAP[typedKey]?.weight ?? 0;
  const formattedWeight = formatInteger(baseWeight);

  const categories = project.categories ?? [];
  const now = new Date();
  const imageVersionValue = now.getTime();

  return {
    code: `empty-${project.id}-${itemKey}`,
    entityType: 'itemProposal',
    entityId: `empty-${project.id}-${itemKey}`,
    sharePath: fallbackUrl,
    targetUrl: fallbackUrl,
    parentId: String(project.id),
    visibility: project.isPublished ? 'public' : 'unlisted',
    metadata: {
      title: `Item Proposal · ${itemLabel} · ${project.name}`,
      subtitle: project.tagline?.length
        ? truncate(project.tagline, 160)
        : 'This item does not have submissions yet.',
      description: `Help kick-start the "${itemLabel}" item by submitting the first proposal. Starting weight: ${formattedWeight}.`,
      badge: 'Item Proposal',
      statusBadge: { label: 'Empty Item', tone: 'info' },
      badges: [{ label: 'Empty Item', tone: 'info' }],
      project: {
        id: project.id,
        name: project.name,
        tagline: project.tagline ?? undefined,
        categories,
        logoUrl: project.logoUrl ?? undefined,
        isPublished: project.isPublished ?? undefined,
      },
      tags: categories,
      item: {
        key: itemLabel,
        rawKey: itemKey,
        category: categoryLabel,
        type: 'empty',
        initialWeight: formattedWeight,
      },
    },
    imageVersion: String(imageVersionValue),
    imageTimestamp: imageVersionValue,
    layout: 'itemProposal',
    createdAt: now,
    updatedAt: now,
  };
}
