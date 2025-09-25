import type { JSX } from 'react';
import type { Font } from 'satori';

import type { SharePayload } from '@/lib/services/share';
import { renderShareCardForOg } from '@/lib/services/share/shareCardElements';
import { getAppOrigin } from '@/lib/utils/url';

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

function renderProposalOgImage(
  payload: SharePayload,
  origin: string,
): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFF',
      }}
    >
      {renderShareCardForOg(payload, origin)}
    </div>
  );
}

function renderDefaultOgImage(
  payload: SharePayload,
  origin: string,
): JSX.Element {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        padding: '80px',
        boxSizing: 'border-box',
        fontFamily: 'MonaSans',
      }}
    >
      {renderShareCardForOg(payload, origin)}
    </div>
  );
}

export function renderShareOgImage(
  payload: SharePayload,
  origin: string = getAppOrigin(),
): JSX.Element {
  switch (payload.layout) {
    case 'proposal':
      return renderProposalOgImage(payload, origin);
    default:
      return renderDefaultOgImage(payload, origin);
  }
}
