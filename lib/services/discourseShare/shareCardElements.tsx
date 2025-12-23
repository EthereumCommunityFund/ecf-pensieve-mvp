import type { CSSProperties, JSX } from 'react';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import type { DiscourseSharePayload } from './discourseShareService';

type ShareCardOptions = {
  origin?: string;
};

const FONT_FAMILY = 'Inter, Mona Sans, sans-serif';
const TEXT_BLACK = '#000000';
const BORDER = 'rgba(0,0,0,0.1)';
const MUTED = 'rgba(0,0,0,0.5)';
const BRAND_GREEN = '#43BD9B';

function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function iconUrl(origin: string, path: string): string {
  return buildAbsoluteUrl(path, origin);
}

function CheckSquareIcon({
  size,
  stroke = MUTED,
  checkColor = MUTED,
}: {
  size: number;
  stroke?: string;
  checkColor?: string;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="3"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M7.5 12.2l2.8 2.8L16.8 8.5"
        stroke={checkColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderHeader(params: {
  origin: string;
  logoUrl?: string | null;
  projectName: string;
}): JSX.Element {
  const logo = buildAbsoluteUrl(
    params.logoUrl ?? '/pensieve-logo.svg',
    params.origin,
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 5,
          border: `1px solid ${BORDER}`,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={logo}
          width={40}
          height={40}
          alt=""
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 24,
          lineHeight: 1.2,
          color: TEXT_BLACK,
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {params.projectName}
      </div>
    </div>
  );
}

function renderThreadTitle(title: string): JSX.Element {
  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: 20,
        lineHeight: 1.2,
        color: TEXT_BLACK,
        textTransform: 'capitalize',
      }}
    >
      {title || '—'}
    </div>
  );
}

function renderSubtitle(text: string): JSX.Element {
  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: 18,
        lineHeight: 1.2,
        color: TEXT_BLACK,
        opacity: 0.5,
      }}
    >
      {text || '—'}
    </div>
  );
}

function renderByline(params: {
  origin: string;
  prefix: string;
  name?: string | null;
  avatarUrl?: string | null;
}): JSX.Element {
  const name = params.name?.trim() || 'Anonymous';
  const avatar = buildAbsoluteUrl(
    params.avatarUrl?.trim() || '/images/default-project.png',
    params.origin,
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: FONT_FAMILY,
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '18px',
        color: TEXT_BLACK,
        opacity: 0.5,
      }}
    >
      <span>{params.prefix}:</span>
      <img
        src={avatar}
        width={16}
        height={16}
        style={{ borderRadius: 9999 }}
        alt={name}
      />
      <span style={{ color: TEXT_BLACK, opacity: 1 }}>{name}</span>
    </div>
  );
}

function StatBlock(params: {
  origin: string;
  icon?: { kind: 'url'; url: string } | { kind: 'checkSquare' };
  value: string;
  label: string;
  iconSize?: number;
}): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: 0.5,
        }}
      >
        <div style={{ width: 24, height: 24 }}>
          {params.icon?.kind === 'url' ? (
            <img
              src={params.icon.url}
              width={params.iconSize ?? 24}
              height={params.iconSize ?? 24}
              alt=""
            />
          ) : params.icon?.kind === 'checkSquare' ? (
            <CheckSquareIcon size={24} />
          ) : null}
        </div>
        <div
          style={{
            fontFamily: 'Mona Sans, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '24px',
            color: TEXT_BLACK,
          }}
        >
          {params.value}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'Mona Sans, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '18px',
          color: TEXT_BLACK,
          opacity: 0.5,
        }}
      >
        {params.label}
      </div>
    </div>
  );
}

function StatusBlock(params: { status: string }): JSX.Element {
  const isRedressed = params.status === 'Redressed';
  const color = isRedressed ? BRAND_GREEN : MUTED;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 32, height: 32 }}>
        <CheckSquareIcon
          size={32}
          stroke={isRedressed ? BRAND_GREEN : MUTED}
          checkColor={isRedressed ? BRAND_GREEN : MUTED}
        />
      </div>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '20px',
          color,
        }}
      >
        {params.status}
      </div>
    </div>
  );
}

function FooterBrand(params: { origin: string }): JSX.Element {
  const logo = iconUrl(params.origin, '/images/share/Logo.svg');
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        opacity: 0.3,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <img src={logo} width={28} height={17} alt="" />
        <div
          style={{
            fontFamily: 'Mona Sans, sans-serif',
            fontWeight: 800,
            fontSize: 16,
            lineHeight: '20px',
            color: TEXT_BLACK,
          }}
        >
          Pensieve.ecf
        </div>
      </div>
    </div>
  );
}

