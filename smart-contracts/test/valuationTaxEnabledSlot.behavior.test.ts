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

const enabledParameters = {
  bondRate: 1_000n,
  contentUpdateLimit: 10n,
  taxPeriod: 7n * 24n * 60n * 60n,
  annualTaxRate: 8_000n,
  minBidIncrementRate: 500n,
  minValuation: parseEther('100'),
  dustRate: 2_000n,
};

function calculateLocked(valuation: bigint, bondRate: bigint) {
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

function calculateSettledTax(
  valuation: bigint,
  annualTaxRate: bigint,
  taxPeriod: bigint,
) {
  const taxFactor = annualTaxRate * taxPeriod;
  const taxDenominator = TAX_BASE + taxFactor;
  const theoreticalValuation = (valuation * TAX_BASE) / taxDenominator;
  return valuation - theoreticalValuation;
}

describe('ValuationTaxEnabledSlot', () => {
  async function deployFixture() {
    const viem = await viemPromise;

    const [deployer, treasuryWallet, governanceWallet, alice, bob, operator] =
      await viem.getWalletClients();

    const slot = await viem.deployContract(
      'ValuationTaxEnabledSlot',
      [
        treasuryWallet.account.address,
        governanceWallet.account.address,
        enabledParameters.bondRate,
        enabledParameters.contentUpdateLimit,
        enabledParameters.taxPeriod,
        enabledParameters.annualTaxRate,
        enabledParameters.minBidIncrementRate,
        enabledParameters.minValuation,
        enabledParameters.dustRate,
      ],
      { client: { wallet: deployer } },
    );

    const publicClient = await viem.getPublicClient();

    return {
      slot,
      publicClient,
      config: {
        ...enabledParameters,
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

  it('executes claim → takeOver → renew and enables forfeit once overdue tax drains the slot', async () => {
    const { slot, publicClient, config, wallets } =
      await loadFixture(deployFixture);
    const { alice, bob } = wallets;

    const viem = await viemPromise;

    const slotAsAlice = await viem.getContractAt(
      'ValuationTaxEnabledSlot',
      slot.address,
      {
        client: { wallet: alice },
      },
    );

    const initialValuation = parseEther('1000');
    const claimPeriods = 2n;
    const lockedForAlice = calculateLocked(initialValuation, config.bondRate);
    const taxForAlice = calculateTax(
      initialValuation,
      claimPeriods,
      config.annualTaxRate,
      config.taxPeriod,
    );

    const claimHash = await slotAsAlice.write.claim(
      [initialValuation, claimPeriods, 'ipfs://alice/ad'],
      { value: lockedForAlice + taxForAlice },
    );
    const claimReceipt = await publicClient.waitForTransactionReceipt({
      hash: claimHash,
    });
    const claimBlock = await publicClient.getBlock({
      blockNumber: claimReceipt.blockNumber,
    });

    const expectedClaimPaidThrough =
      claimBlock.timestamp + config.taxPeriod * claimPeriods;

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(alice.account.address),
    );
    expect(await slot.read.valuation()).to.equal(initialValuation);
    expect(await slot.read.lockedValuation()).to.equal(lockedForAlice);
    expect(await slot.read.prepaidTaxBalance()).to.equal(taxForAlice);
    expect(await slot.read.taxPaidUntil()).to.equal(expectedClaimPaidThrough);

    const slotAsBob = await viem.getContractAt(
      'ValuationTaxEnabledSlot',
      slot.address,
      {
        client: { wallet: bob },
      },
    );

    const takeoverValuation = parseEther('1500');
    const takeoverPeriods = 3n;
    const lockedForBob = calculateLocked(takeoverValuation, config.bondRate);
    const taxForBob = calculateTax(
      takeoverValuation,
      takeoverPeriods,
      config.annualTaxRate,
      config.taxPeriod,
    );

    const takeoverHash = await slotAsBob.write.takeOver(
      [takeoverValuation, takeoverPeriods, 'ipfs://bob/ad'],
      { value: lockedForBob + taxForBob },
    );
    const takeoverReceipt = await publicClient.waitForTransactionReceipt({
      hash: takeoverHash,
    });
    const takeoverBlock = await publicClient.getBlock({
      blockNumber: takeoverReceipt.blockNumber,
    });
    const expectedTakeoverPaidThrough =
      takeoverBlock.timestamp + config.taxPeriod * takeoverPeriods;

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(bob.account.address),
    );
    expect(await slot.read.valuation()).to.equal(takeoverValuation);
    expect(await slot.read.lockedValuation()).to.equal(lockedForBob);
    expect(await slot.read.prepaidTaxBalance()).to.equal(taxForBob);
    expect(await slot.read.taxPaidUntil()).to.equal(
      expectedTakeoverPaidThrough,
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
    expect(prepaidAfterRenew).to.equal(taxForBob + renewTax);

    const paidThroughAfterRenew = await slot.read.taxPaidUntil();
    expect(paidThroughAfterRenew).to.equal(
      expectedTakeoverPaidThrough + config.taxPeriod,
    );

    const treasuryBalanceBefore = await publicClient.getBalance({
      address: config.treasury,
    });
    const exhaustionTarget = paidThroughAfterRenew + config.taxPeriod * 20n;
    await time.increaseTo(exhaustionTarget);

    const forfeitHash = await slotAsBob.write.forfeit();
    await publicClient.waitForTransactionReceipt({ hash: forfeitHash });

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(ZERO_ADDRESS),
    );
    expect(await slot.read.valuation()).to.equal(0n);
    expect(await slot.read.lockedValuation()).to.equal(0n);
    expect(await slot.read.baseValuation()).to.equal(0n);
    expect(await slot.read.prepaidTaxBalance()).to.equal(0n);
    expect(await slot.read.taxPaidUntil()).to.equal(0n);

    const treasuryBalanceAfter = await publicClient.getBalance({
      address: config.treasury,
    });
    expect(treasuryBalanceAfter).to.be.gt(treasuryBalanceBefore);
  });

  it('settles overdue tax via poke while keeping the slot occupied when collateral remains', async () => {
    const { slot, publicClient, config, wallets } =
      await loadFixture(deployFixture);
    const { alice, operator } = wallets;

    const viem = await viemPromise;

    const slotAsAlice = await viem.getContractAt(
      'ValuationTaxEnabledSlot',
      slot.address,
      {
        client: { wallet: alice },
      },
    );

    const valuation = parseEther('600');
    const claimPeriods = 1n;
    const locked = calculateLocked(valuation, config.bondRate);
    const tax = calculateTax(
      valuation,
      claimPeriods,
      config.annualTaxRate,
      config.taxPeriod,
    );

    const claimHash = await slotAsAlice.write.claim(
      [valuation, claimPeriods, 'ipfs://alice/creative'],
      { value: locked + tax },
    );
    const claimReceipt = await publicClient.waitForTransactionReceipt({
      hash: claimHash,
    });
    const claimBlock = await publicClient.getBlock({
      blockNumber: claimReceipt.blockNumber,
    });
    const paidThrough = claimBlock.timestamp + config.taxPeriod * claimPeriods;

    const lockedBefore = await slot.read.lockedValuation();
    expect(lockedBefore).to.equal(locked);

    await time.increaseTo(paidThrough);

    const slotAsOperator = await viem.getContractAt(
      'ValuationTaxEnabledSlot',
      slot.address,
      {
        client: { wallet: operator },
      },
    );

    const pokeHash = await slotAsOperator.write.poke();
    await publicClient.waitForTransactionReceipt({ hash: pokeHash });

    expect(normalizeAddress(await slot.read.currentOwner())).to.equal(
      normalizeAddress(alice.account.address),
    );

    const lockedAfter = await slot.read.lockedValuation();
    expect(lockedAfter).to.equal(lockedBefore);

    const valuationAfter = await slot.read.valuation();
    expect(valuationAfter).to.be.lt(valuation);

    const prepaidAfter = await slot.read.prepaidTaxBalance();
    const expectedPrepaidResidual =
      tax -
      calculateSettledTax(valuation, config.annualTaxRate, config.taxPeriod);
    expect(prepaidAfter).to.equal(expectedPrepaidResidual);

    const taxPaidUntilAfter = await slot.read.taxPaidUntil();
    expect(taxPaidUntilAfter).to.equal(paidThrough + config.taxPeriod);
  });
});
