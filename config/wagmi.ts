import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

import { isProduction } from '@/constants/env';

const DEFAULT_TIMEOUT = 30_000;

const mainnetRpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ??
  process.env.RPC_URL ??
  mainnet.rpcUrls.default.http[0];
const sepoliaRpcUrl =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
  process.env.RPC_URL ??
  sepolia.rpcUrls.default.http[0];
export const config = getDefaultConfig({
  appName: 'ECF',
  //  TODO:need update wagmi projectId
  projectId: '2ae588c8e2c83e087672119a2b42f330',
  chains: isProduction ? [mainnet] : [sepolia],
  transports: isProduction
    ? {
        [mainnet.id]: http(mainnetRpcUrl, { timeout: DEFAULT_TIMEOUT }),
      }
    : {
        [sepolia.id]: http(sepoliaRpcUrl, { timeout: DEFAULT_TIMEOUT }),
      },
});
