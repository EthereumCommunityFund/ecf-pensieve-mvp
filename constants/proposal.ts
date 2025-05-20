export const DefaultVoteQuorum = 3;

/**
 * TODO: need to confirm, get by dynamic data
 */
export const ItemWeightMap: Record<string, number> = {
  name: 20,
  tagline: 10,
  categories: 10,
  mainDescription: 10,
  logoUrl: 10,
  websiteUrl: 10,
  appUrl: 10,
  dateFounded: 10,
  dateLaunch: 20,
  devStatus: 10,
  fundingStatus: 20,
  openSource: 10,
  codeRepo: 10,
  tokenContract: 10,
  orgStructure: 20,
  publicGoods: 10,
  founders: 10,
};

export const TotalEssentialItemWeightSum = Object.keys(ItemWeightMap).reduce(
  (acc, key) => acc + ItemWeightMap[key],
  0,
);

export const ItemQuorumMap: Record<string, number> = {
  name: DefaultVoteQuorum,
  tagline: DefaultVoteQuorum,
  categories: DefaultVoteQuorum,
  mainDescription: DefaultVoteQuorum,
  logoUrl: DefaultVoteQuorum,
  websiteUrl: DefaultVoteQuorum,
  appUrl: DefaultVoteQuorum,
  dateFounded: DefaultVoteQuorum,
  dateLaunch: DefaultVoteQuorum,
  devStatus: DefaultVoteQuorum,
  fundingStatus: DefaultVoteQuorum,
  openSource: DefaultVoteQuorum,
  codeRepo: DefaultVoteQuorum,
  tokenContract: DefaultVoteQuorum,
  orgStructure: DefaultVoteQuorum,
  publicGoods: DefaultVoteQuorum,
  founders: DefaultVoteQuorum,
};

export const TotalEssentialItemQuorumSum = Object.keys(ItemQuorumMap).reduce(
  (acc, key) => acc + ItemQuorumMap[key],
  0,
);
