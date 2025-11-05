import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-verify';
import 'dotenv/config';
import type { HardhatUserConfig } from 'hardhat/config';
import { configVariable } from 'hardhat/config';

const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY ?? configVariable('ETHERSCAN_API_KEY');

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      production: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    },
  },
  networks: {
    localhost: {
      type: 'http',
      chainType: 'l1',
      url: 'http://127.0.0.1:8545',
      accounts: [configVariable('LOCAL_PRIVATE_KEY')],
    },
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
    mainnet: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('MAINNET_RPC_URL'),
      accounts: [configVariable('MAINNET_PRIVATE_KEY')],
    },
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
