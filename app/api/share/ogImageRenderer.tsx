import fs from 'fs/promises';
import path from 'path';

import type { JSX } from 'react';
import type { Font } from 'satori';

import type { SharePayload } from '@/lib/services/share';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

const FONT_DIR = path.join(process.cwd(), 'public/fonts');

export async function getOgFonts(): Promise<Font[]> {
  const fonts = (await Promise.all([
    fs.readFile(path.join(FONT_DIR, 'MonaSans-Regular.ttf')).then((data) => ({
      name: 'MonaSans',
      data,
      style: 'normal' as const,
      weight: 400 as unknown as Font['weight'],
    })),
    fs.readFile(path.join(FONT_DIR, 'MonaSans-SemiBold.ttf')).then((data) => ({
      name: 'MonaSans',
      data,
      style: 'normal' as const,
      weight: 600 as unknown as Font['weight'],
    })),
    fs.readFile(path.join(FONT_DIR, 'MonaSans-Bold.ttf')).then((data) => ({
      name: 'MonaSans',
      data,
      style: 'normal' as const,
      weight: 700 as unknown as Font['weight'],
    })),
  ])) as Font[];

  return fonts;
}

function toAbsolute(url: string | null | undefined, origin: string): string {
  if (!url) {
    return buildAbsoluteUrl('/pensieve-logo.svg', origin);
  }
  return buildAbsoluteUrl(url, origin);
}

function getBadgeLabel(payload: SharePayload): string {
  if (payload.metadata.badge) {
    return payload.metadata.badge;
  }
  switch (payload.layout) {
    case 'proposal':
      return 'Proposal';
    case 'itemProposal':
      return 'Item Proposal';
    default:
      return 'Pensieve';
  }
}

export function renderShareOgImage(
  payload: SharePayload,
  origin: string = getAppOrigin(),
): JSX.Element {
  const { metadata } = payload;
  const badge = getBadgeLabel(payload);
  const logoUrl = toAbsolute(metadata.project.logoUrl, origin);
  const categories = (metadata.project.categories ?? []).slice(0, 3);
  const highlights = (metadata.highlights ?? []).slice(0, 2);
  const authorName = metadata.author?.name ?? metadata.author?.address;

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background:
          'linear-gradient(140deg, rgba(12,28,34,1) 0%, rgba(30,85,74,1) 100%)',
        color: '#ffffff',
        fontFamily: 'MonaSans',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img
          src={buildAbsoluteUrl('/pensieve-logo.svg', origin)}
          width={72}
          height={72}
          style={{
            borderRadius: '16px',
            background: '#ffffff',
            padding: '8px',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>Pensieve</span>
          <span style={{ fontSize: '18px', opacity: 0.8 }}>
            Decentralized Social Consensus · Community Knowledge Bases
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '32px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <div
          style={{
            width: '168px',
            height: '168px',
            borderRadius: '32px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={logoUrl}
            width={168}
            height={168}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.12)',
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {badge}
            </span>
            <span style={{ fontSize: '18px', opacity: 0.75 }}>
              {metadata.project.name}
            </span>
          </div>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <h1 style={{ fontSize: '48px', lineHeight: 1.1, fontWeight: 700 }}>
              {metadata.title}
            </h1>
            {metadata.subtitle && (
              <p style={{ fontSize: '26px', opacity: 0.85 }}>
                {metadata.subtitle}
              </p>
            )}
            {metadata.description && (
              <p style={{ fontSize: '22px', opacity: 0.78, lineHeight: 1.4 }}>
                {metadata.description}
              </p>
            )}
          </div>

          {(categories.length > 0 || authorName) && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <span
                  key={category}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.12)',
                    fontSize: '18px',
                  }}
                >
                  {category}
                </span>
              ))}
              {authorName && (
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.12)',
                    fontSize: '18px',
                  }}
                >
                  {authorName}
                </span>
              )}
            </div>
          )}

          {highlights.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '18px',
              }}
            >
              {highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  style={{
                    padding: '16px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '18px', opacity: 0.65 }}>
                    {highlight.label}
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 600 }}>
                    {highlight.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '20px', opacity: 0.8 }}>
          pensieve.ecf.network
        </span>
        {metadata.timestamp && (
          <span style={{ fontSize: '18px', opacity: 0.6 }}>
            Updated{' '}
            {new Date(metadata.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  );
}
