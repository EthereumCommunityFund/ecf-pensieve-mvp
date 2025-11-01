import type { Fixture } from '@nomicfoundation/hardhat-network-helpers/types';
import type {} from '@nomicfoundation/hardhat-toolbox-viem';
import { expect } from 'chai';
import hre from 'hardhat';

import { describe, it } from 'node:test';

import { getAddress, parseEther } from 'viem';

const networkConnectionPromise = hre.network.connect();

const networkHelpersPromise = networkConnectionPromise.then(
  ({ networkHelpers }) => networkHelpers,
);

const viemPromise = networkConnectionPromise.then(({ viem }) => viem);

async function loadFixture<T>(fixture: Fixture<T>) {
  return (await networkHelpersPromise).loadFixture(fixture);
}

function normalizeAddress(value: string) {
  return getAddress(value);
}

const time = {
  increaseTo: async (target: bigint | number) =>
    (await networkHelpersPromise).time.increaseTo(target),
};

const RATE_DENOMINATOR = 10_000n;
const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;
const TAX_BASE = RATE_DENOMINATOR * SECONDS_PER_YEAR;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ROUNDING_TOLERANCE = parseEther('0.00001');

const shieldedParameters = {
  bondRate: 2_000n,
  contentUpdateLimit: 5n,
  taxPeriod: 7n * 24n * 60n * 60n,
  annualTaxRate: 2_000n,
  minBidIncrementRate: 500n,
  minValuation: parseEther('100'),
};

function calculateBond(valuation: bigint, bondRate: bigint) {
  return (valuation * bondRate) / RATE_DENOMINATOR;
}

function calculateTax(
  valuation: bigint,
  periods: bigint,
  annualTaxRate: bigint,
  taxPeriod: bigint,
) {
  return (valuation * annualTaxRate * taxPeriod * periods) / TAX_BASE;
}

function expectApproximately(actual: bigint, expected: bigint, label: string) {
  const delta = actual >= expected ? actual - expected : expected - actual;
  expect(delta, `${label} outside tolerance`).to.be.lte(ROUNDING_TOLERANCE);
}

