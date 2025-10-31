export interface HarbergerSlotMetadata {
  chainId: number;
  slotAddress: `0x${string}`;
  slotDisplayName: string;
  page: 'home' | 'project';
  position: 'TopBanner' | 'Sidebar' | 'FooterBanner' | 'ListInLine';
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
