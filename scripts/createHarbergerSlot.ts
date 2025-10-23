/**
 * Script to create Harberger slots via HarbergerFactory.
 *
 * Required precautions:
 * 1. PRIVATE_KEY must be the current owner’s private key for HarbergerFactory (not just the address).
 * 2. Treasury and governance addresses must be configured before creating slots (Ignition deployments do this automatically).
 *    If either address is still zero, the script will abort; set SET_GLOBAL_ADDRESSES=true to update them.
 * 3. Keep sensitive values in environment variables (e.g., `.env.local`); the script never reads plaintext key files.
 * 4. Recommended flow: run once with defaults (no SET_GLOBAL_ADDRESSES) to inspect on-chain state, then adjust SLOT_TYPE
 *    or slot economics as needed.
 *
 * Required environment variables:
 *   PRIVATE_KEY                             Private key of the HarbergerFactory owner (0x-prefixed)
 *   RPC_URL                                 RPC endpoint for the target chain (Sepolia by default)
 *
 * Example command:
 *   PRIVATE_KEY=0x... RPC_URL=https://... pnpm tsx scripts/createHarbergerSlot.ts
 *
 * Optional environment variables:
 *   SET_GLOBAL_ADDRESSES=true               Invoke setGlobalAddresses (default false)
 *     ↳ When enabled, provide non-zero addresses via:
 *        · TREASURY_ADDRESS / GOVERNANCE_ADDRESS, or
 *        · rely on existing on-chain values (the script reuses them if non-zero)
 *   TREASURY_ADDRESS=0x...                  Override treasury for setGlobalAddresses
 *   GOVERNANCE_ADDRESS=0x...                Override governance for setGlobalAddresses
 *   SLOT_TYPE=enabled|shielded              Slot variant to create (default enabled)
 *   BOND_RATE_BPS=2000                      Bond rate in basis points (BigInt-compatible)
 *   CONTENT_UPDATE_LIMIT=5
 *   TAX_PERIOD_SECONDS=86400
 *   ANNUAL_TAX_RATE_BPS=500
 *   MIN_BID_INCREMENT_BPS=1000
 *   MIN_VALUATION_ETH=2                     Minimum valuation in ETH
 *   DUST_RATE_BPS=100                       Only used for enabled slots
 */

import 'dotenv/config';

