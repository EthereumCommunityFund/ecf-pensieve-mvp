export interface HarbergerSlotMetadata {
  chainId: number;
  slotAddress: `0x${string}`;
  slotDisplayName: string;
  page: string;
  position: string;
  imageSize: string;
  extra: Record<string, unknown>;
  isActive: boolean;
  contractMeta?: HarbergerSlotContractMeta;
}

export type HarbergerSlotMetadataMap = Record<string, HarbergerSlotMetadata>;

export interface HarbergerSlotContractMeta {
  slotType: 'enabled' | 'shielded';
  bondRateBps: string;
  annualTaxRateBps: string;
  minBidIncrementBps: string;
  taxPeriodSeconds: string;
  minValuationWei: string;
  contentUpdateLimit: string;
  dustRateBps?: string;
}
