import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ECF',
  //  TODO:need change
  projectId: '2ae588c8e2c83e087672119a2b42f330',
  chains: [mainnet, sepolia],
});
