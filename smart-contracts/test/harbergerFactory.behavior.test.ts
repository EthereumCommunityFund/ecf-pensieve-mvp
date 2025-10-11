import type { Fixture } from '@nomicfoundation/hardhat-network-helpers/types';
import type {} from '@nomicfoundation/hardhat-toolbox-viem';
import { expect } from 'chai';
import hre from 'hardhat';

import { describe, it } from 'node:test';

import type { Address } from 'viem';
import { ContractFunctionExecutionError, getAddress, parseEther } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SLOT_TYPE_ENABLED = 1;
const SLOT_TYPE_SHIELDED = 2;

const networkConnectionPromise = hre.network.connect();

const networkHelpersPromise = networkConnectionPromise.then(
  ({ networkHelpers }) => networkHelpers,
);

const viemPromise = networkConnectionPromise.then(({ viem }) => viem);

async function loadFixture<T>(fixture: Fixture<T>) {
  return (await networkHelpersPromise).loadFixture(fixture);
}

function normalizeSlotInfo(info: any): {
  slotAddress: Address;
  slotType: number;
} {
  if (Array.isArray(info)) {
    const [slotAddress, slotType] = info as [string, bigint];
    return {
      slotAddress: normalizeAddress(slotAddress),
      slotType: toNumber(slotType),
    };
  }

  return {
    slotAddress: normalizeAddress(info.slotAddress as string),
    slotType: toNumber(info.slotType),
  };
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') return Number(value);
  throw new Error('Unsupported numeric value');
}

function normalizeAddress(value: string): Address {
  return getAddress(value);
}

async function expectRejection(promise: Promise<unknown>, label: string) {
  let rejected = false;
  try {
    await promise;
  } catch (error) {
    rejected = true;
    expect(error instanceof ContractFunctionExecutionError).to.equal(
      true,
      `Expected ${label} to fail with ContractFunctionExecutionError, got ${error?.constructor?.name}`,
    );
  }

  expect(rejected).to.equal(
    true,
    `Expected ${label} call to revert with a contract execution error`,
  );
}

const enabledParameters = {
  bondRate: 1_000n,
  contentUpdateLimit: 10n,
  taxPeriod: 7n * 24n * 60n * 60n,
  annualTaxRate: 4_000n,
  minBidIncrementRate: 500n,
  minValuation: parseEther('100'),
  dustRate: 2_000n,
};

const shieldedParameters = {
  bondRate: 1_500n,
  contentUpdateLimit: 5n,
  taxPeriod: 7n * 24n * 60n * 60n,
  annualTaxRate: 2_500n,
  minBidIncrementRate: 500n,
  minValuation: parseEther('50'),
};

async function deployConfiguredFactoryFixture() {
  const viem = await viemPromise;
  const [owner, treasuryWallet, governanceWallet, pendingOwner, outsider] =
    await viem.getWalletClients();

  const factory = await viem.deployContract(
    'HarbergerFactory',
    [treasuryWallet.account.address, governanceWallet.account.address],
    { client: { wallet: owner } },
  );

  const publicClient = await viem.getPublicClient();

  return {
    factory,
    publicClient,
    wallets: {
      owner,
      treasury: treasuryWallet,
      governance: governanceWallet,
      pendingOwner,
      outsider,
    },
  } as const;
}

async function deployUnconfiguredFactoryFixture() {
  const viem = await viemPromise;
  const [owner, treasuryWallet, governanceWallet, outsider] =
    await viem.getWalletClients();

  const factory = await viem.deployContract(
    'HarbergerFactory',
    [ZERO_ADDRESS, ZERO_ADDRESS],
    { client: { wallet: owner } },
  );

  const publicClient = await viem.getPublicClient();

  return {
    factory,
    publicClient,
    wallets: {
      owner,
      treasury: treasuryWallet,
      governance: governanceWallet,
      outsider,
    },
  } as const;
}

