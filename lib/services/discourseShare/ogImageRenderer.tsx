import type { JSX } from 'react';

import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import { getOgFonts } from '@/lib/services/share/ogImageRenderer';
import { getAppOrigin } from '@/lib/utils/url';

import type { DiscourseSharePayload } from './discourseShareService';
import { renderDiscourseShareCard } from './shareCardElements';

export { getOgFonts };

export function renderDiscourseOgImage(
  payload: DiscourseSharePayload,
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
      {renderDiscourseShareCard(payload, { origin })}
    </div>
  );
}