function baseContainerStyle(): CSSProperties {
  return {
    width: `${SHARE_CARD_WIDTH}px`,
    height: `${SHARE_CARD_HEIGHT}px`,
    padding: 20,
    background: '#fff',
    boxSizing: 'border-box',
    fontFamily: FONT_FAMILY,
    color: TEXT_BLACK,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
}

function renderGeneralThreadCard(
  payload: DiscourseSharePayload,
  origin: string,
): JSX.Element {
  return (
    <div style={baseContainerStyle()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {renderHeader({
          origin,
          logoUrl: payload.stable.projectLogoUrl,
          projectName: payload.stable.projectName,
        })}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: 490,
          }}
        >
          {renderSubtitle(payload.label)}
          {renderThreadTitle(payload.stable.threadTitle)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/CaretCircleUp.svg'),
              }}
              value={formatInteger(payload.stats.upvotesCpTotal ?? 0)}
              label="Upvotes"
            />
            <StatBlock
              origin={origin}
              icon={{ kind: 'checkSquare' }}
              value={formatInteger(payload.stats.answersCount ?? 0)}
              label="Answers"
            />
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.discussionCommentsCount ?? 0)}
              label="Comments"
            />
            <StatusBlock status={payload.status} />
          </div>
        </div>
        <FooterBrand origin={origin} />
      </div>
    </div>
  );
}

function renderScamThreadCard(
  payload: DiscourseSharePayload,
  origin: string,
): JSX.Element {
  return (
    <div style={baseContainerStyle()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {renderHeader({
          origin,
          logoUrl: payload.stable.projectLogoUrl,
          projectName: payload.stable.projectName,
        })}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: 490,
          }}
        >
          {renderSubtitle(payload.label)}
          {renderThreadTitle(payload.stable.threadTitle)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.supportersCount ?? 0)}
              label="Supporters"
            />
            <StatBlock
              origin={origin}
              icon={{ kind: 'checkSquare' }}
              value={formatInteger(payload.stats.counterClaimsCount ?? 0)}
              label="Counter-Claims"
            />
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.discussionCommentsCount ?? 0)}
              label="Comments"
            />
            <StatusBlock status={payload.status} />
          </div>
        </div>
        <FooterBrand origin={origin} />
      </div>
    </div>
  );
}

function renderAnswerCard(
  payload: DiscourseSharePayload,
  origin: string,
): JSX.Element {
  return (
    <div style={baseContainerStyle()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {renderHeader({
          origin,
          logoUrl: payload.stable.projectLogoUrl,
          projectName: payload.stable.projectName,
        })}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: 490,
          }}
        >
          {renderSubtitle(`${payload.label} → Answer`)}
          {renderThreadTitle(payload.stable.threadTitle)}
          {renderByline({
            origin,
            prefix: 'Answer by',
            name: payload.stable.authorName,
            avatarUrl: payload.stable.authorAvatarUrl,
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.supportersCount ?? 0)}
              label="Supporters"
            />
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.answerCommentsCount ?? 0)}
              label="Comments"
            />
          </div>
        </div>
        <FooterBrand origin={origin} />
      </div>
    </div>
  );
}

function renderCounterClaimCard(
  payload: DiscourseSharePayload,
  origin: string,
): JSX.Element {
  return (
    <div style={baseContainerStyle()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {renderHeader({
          origin,
          logoUrl: payload.stable.projectLogoUrl,
          projectName: payload.stable.projectName,
        })}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: 490,
          }}
        >
          {renderSubtitle(`${payload.label} → Counter Claim`)}
          {renderThreadTitle(payload.stable.threadTitle)}
          {renderByline({
            origin,
            prefix: 'Claim by',
            name: payload.stable.authorName,
            avatarUrl: payload.stable.authorAvatarUrl,
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.supportersCount ?? 0)}
              label="Supporters"
            />
            <StatBlock
              origin={origin}
              icon={{
                kind: 'url',
                url: iconUrl(origin, '/images/share/Users.svg'),
              }}
              value={formatInteger(payload.stats.answerCommentsCount ?? 0)}
              label="Comments"
            />
          </div>
        </div>
        <FooterBrand origin={origin} />
      </div>
    </div>
  );
}

export function renderDiscourseShareCard(
  payload: DiscourseSharePayload,
  options: ShareCardOptions = {},
): JSX.Element {
  const origin = options.origin ?? getAppOrigin();
  switch (payload.variant) {
    case 'generalThread':
      return renderGeneralThreadCard(payload, origin);
    case 'scamThread':
      return renderScamThreadCard(payload, origin);
    case 'answer':
      return renderAnswerCard(payload, origin);
    case 'counterClaim':
      return renderCounterClaimCard(payload, origin);
    default:
      return renderGeneralThreadCard(payload, origin);
  }
}
