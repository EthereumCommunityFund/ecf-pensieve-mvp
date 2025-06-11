import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

import { isProduction } from '@/constants/env';

export const config = getDefaultConfig({
  appName: 'ECF',
  //  TODO:need update wagmi projectId
  projectId: '2ae588c8e2c83e087672119a2b42f330',
  chains: isProduction ? [mainnet] : [sepolia],
});