describe('HarbergerFactory', () => {
  it('sets the deployer as owner and accepts initial global addresses', async () => {
    const { factory, wallets } = await loadFixture(
      deployConfiguredFactoryFixture,
    );
    const { owner, treasury, governance } = wallets;

    expect(await factory.read.owner()).to.equal(
      getAddress(owner.account.address),
    );
    expect(await factory.read.pendingOwner()).to.equal(ZERO_ADDRESS);
    expect(await factory.read.treasury()).to.equal(
      getAddress(treasury.account.address),
    );
    expect(await factory.read.governance()).to.equal(
      getAddress(governance.account.address),
    );
  });

  it('allows only the owner to configure global addresses', async () => {
    const { factory, publicClient, wallets } = await loadFixture(
      deployUnconfiguredFactoryFixture,
    );
    const { owner, treasury, governance, outsider } = wallets;
    const viem = await viemPromise;

    expect(await factory.read.treasury()).to.equal(ZERO_ADDRESS);
    expect(await factory.read.governance()).to.equal(ZERO_ADDRESS);

    const factoryAsOutsider = await viem.getContractAt(
      'HarbergerFactory',
      factory.address,
      {
        client: { wallet: outsider },
      },
    );

    await expectRejection(
      factoryAsOutsider.write.setGlobalAddresses([
        treasury.account.address,
        governance.account.address,
      ]),
      'setGlobalAddresses (outsider)',
    );

    const txHash = await factory.write.setGlobalAddresses([
      treasury.account.address,
      governance.account.address,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    expect(await factory.read.treasury()).to.equal(
      getAddress(treasury.account.address),
    );
    expect(await factory.read.governance()).to.equal(
      getAddress(governance.account.address),
    );
  });

  it('follows a two-step ownership transfer', async () => {
    const { factory, publicClient, wallets } = await loadFixture(
      deployConfiguredFactoryFixture,
    );
    const { owner, pendingOwner, outsider } = wallets;
    const viem = await viemPromise;

    const factoryAsOutsider = await viem.getContractAt(
      'HarbergerFactory',
      factory.address,
      {
        client: { wallet: outsider },
      },
    );

    await expectRejection(
      factoryAsOutsider.write.transferOwnership([pendingOwner.account.address]),
      'transferOwnership (outsider)',
    );

    const transferHash = await factory.write.transferOwnership([
      pendingOwner.account.address,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: transferHash });

    expect(await factory.read.pendingOwner()).to.equal(
      getAddress(pendingOwner.account.address),
    );
    expect(await factory.read.owner()).to.equal(
      getAddress(owner.account.address),
    );

    await expectRejection(
      factoryAsOutsider.write.acceptOwnership(),
      'acceptOwnership (outsider)',
    );

    const factoryAsPendingOwner = await viem.getContractAt(
      'HarbergerFactory',
      factory.address,
      {
        client: { wallet: pendingOwner },
      },
    );

    const acceptHash = await factoryAsPendingOwner.write.acceptOwnership();
    await publicClient.waitForTransactionReceipt({ hash: acceptHash });

    expect(await factory.read.owner()).to.equal(
      getAddress(pendingOwner.account.address),
    );
    expect(await factory.read.pendingOwner()).to.equal(ZERO_ADDRESS);
  });

  it('deploys valuation tax enabled slots and tracks metadata', async () => {
    const { factory, publicClient, wallets } = await loadFixture(
      deployConfiguredFactoryFixture,
    );
    const { owner, treasury, governance } = wallets;
    const viem = await viemPromise;

    const creationHash = await factory.write.createValuationTaxEnabledSlot([
      enabledParameters.bondRate,
      enabledParameters.contentUpdateLimit,
      enabledParameters.taxPeriod,
      enabledParameters.annualTaxRate,
      enabledParameters.minBidIncrementRate,
      enabledParameters.minValuation,
      enabledParameters.dustRate,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: creationHash });

    expect(toNumber(await factory.read.slotIdCounter())).to.equal(1);

    const slots = await factory.read.getValuationTaxEnabledSlots();
    expect(slots).to.have.lengthOf(1);

    const slotInfo = normalizeSlotInfo(await factory.read.getSlot([1n]));
    expect(slotInfo.slotType).to.equal(SLOT_TYPE_ENABLED);
    expect(slotInfo.slotAddress).to.equal(normalizeAddress(slots[0]));

    expect(
      toNumber(await factory.read.slotTypeByAddress([slotInfo.slotAddress])),
    ).to.equal(SLOT_TYPE_ENABLED);

    const slotContract = await viem.getContractAt(
      'ValuationTaxEnabledSlot',
      slotInfo.slotAddress,
    );

    expect(normalizeAddress(await slotContract.read.treasury())).to.equal(
      normalizeAddress(treasury.account.address),
    );
    expect(normalizeAddress(await slotContract.read.governance())).to.equal(
      normalizeAddress(governance.account.address),
    );
    expect(normalizeAddress(await slotContract.read.factory())).to.equal(
      normalizeAddress(factory.address),
    );
    expect(await slotContract.read.bondRate()).to.equal(
      enabledParameters.bondRate,
    );
    expect(await slotContract.read.taxPeriodInSeconds()).to.equal(
      enabledParameters.taxPeriod,
    );
    expect(await slotContract.read.dustRate()).to.equal(
      enabledParameters.dustRate,
    );

    const shieldedSlots = await factory.read.getValuationTaxShieldedSlots();
    expect(shieldedSlots).to.have.lengthOf(0);
  });

  it('deploys valuation tax shielded slots and tracks metadata', async () => {
    const { factory, publicClient, wallets } = await loadFixture(
      deployConfiguredFactoryFixture,
    );
    const { treasury, governance } = wallets;
    const viem = await viemPromise;

    const creationHash = await factory.write.createValuationTaxShieldedSlot([
      shieldedParameters.bondRate,
      shieldedParameters.contentUpdateLimit,
      shieldedParameters.taxPeriod,
      shieldedParameters.annualTaxRate,
      shieldedParameters.minBidIncrementRate,
      shieldedParameters.minValuation,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: creationHash });

    expect(toNumber(await factory.read.slotIdCounter())).to.equal(1);

    const slots = await factory.read.getValuationTaxShieldedSlots();
    expect(slots).to.have.lengthOf(1);

    const slotInfo = normalizeSlotInfo(await factory.read.getSlot([1n]));
    expect(slotInfo.slotType).to.equal(SLOT_TYPE_SHIELDED);
    expect(slotInfo.slotAddress).to.equal(normalizeAddress(slots[0]));

    expect(
      toNumber(await factory.read.slotTypeByAddress([slotInfo.slotAddress])),
    ).to.equal(SLOT_TYPE_SHIELDED);

    const slotContract = await viem.getContractAt(
      'ValuationTaxShieldedSlot',
      slotInfo.slotAddress,
    );

    expect(normalizeAddress(await slotContract.read.treasury())).to.equal(
      normalizeAddress(treasury.account.address),
    );
    expect(normalizeAddress(await slotContract.read.governance())).to.equal(
      normalizeAddress(governance.account.address),
    );
    expect(normalizeAddress(await slotContract.read.factory())).to.equal(
      normalizeAddress(factory.address),
    );
    expect(await slotContract.read.bondRate()).to.equal(
      shieldedParameters.bondRate,
    );
    expect(await slotContract.read.taxPeriodInSeconds()).to.equal(
      shieldedParameters.taxPeriod,
    );

    const enabledSlots = await factory.read.getValuationTaxEnabledSlots();
    expect(enabledSlots).to.have.lengthOf(0);
  });

  it('requires global addresses before slot creation', async () => {
    const { factory } = await loadFixture(deployUnconfiguredFactoryFixture);

    await expectRejection(
      factory.write.createValuationTaxEnabledSlot([
        enabledParameters.bondRate,
        enabledParameters.contentUpdateLimit,
        enabledParameters.taxPeriod,
        enabledParameters.annualTaxRate,
        enabledParameters.minBidIncrementRate,
        enabledParameters.minValuation,
        enabledParameters.dustRate,
      ]),
      'createValuationTaxEnabledSlot (missing globals)',
    );

    await expectRejection(
      factory.write.createValuationTaxShieldedSlot([
        shieldedParameters.bondRate,
        shieldedParameters.contentUpdateLimit,
        shieldedParameters.taxPeriod,
        shieldedParameters.annualTaxRate,
        shieldedParameters.minBidIncrementRate,
        shieldedParameters.minValuation,
      ]),
      'createValuationTaxShieldedSlot (missing globals)',
    );
  });
});
