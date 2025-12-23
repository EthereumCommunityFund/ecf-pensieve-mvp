import type { CSSProperties, JSX } from 'react';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import {
  MetricItem,
  renderShareFooter,
} from '@/lib/services/share/baseComponents';
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
const ALERT_ORANGE = '#BB5D00';

function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function iconUrl(origin: string, path: string): string {
  const normalizedOrigin = origin || getAppOrigin();
  return `${normalizedOrigin}${path.startsWith('/') ? path : `/${path}`}`;
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
        display: 'flex',
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
        display: 'flex',
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
    params.avatarUrl?.trim() || '/images/user/avatar_p.png',
    params.origin,
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: FONT_FAMILY,
        fontWeight: 400,
        fontSize: 16,
        lineHeight: '20px',
        color: TEXT_BLACK,
      }}
    >
      <span style={{ opacity: 0.5 }}>{params.prefix}:</span>
      <img
        src={avatar}
        width={28}
        height={28}
        style={{ borderRadius: 9999, objectFit: 'cover' }}
        alt={name}
      />
      <span style={{ display: 'flex', opacity: 1 }}>{name}</span>
    </div>
  );
}

function StatusBlock(params: {
  origin: string;
  status: string;
}): JSX.Element | null {
  const normalizedStatus = params.status || 'Open';
  const isClaimRedressed =
    normalizedStatus === 'Redressed' || normalizedStatus === 'Claim Redressed';
  const isAlertDisplayed = normalizedStatus === 'Alert Displayed on Page';
  const displayText = isAlertDisplayed
    ? 'Alert Displayed'
    : normalizedStatus === 'Claim Redressed'
      ? 'Redressed'
      : normalizedStatus;
  const color = isAlertDisplayed
    ? ALERT_ORANGE
    : isClaimRedressed
      ? BRAND_GREEN
      : MUTED;

  if (!isAlertDisplayed && !isClaimRedressed) {
    return null;
  }

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
      <div style={{ width: 32, height: 32, display: 'flex' }}>
        <img
          src={iconUrl(
            params.origin,
            isAlertDisplayed
              ? '/images/share/CheckSquareAlert.svg'
              : isClaimRedressed
                ? '/images/share/CheckSquareRedressed.svg'
                : '/images/share/CheckSquare.svg',
          )}
          width={32}
          height={32}
          alt=""
        />
      </div>
      <div
        style={{
          display: 'flex',
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '20px',
          color,
        }}
      >
        {displayText}
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
            display: 'flex',
            flexDirection: 'column',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <MetricItem
              origin={origin}
              icon="/images/share/CaretCircleUp.svg"
              value={formatInteger(payload.stats.upvotesCpTotal ?? 0)}
              label="Upvotes"
              styles={{ container: { rowGap: '5px' } }}
            />
            <MetricItem
              origin={origin}
              icon="/images/share/CheckSquare.svg"
              value={formatInteger(payload.stats.answersCount ?? 0)}
              label="Answers"
              styles={{ container: { rowGap: '5px' } }}
            />
            <MetricItem
              origin={origin}
              icon="/images/share/Users.svg"
              value={formatInteger(payload.stats.discussionCommentsCount ?? 0)}
              label="Comments"
              styles={{ container: { rowGap: '5px' } }}
            />
            <StatusBlock origin={origin} status={payload.status} />
          </div>
        </div>
        {renderShareFooter(origin)}
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
            display: 'flex',
            flexDirection: 'column',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <MetricItem
              origin={origin}
              icon="/images/share/CaretCircleUp.svg"
              value={formatInteger(payload.stats.supportersCount ?? 0)}
              label="Supporters"
              styles={{ container: { rowGap: '5px' } }}
            />
            <MetricItem
              origin={origin}
              icon="/images/share/WarningOctagon.svg"
              value={formatInteger(payload.stats.counterClaimsCount ?? 0)}
              label="Counter-Claims"
              styles={{ container: { rowGap: '5px' } }}
            />
            <MetricItem
              origin={origin}
              icon="/images/share/Users.svg"
              value={formatInteger(payload.stats.discussionCommentsCount ?? 0)}
              label="Comments"
              styles={{ container: { rowGap: '5px' } }}
            />
            <StatusBlock origin={origin} status={payload.status} />
          </div>
        </div>
        {renderShareFooter(origin)}
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
            display: 'flex',
            flexDirection: 'column',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <MetricItem
              origin={origin}
              icon="/images/share/CaretCircleUp.svg"
              value={formatInteger(payload.stats.supportersCount ?? 0)}
              label="Supporters"
              styles={{ container: { rowGap: '5px' } }}
            />
            <MetricItem
              origin={origin}
              icon="/images/share/Users.svg"
              value={formatInteger(payload.stats.answerCommentsCount ?? 0)}
              label="Comments"
              styles={{ container: { rowGap: '5px' } }}
            />
          </div>
        </div>
        {renderShareFooter(origin)}
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
            display: 'flex',
            flexDirection: 'column',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <MetricItem
              origin={origin}
              icon="/images/share/CaretCircleUp.svg"
              value={formatInteger(payload.stats.supportersCount ?? 0)}
              label="Supporters"
              styles={{ container: { rowGap: '5px' } }}
            />
            <MetricItem
              origin={origin}
              icon="/images/share/Users.svg"
              value={formatInteger(payload.stats.answerCommentsCount ?? 0)}
              label="Comments"
              styles={{ container: { rowGap: '5px' } }}
            />
          </div>
        </div>
        {renderShareFooter(origin)}
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