describe('ValuationTaxShieldedSlot', () => {
  async function deployFixture() {
    const viem = await viemPromise;

    const [deployer, treasuryWallet, governanceWallet, alice, bob, operator] =
      await viem.getWalletClients();

    const slot = await viem.deployContract(
      'ValuationTaxShieldedSlot',
      [
        treasuryWallet.account.address,
        governanceWallet.account.address,
        shieldedParameters.bondRate,
        shieldedParameters.contentUpdateLimit,
        shieldedParameters.taxPeriod,
        shieldedParameters.annualTaxRate,
        shieldedParameters.minBidIncrementRate,
        shieldedParameters.minValuation,
      ],
      { client: { wallet: deployer } },
    );

    const publicClient = await viem.getPublicClient();

    return {
      slot,
      publicClient,
      config: {
        ...shieldedParameters,
        treasury: normalizeAddress(treasuryWallet.account.address),
        governance: normalizeAddress(governanceWallet.account.address),
      },
      wallets: {
        treasury: treasuryWallet,
        governance: governanceWallet,
        alice,
        bob,
        operator,
      },
    } as const;
  }

  it('runs claim → takeOver → renew → forfeit and clears owner state', async () => {
    const { slot, publicClient, config, wallets } =
      await loadFixture(deployFixture);
    const { alice, bob } = wallets;

    const viem = await viemPromise;

    const slotAsAlice = await viem.getContractAt(
      'ValuationTaxShieldedSlot',
      slot.address,
      {
        client: { wallet: alice },
      },
    );

    const initialValuation = parseEther('400');
    const claimPeriods = 2n;
    const bondForAlice = calculateBond(initialValuation, config.bondRate);
    const taxForAlice = calculateTax(
      initialValuation,
      claimPeriods,
      config.annualTaxRate,
      config.taxPeriod,
    );

    const claimHash = await slotAsAlice.write.claim(
      [initialValuation, claimPeriods, 'ipfs://alice/ad'],
      { value: bondForAlice + taxForAlice },
    );
    await publicClient.waitForTransactionReceipt({ hash: claimHash });

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(alice.account.address),
    );
    expect(await slot.read.valuation()).to.equal(initialValuation);
    expect(await slot.read.bondedAmount()).to.equal(bondForAlice);
    expect(await slot.read.prepaidTaxBalance()).to.equal(taxForAlice);

    const slotAsBob = await viem.getContractAt(
      'ValuationTaxShieldedSlot',
      slot.address,
      {
        client: { wallet: bob },
      },
    );

    const takeoverValuation = parseEther('600');
    const takeoverPeriods = 3n;
    const bondForBob = calculateBond(takeoverValuation, config.bondRate);
    const taxForBob = calculateTax(
      takeoverValuation,
      takeoverPeriods,
      config.annualTaxRate,
      config.taxPeriod,
    );

    const takeoverHash = await slotAsBob.write.takeOver(
      [takeoverValuation, takeoverPeriods, 'ipfs://bob/ad'],
      { value: bondForBob + taxForBob },
    );
    await publicClient.waitForTransactionReceipt({ hash: takeoverHash });

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(bob.account.address),
    );
    expect(await slot.read.valuation()).to.equal(takeoverValuation);
    expect(await slot.read.bondedAmount()).to.equal(bondForBob);
    const prepaidAfterTakeover = await slot.read.prepaidTaxBalance();
    expectApproximately(
      prepaidAfterTakeover,
      taxForBob,
      'prepaid after takeover',
    );

    const renewTax = calculateTax(
      takeoverValuation,
      1n,
      config.annualTaxRate,
      config.taxPeriod,
    );
    const renewHash = await slotAsBob.write.renew([1n], { value: renewTax });
    await publicClient.waitForTransactionReceipt({ hash: renewHash });

    const prepaidAfterRenew = await slot.read.prepaidTaxBalance();
    expectApproximately(
      prepaidAfterRenew,
      taxForBob + renewTax,
      'prepaid after renew',
    );

    const forfeitHash = await slotAsBob.write.forfeit();
    await publicClient.waitForTransactionReceipt({ hash: forfeitHash });

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(ZERO_ADDRESS),
    );
    expect(await slot.read.valuation()).to.equal(0n);
    expect(await slot.read.bondedAmount()).to.equal(0n);
    expectApproximately(
      await slot.read.prepaidTaxBalance(),
      0n,
      'prepaid balance after forfeit',
    );
    expect(await slot.read.taxPaidUntil()).to.equal(0n);
    expect(await slot.read.lastTaxSettlement()).to.equal(0n);
    expect(await slot.read.currentAdURI()).to.equal('');
  });

  it('expires via poke after coverage lapses and forwards prepaid tax to the treasury', async () => {
    const { slot, publicClient, config, wallets } =
      await loadFixture(deployFixture);
    const { alice, operator } = wallets;

    const viem = await viemPromise;

    const slotAsAlice = await viem.getContractAt(
      'ValuationTaxShieldedSlot',
      slot.address,
      {
        client: { wallet: alice },
      },
    );

    const valuation = parseEther('350');
    const claimPeriods = 1n;
    const bond = calculateBond(valuation, config.bondRate);
    const tax = calculateTax(
      valuation,
      claimPeriods,
      config.annualTaxRate,
      config.taxPeriod,
    );

    const claimHash = await slotAsAlice.write.claim(
      [valuation, claimPeriods, 'ipfs://alice/creative'],
      { value: bond + tax },
    );
    const claimReceipt = await publicClient.waitForTransactionReceipt({
      hash: claimHash,
    });
    const claimBlock = await publicClient.getBlock({
      blockNumber: claimReceipt.blockNumber,
    });
    const paidThrough = claimBlock.timestamp + config.taxPeriod * claimPeriods;

    await time.increaseTo(paidThrough + config.taxPeriod);

    const treasuryBalanceBefore = await publicClient.getBalance({
      address: config.treasury,
    });

    const slotAsOperator = await viem.getContractAt(
      'ValuationTaxShieldedSlot',
      slot.address,
      {
        client: { wallet: operator },
      },
    );
    const pokeHash = await slotAsOperator.write.poke();
    await publicClient.waitForTransactionReceipt({ hash: pokeHash });

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(ZERO_ADDRESS),
    );
    expect(await slot.read.bondedAmount()).to.equal(0n);
    expect(await slot.read.prepaidTaxBalance()).to.equal(0n);
    expect(await slot.read.taxPaidUntil()).to.equal(0n);
    expect(await slot.read.lastTaxSettlement()).to.equal(0n);

    const treasuryBalanceAfter = await publicClient.getBalance({
      address: config.treasury,
    });
    expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(tax);
  });
});
