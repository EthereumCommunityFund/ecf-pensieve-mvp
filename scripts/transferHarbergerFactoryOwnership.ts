import 'dotenv/config';

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia } from 'viem/chains';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
} from '@/constants/harbergerFactory';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function resolveChain() {
  const network = process.env.NETWORK?.toLowerCase();
  if (!network || network === 'mainnet' || network === 'ethereum') {
    return mainnet;
  }
  if (network === 'sepolia') {
    return sepolia;
  }
  throw new Error(`Unsupported NETWORK value "${process.env.NETWORK}".`);
}

async function main() {
  const privateKey = requireEnv('PRIVATE_KEY');
  const rpcUrl = requireEnv('RPC_URL');
  const newOwner = requireEnv('NEW_OWNER_ADDRESS');

  const factoryAddress =
    (process.env.FACTORY_ADDRESS as `0x${string}` | undefined) ??
    HARBERGER_FACTORY_ADDRESS;

  if (!factoryAddress) {
    throw new Error(
      'Factory address is undefined. Provide FACTORY_ADDRESS or set NEXT_PUBLIC_HARBERGER_FACTORY_ADDRESS.',
    );
  }

  if (!newOwner.startsWith('0x')) {
    throw new Error('NEW_OWNER_ADDRESS must be a 0x-prefixed address.');
  }

  if (newOwner === ZERO_ADDRESS) {
    throw new Error('NEW_OWNER_ADDRESS cannot be zero.');
  }

  const account = privateKeyToAccount(
    (privateKey.startsWith('0x')
      ? privateKey
      : `0x${privateKey}`) as `0x${string}`,
  );

  const chain = resolveChain();
  const transport = http(rpcUrl);

  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  console.info('Network:', chain.name);
  console.info('Factory address:', factoryAddress);
  console.info('Signer address:', account.address);
  console.info('New owner address:', newOwner);

  const currentOwner = (await publicClient.readContract({
    address: factoryAddress,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'owner',
  })) as `0x${string}`;

  console.info('Current owner:', currentOwner);

  if (currentOwner.toLowerCase() === newOwner.toLowerCase()) {
    console.info('New owner matches current owner; nothing to do.');
    return;
  }

  if (currentOwner === ZERO_ADDRESS) {
    console.warn(
      'Warning: current owner is zero address. Ensure factory was deployed correctly.',
    );
  }

  const { request } = await publicClient.simulateContract({
    address: factoryAddress,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'transferOwnership',
    args: [newOwner as `0x${string}`],
    account,
  });

  const txHash = await walletClient.writeContract(request);
  console.info('transferOwnership tx hash:', txHash);

  console.info(
    'Reminder: the new owner must call acceptOwnership() to finalize the transfer.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
