import { WEIGHT } from '@/lib/constants';
import { POC_ITEMS } from '@/lib/pocItems';

export function calculatePublishedGenesisWeight(
  hasProposalKeys: string[],
): number {
  let totalWeight = 0;

  for (const key of hasProposalKeys) {
    if (key in POC_ITEMS) {
      const itemConfig = POC_ITEMS[key as keyof typeof POC_ITEMS];
      totalWeight += itemConfig.accountability_metric * WEIGHT;
    }
  }

  return totalWeight;
}