import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
} from '@/constants/harbergerFactory';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
const DEFAULT_BOND_RATE_BPS = BigInt(2000);
const DEFAULT_CONTENT_UPDATE_LIMIT = BigInt(5);
const DEFAULT_TAX_PERIOD_SECONDS = BigInt(86400);
const DEFAULT_ANNUAL_TAX_RATE_BPS = BigInt(500);
const DEFAULT_MIN_BID_INCREMENT_BPS = BigInt(1000);
const DEFAULT_DUST_RATE_BPS = BigInt(100);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function normalizeBigIntEnv(
  value: string | undefined,
  fallback: bigint,
): bigint {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric environment variable: ${value}`);
  }
  return BigInt(parsed);
}

async function maybeSetGlobalAddresses(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  currentTreasury: `0x${string}`,
  currentGovernance: `0x${string}`,
) {
  const hasConfiguredGlobals =
    currentTreasury !== ZERO_ADDRESS && currentGovernance !== ZERO_ADDRESS;

  if (process.env.SET_GLOBAL_ADDRESSES !== 'true') {
    if (!hasConfiguredGlobals) {
      console.warn(
        'Factory treasury/governance are unset. Configure them by running with SET_GLOBAL_ADDRESSES=true.',
      );
    } else {
      console.info(
        'Factory already has treasury/governance configured; skipping setGlobalAddresses.',
      );
    }
    return;
  }

  const treasury = readOptionalEnv('TREASURY_ADDRESS') ?? currentTreasury;
  const governance = readOptionalEnv('GOVERNANCE_ADDRESS') ?? currentGovernance;

  if (treasury === ZERO_ADDRESS || governance === ZERO_ADDRESS) {
    throw new Error(
      'setGlobalAddresses requires non-zero addresses. Provide TREASURY_ADDRESS and GOVERNANCE_ADDRESS.',
    );
  }

  const { request } = await publicClient.simulateContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'setGlobalAddresses',
    args: [treasury, governance],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  console.info('setGlobalAddresses tx hash:', hash);
}

async function createSlot(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
) {
  const slotType =
    process.env.SLOT_TYPE === 'shielded' ? 'shielded' : 'enabled';

  const bondRateBps = normalizeBigIntEnv(
    process.env.BOND_RATE_BPS,
    DEFAULT_BOND_RATE_BPS,
  );
  const contentUpdateLimit = normalizeBigIntEnv(
    process.env.CONTENT_UPDATE_LIMIT,
    DEFAULT_CONTENT_UPDATE_LIMIT,
  );
  const taxPeriodSeconds = normalizeBigIntEnv(
    process.env.TAX_PERIOD_SECONDS,
    DEFAULT_TAX_PERIOD_SECONDS,
  );
  const annualTaxRateBps = normalizeBigIntEnv(
    process.env.ANNUAL_TAX_RATE_BPS,
    DEFAULT_ANNUAL_TAX_RATE_BPS,
  );
  const minBidIncrementBps = normalizeBigIntEnv(
    process.env.MIN_BID_INCREMENT_BPS,
    DEFAULT_MIN_BID_INCREMENT_BPS,
  );

  const minValuationEth = process.env.MIN_VALUATION_ETH ?? '2';
  const minValuationWei = parseEther(minValuationEth);

  if (slotType === 'enabled') {
    const dustRateBps = normalizeBigIntEnv(
      process.env.DUST_RATE_BPS,
      DEFAULT_DUST_RATE_BPS,
    );
    const { request } = await publicClient.simulateContract({
      address: HARBERGER_FACTORY_ADDRESS,
      abi: HARBERGER_FACTORY_ABI,
      functionName: 'createValuationTaxEnabledSlot',
      args: [
        bondRateBps,
        contentUpdateLimit,
        taxPeriodSeconds,
        annualTaxRateBps,
        minBidIncrementBps,
        minValuationWei,
        dustRateBps,
      ],
      account: walletClient.account,
    });
    const hash = await walletClient.writeContract(request);
    console.info('createValuationTaxEnabledSlot tx hash:', hash);
  } else {
    const { request } = await publicClient.simulateContract({
      address: HARBERGER_FACTORY_ADDRESS,
      abi: HARBERGER_FACTORY_ABI,
      functionName: 'createValuationTaxShieldedSlot',
      args: [
        bondRateBps,
        contentUpdateLimit,
        taxPeriodSeconds,
        annualTaxRateBps,
        minBidIncrementBps,
        minValuationWei,
      ],
      account: walletClient.account,
    });
    const hash = await walletClient.writeContract(request);
    console.info('createValuationTaxShieldedSlot tx hash:', hash);
  }
}

type FactoryState = {
  treasury: `0x${string}`;
  governance: `0x${string}`;
  slotIdCounter: bigint;
  enabledSlots: `0x${string}`[];
  shieldedSlots: `0x${string}`[];
};

async function fetchFactoryState(
  publicClient: ReturnType<typeof createPublicClient>,
): Promise<FactoryState> {
  const [treasury, governance, slotIdCounter, enabledSlots, shieldedSlots] =
    await Promise.all([
      publicClient.readContract({
        address: HARBERGER_FACTORY_ADDRESS,
        abi: HARBERGER_FACTORY_ABI,
        functionName: 'treasury',
      }) as Promise<`0x${string}`>,
      publicClient.readContract({
        address: HARBERGER_FACTORY_ADDRESS,
        abi: HARBERGER_FACTORY_ABI,
        functionName: 'governance',
      }) as Promise<`0x${string}`>,
      publicClient.readContract({
        address: HARBERGER_FACTORY_ADDRESS,
        abi: HARBERGER_FACTORY_ABI,
        functionName: 'slotIdCounter',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: HARBERGER_FACTORY_ADDRESS,
        abi: HARBERGER_FACTORY_ABI,
        functionName: 'getValuationTaxEnabledSlots',
      }) as Promise<`0x${string}`[]>,
      publicClient.readContract({
        address: HARBERGER_FACTORY_ADDRESS,
        abi: HARBERGER_FACTORY_ABI,
        functionName: 'getValuationTaxShieldedSlots',
      }) as Promise<`0x${string}`[]>,
    ]);

  return {
    treasury,
    governance,
    slotIdCounter,
    enabledSlots,
    shieldedSlots,
  };
}

function logFactoryState(label: string, state: FactoryState) {
  console.info(`\n[${label}]`);
  console.info('  treasury:', state.treasury);
  console.info('  governance:', state.governance);
  console.info('  slotIdCounter:', state.slotIdCounter.toString());
  console.info('  enabled slots:', state.enabledSlots);
  console.info('  shielded slots:', state.shieldedSlots);
}

async function main() {
  const privateKey = requireEnv('PRIVATE_KEY');
  const rpcUrl = requireEnv('RPC_URL');

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const transport = http(rpcUrl);

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport,
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport,
  });

  console.info('HarbergerFactory address:', HARBERGER_FACTORY_ADDRESS);
  console.info('Using account:', account.address);

  const initialState = await fetchFactoryState(publicClient);
  logFactoryState('Factory state before operations', initialState);

  await maybeSetGlobalAddresses(
    walletClient,
    publicClient,
    initialState.treasury,
    initialState.governance,
  );

  let stateForCreation = initialState;
  const needsRefreshAfterGlobals =
    process.env.SET_GLOBAL_ADDRESSES === 'true' ||
    initialState.treasury === ZERO_ADDRESS ||
    initialState.governance === ZERO_ADDRESS;

  if (needsRefreshAfterGlobals) {
    stateForCreation = await fetchFactoryState(publicClient);
    logFactoryState(
      'Factory state after potential global update',
      stateForCreation,
    );
  }

  if (
    stateForCreation.treasury === ZERO_ADDRESS ||
    stateForCreation.governance === ZERO_ADDRESS
  ) {
    throw new Error(
      'Factory treasury/governance are still zero; cannot create slots until they are configured.',
    );
  }

  await createSlot(walletClient, publicClient);

  const finalState = await fetchFactoryState(publicClient);
  logFactoryState('Factory state after createSlot', finalState);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
