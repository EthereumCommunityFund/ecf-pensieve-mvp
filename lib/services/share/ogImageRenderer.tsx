import type { JSX } from 'react';
import type { Font } from 'satori';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import type { SharePayload } from '@/lib/services/share';
import { renderShareCard } from '@/lib/services/share/shareCardElements';
import { getAppOrigin } from '@/lib/utils/url';

let fontsPromise: Promise<Font[]> | null = null;

async function loadFontFromEdge(
  family: string,
  file: string,
  weight: number,
): Promise<Font> {
  const response = await fetch(
    new URL(`../../../public/fonts/${file}`, import.meta.url),
  );
  if (!response.ok) {
    throw new Error(`Failed to load font ${file}`);
  }
  const data = await response.arrayBuffer();
  return {
    name: family,
    data,
    style: 'normal',
    weight: weight as Font['weight'],
  };
}

async function loadFontFromNode(
  family: string,
  file: string,
  weight: number,
): Promise<Font> {
  const [{ readFile }, { join }] = await Promise.all([
    import('fs/promises'),
    import('path'),
  ]);
  const data = await readFile(join(process.cwd(), 'public/fonts', file));
  return {
    name: family,
    data,
    style: 'normal',
    weight: weight as Font['weight'],
  };
}

async function loadFont(
  family: string,
  file: string,
  weight: number,
): Promise<Font> {
  const isNodeRuntime =
    typeof process !== 'undefined' && !!process.versions?.node;
  return isNodeRuntime
    ? loadFontFromNode(family, file, weight)
    : loadFontFromEdge(family, file, weight);
}

export async function getOgFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadFont('MonaSans', 'MonaSans-Regular.ttf', 400),
      loadFont('MonaSans', 'MonaSans-SemiBold.ttf', 600),
      loadFont('MonaSans', 'MonaSans-Bold.ttf', 700),
      loadFont('Inter', 'Inter-Regular.ttf', 400),
      loadFont('Inter', 'Inter-SemiBold.ttf', 600),
    ]);
  }
  return fontsPromise;
}

export function renderShareOgImage(
  payload: SharePayload,
  origin: string = getAppOrigin(),
): JSX.Element {
  return (
    <div
      style={{
        width: `${SHARE_CARD_WIDTH}px`,
        height: `${SHARE_CARD_HEIGHT}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
      }}
    >
      {renderShareCard(payload, { origin, mode: 'og' })}
    </div>
  );
}
