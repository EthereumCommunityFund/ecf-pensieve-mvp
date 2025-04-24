export interface IProject {
  id: number;
  name: string;
  tagline: string;
  categories: string[];
  mainDescription: string;
  logoUrl: string;
  websiteUrl: string;
  appUrl: string | null;
  dateFounded: Date;
  dateLaunch: Date | null;
  devStatus: string;
  fundingStatus: string | null;
  openSource: boolean;
  codeRepo: string | null;
  tokenContract: string | null;
  orgStructure: string;
  publicGoods: boolean;
  founders: { name: string; title: string }[];
  creator: string;
  refs: { key: string; value: string }[] | null;
  createdAt: Date;
  updatedAt: Date;
}
