import type { JSX } from 'react';
import type { Font } from 'satori';

import type { SharePayload } from '@/lib/services/share';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

let fontsPromise: Promise<Font[]> | null = null;

async function loadFontFromEdge(file: string, weight: number): Promise<Font> {
  const response = await fetch(
    new URL(`../../../public/fonts/${file}`, import.meta.url),
  );
  if (!response.ok) {
    throw new Error(`Failed to load font ${file}`);
  }
  const data = await response.arrayBuffer();
  return {
    name: 'MonaSans',
    data,
    style: 'normal',
    weight: weight as Font['weight'],
  };
}

async function loadFontFromNode(file: string, weight: number): Promise<Font> {
  const [{ readFile }, { join }] = await Promise.all([
    import('fs/promises'),
    import('path'),
  ]);
  const data = await readFile(join(process.cwd(), 'public/fonts', file));
  return {
    name: 'MonaSans',
    data,
    style: 'normal',
    weight: weight as Font['weight'],
  };
}

async function loadFont(file: string, weight: number): Promise<Font> {
  const isNodeRuntime =
    typeof process !== 'undefined' && !!process.versions?.node;
  return isNodeRuntime
    ? loadFontFromNode(file, weight)
    : loadFontFromEdge(file, weight);
}

export async function getOgFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadFont('MonaSans-Regular.ttf', 400),
      loadFont('MonaSans-SemiBold.ttf', 600),
      loadFont('MonaSans-Bold.ttf', 700),
    ]);
  }
  return fontsPromise;
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

function truncate(text: string, max: number): string {
  if (!text) {
    return '';
  }
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function renderProposalSubmittedOgImage(
  payload: SharePayload,
  origin: string,
): JSX.Element {
  const projectName = truncate(payload.metadata.project.name ?? '', 36);
  const tagline = truncate(
    payload.metadata.subtitle || payload.metadata.project.tagline || '',
    220,
  );
  const description = truncate(payload.metadata.description ?? '', 360);
  const logoUrl = toAbsolute(payload.metadata.project.logoUrl, origin);

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        padding: '80px',
        background:
          'linear-gradient(168deg, rgba(40, 193, 150, 1) 0%, rgba(255, 255, 255, 1) 100%)',
        fontFamily: 'MonaSans',
        color: '#0C1C22',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <img
              src={buildAbsoluteUrl('/pensieve-logo.svg', origin)}
              width={72}
              height={72}
              alt="Pensieve logo"
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <span
                style={{ fontSize: '42px', fontWeight: 700, color: '#0C1C22' }}
              >
                Pensieve
              </span>
              <span style={{ fontSize: '24px', opacity: 0.6 }}>
                Decentralized Social Consensus & Community Knowledge Bases
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: '16px',
            border: '3px solid rgba(70, 162, 135, 1)',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255,255,255,0.35)',
          }}
        >
          <img
            src={buildAbsoluteUrl('/CheckCircle.svg', origin)}
            width={48}
            height={48}
            alt="Check circle"
          />
          <span style={{ fontSize: '30px', fontWeight: 700, color: '#2D8F66' }}>
            Proposal submitted
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: '40px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '32px',
          padding: '28px',
          borderRadius: '18px',
          background: 'rgba(255,255,255,0.55)',
          border: '2px solid rgba(255,255,255,0.8)',
        }}
      >
        <img
          src={logoUrl}
          width={210}
          height={210}
          alt="Project logo"
          style={{
            borderRadius: '18px',
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#ffffff',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            color: '#0C1C22',
            flex: 1,
            maxWidth: '720px',
          }}
        >
          <span
            style={{
              fontSize: '44px',
              fontWeight: 700,
              wordBreak: 'break-word',
            }}
          >
            {projectName}
          </span>
          {tagline && (
            <span
              style={{
                fontSize: '24px',
                opacity: 0.75,
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function renderDefaultShareOgImage(
  payload: SharePayload,
  origin: string,
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
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0d1f23',
            }}
          >
            <img
              src={logoUrl}
              width={168}
              height={168}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '8px solid rgba(255,255,255,0.35)',
                borderRadius: '32px',
              }}
            />
          </div>
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

export function renderShareOgImage(
  payload: SharePayload,
  origin: string = getAppOrigin(),
): JSX.Element {
  if (payload.layout === 'proposal') {
    return renderProposalSubmittedOgImage(payload, origin);
  }

  return renderDefaultShareOgImage(payload, origin);
}
