import { isProduction } from '@/constants/env';
import { listHarbergerSlotMetadata } from '@/constants/harbergerSlotsMetadata';

const AD_SLOT_CHAIN_ID = isProduction ? 1 : 11155111;

export function isHtaxAdPlacementActive(
  pageKey: string,
  positionKey: string,
): boolean {
  const metadataEntries = listHarbergerSlotMetadata(AD_SLOT_CHAIN_ID);

  const normalizedPage = pageKey.trim().toLowerCase();
  const normalizedPosition = positionKey.trim().toLowerCase();

  const matchedEntries = metadataEntries.filter((entry) => {
    const entryPage = (entry.page ?? '').trim().toLowerCase();
    const entryPosition = (entry.position ?? '').trim().toLowerCase();
    return entryPage === normalizedPage && entryPosition === normalizedPosition;
  });

  if (matchedEntries.length === 0) {
    return false;
  }

  return matchedEntries.some((entry) => entry.isActive);
}
