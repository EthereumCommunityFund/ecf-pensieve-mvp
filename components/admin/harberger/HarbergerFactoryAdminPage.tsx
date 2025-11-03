'use client';

import { ArrowLeft } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { isAddress, parseEther } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { addToast } from '@/components/base/toast';
import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
  HARBERGER_FACTORY_OWNER,
  ZERO_ADDRESS,
  type SlotTypeKey,
} from '@/constants/harbergerFactory';
import { useHarbergerFactoryState } from '@/hooks/useHarbergerFactoryState';
import { formatViemError } from '@/utils/viem';

type GlobalAddressFormValues = {
  treasury: string;
  governance: string;
};

type SlotVariant = SlotTypeKey;

type CreateSlotFormValues = {
  slotType: SlotVariant;
  bondRatePercent: string;
  contentUpdateLimit: string;
  taxPeriodDays: string;
  annualTaxRatePercent: string;
  minBidIncrementPercent: string;
  minValuationEth: string;
  dustRatePercent?: string;
};

const DEFAULT_CREATE_VALUES: CreateSlotFormValues = {
  slotType: 'enabled',
  bondRatePercent: '20',
  contentUpdateLimit: '5',
  taxPeriodDays: '30',
  annualTaxRatePercent: '5',
  minBidIncrementPercent: '10',
  minValuationEth: '0.5',
  dustRatePercent: '1',
};

export const HarbergerFactoryAdminPage = () => {
  const router = useRouter();
  const { address: walletAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data, error, isLoading, refresh, isConfigured, lastUpdatedAt } =
    useHarbergerFactoryState();

  const [isSettingGlobals, setIsSettingGlobals] = useState(false);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);

  const globalForm = useForm<GlobalAddressFormValues>({
    mode: 'onBlur',
    defaultValues: {
      treasury: data?.treasury ?? '',
      governance: data?.governance ?? '',
    },
  });

  const createForm = useForm<CreateSlotFormValues>({
    mode: 'onBlur',
    defaultValues: DEFAULT_CREATE_VALUES,
  });

  const enabledSlots = data?.enabledSlots ?? [];
  const shieldedSlots = data?.shieldedSlots ?? [];

  const normalizedWalletAddress = useMemo(() => {
    return walletAddress?.toLowerCase() ?? null;
  }, [walletAddress]);

  const chainOwnerAddress = useMemo(() => {
    return data?.owner ? data.owner.toLowerCase() : null;
  }, [data?.owner]);

  const configuredOwnerAddress = useMemo(() => {
    return HARBERGER_FACTORY_OWNER?.toLowerCase() ?? null;
  }, []);

  const effectiveOwner = useMemo(() => {
    return chainOwnerAddress ?? configuredOwnerAddress;
  }, [chainOwnerAddress, configuredOwnerAddress]);

  const isFactoryOwner = useMemo(() => {
    if (!effectiveOwner || !normalizedWalletAddress) {
      return false;
    }
    return effectiveOwner === normalizedWalletAddress;
  }, [effectiveOwner, normalizedWalletAddress]);

  useEffect(() => {
    if (!data) return;
    globalForm.reset({
      treasury: data.treasury,
      governance: data.governance,
    });
  }, [data, globalForm]);

  const requiresWallet = (requireOwner: boolean = false) => {
    if (!walletAddress || !walletClient) {
      addToast({
        title: 'Wallet required',
        description: 'Connect a wallet with factory permissions to continue.',
        color: 'warning',
      });
      return true;
    }
    if (!walletClient.account?.address) {
      addToast({
        title: 'Wallet account unavailable',
        description: 'Reconnect your wallet to expose the account details.',
        color: 'danger',
      });
      return true;
    }
    if (!HARBERGER_FACTORY_ADDRESS) {
      addToast({
        title: 'Factory address missing',
        description:
          'NEXT_PUBLIC_HARBERGER_FACTORY_ADDRESS is not configured. Update the environment before continuing.',
        color: 'danger',
      });
      return true;
    }
    if (!publicClient) {
      addToast({
        title: 'Network unavailable',
        description:
          'Unable to access the configured RPC. Please refresh and try again.',
        color: 'danger',
      });
      return true;
    }
    if (requireOwner) {
      if (!effectiveOwner) {
        addToast({
          title: 'Factory owner missing',
          description:
            'Factory owner cannot be determined from contract or configuration. Only the designated owner can run this operation.',
          color: 'danger',
        });
        return true;
      }
      if (!isFactoryOwner) {
        addToast({
          title: 'Not authorized',
          description: `Only the factory owner ${effectiveOwner} can perform this action.`,
          color: 'danger',
        });
        return true;
      }
    }
    return false;
  };

  const handleSetGlobalAddresses = globalForm.handleSubmit(async (values) => {
    if (requiresWallet(true)) {
      return;
    }

    if (!isAddress(values.treasury) || !isAddress(values.governance)) {
      addToast({
        title: 'Invalid address',
        description: 'Treasury and governance must be valid addresses.',
        color: 'danger',
      });
      return;
    }

    try {
      setIsSettingGlobals(true);

      const account = walletClient!.account!;

      const { request } = await publicClient!.simulateContract({
        address: HARBERGER_FACTORY_ADDRESS!,
        abi: HARBERGER_FACTORY_ABI,
        functionName: 'setGlobalAddresses',
        account,
        args: [values.treasury, values.governance],
      });

      const hash = await walletClient!.writeContract(request);

      addToast({
        title: 'Transaction sent',
        description: `setGlobalAddresses submitted: ${hash}`,
        color: 'success',
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      addToast({
        title: 'Global addresses updated',
        description:
          'Factory treasury and governance addresses have been updated.',
        color: 'success',
      });

      await refresh();
    } catch (err) {
      addToast({
        title: 'Transaction failed',
        description: formatViemError(err),
        color: 'danger',
      });
    } finally {
      setIsSettingGlobals(false);
    }
  });

  const parseWholeNumberField = (label: string, value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 0) {
      throw new Error(`${label} must be a non-negative number.`);
    }
    return BigInt(Math.floor(numeric));
  };

  const parsePercentToBps = (label: string, value: string | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length === 0) {
      throw new Error(`${label} is required.`);
    }
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric) || numeric < 0) {
      throw new Error(`${label} must be a non-negative number.`);
    }
    const scaled = Math.round(numeric * 100);
    return BigInt(scaled);
  };

  const parseDaysToSeconds = (label: string, value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0) {
      throw new Error(`${label} must be greater than zero.`);
    }
    const seconds = Math.round(numeric * 86_400);
    if (seconds <= 0) {
      throw new Error(`${label} must convert to at least one second.`);
    }
    return BigInt(seconds);
  };

  const handleCreateSlot = createForm.handleSubmit(async (values) => {
    if (requiresWallet(true)) {
      return;
    }

    try {
      const bondRate = parsePercentToBps(
        'Bond rate (%)',
        values.bondRatePercent,
      );
      const contentLimit = parseWholeNumberField(
        'Content update limit',
        values.contentUpdateLimit,
      );
      const taxPeriod = parseDaysToSeconds(
        'Tax period (days)',
        values.taxPeriodDays,
      );
      const annualTax = parsePercentToBps(
        'Annual tax rate (%)',
        values.annualTaxRatePercent,
      );
      const minBidIncrement = parsePercentToBps(
        'Minimum bid increment (%)',
        values.minBidIncrementPercent,
      );

      const minValuationEth = Number(values.minValuationEth);
      if (Number.isNaN(minValuationEth) || minValuationEth <= 0) {
        throw new Error('Minimum valuation must be greater than zero.');
      }

      const minValuationWei = parseEther(values.minValuationEth);

      const slotType = values.slotType;

      const args: readonly unknown[] =
        slotType === 'enabled'
          ? [
              bondRate,
              contentLimit,
              taxPeriod,
              annualTax,
              minBidIncrement,
              minValuationWei,
              parsePercentToBps('Dust rate (%)', values.dustRatePercent ?? '0'),
            ]
          : [
              bondRate,
              contentLimit,
              taxPeriod,
              annualTax,
              minBidIncrement,
              minValuationWei,
            ];

      const functionName =
        slotType === 'enabled'
          ? 'createValuationTaxEnabledSlot'
          : 'createValuationTaxShieldedSlot';

      setIsCreatingSlot(true);

      const account = walletClient!.account!;

      const { request } = await publicClient!.simulateContract({
        address: HARBERGER_FACTORY_ADDRESS!,
        abi: HARBERGER_FACTORY_ABI,
        functionName,
        account,
        args,
      });

      const hash = await walletClient!.writeContract(request);

      addToast({
        title: 'Transaction sent',
        description: `${functionName} submitted: ${hash}`,
        color: 'success',
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      addToast({
        title: 'Slot created',
        description: 'A new slot has been created successfully.',
        color: 'success',
      });

      await refresh();
    } catch (err) {
      addToast({
        title: 'Creation failed',
        description: formatViemError(err),
        color: 'danger',
      });
    } finally {
      setIsCreatingSlot(false);
    }
  });

  const SlotList = (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-lg border border-black/10 bg-white p-3">
        <h3 className="text-lg font-semibold text-black">Enabled Slots</h3>
        {enabledSlots.length === 0 ? (
          <p className="mt-2 text-sm text-black/60">No enabled slots found.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {enabledSlots.map((slot) => (
              <li
                key={slot}
                className="break-all rounded-md border border-black/10 bg-black/5 px-3 py-1.5 text-sm text-black"
              >
                {slot}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-3">
        <h3 className="text-lg font-semibold text-black">Shielded Slots</h3>
        {shieldedSlots.length === 0 ? (
          <p className="mt-2 text-sm text-black/60">No shielded slots found.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {shieldedSlots.map((slot) => (
              <li
                key={slot}
                className="break-all rounded-md border border-black/10 bg-black/5 px-3 py-1.5 text-sm text-black"
              >
                {slot}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 py-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            startContent={<ArrowLeft size={18} />}
            onPress={() => router.push('/admin/harberger')}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-black">Harberger Factory</h1>
        </div>
        <p className="text-sm leading-5 text-black/60">
          Inspect factory state, configure global addresses, and create new
          slots without running local scripts.
        </p>
      </header>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-black">
              Factory overview
            </h2>
            <p className="text-sm text-black/60">
              Connected wallet: {walletAddress ?? 'Not connected'}
            </p>
          </div>
          <Button color="secondary" onPress={() => void refresh()}>
            Refresh
          </Button>
        </div>

        <div className="mt-3 flex gap-[10px]">
          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Treasury
            </p>
            <p className="mt-2 break-all text-sm text-black">
              {data?.treasury ?? ZERO_ADDRESS}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Governance
            </p>
            <p className="mt-2 break-all text-sm text-black">
              {data?.governance ?? ZERO_ADDRESS}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Slot counter
            </p>
            <p className="mt-2 text-sm text-black">
              {data?.slotIdCounter ? data.slotIdCounter.toString() : '0'}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Config status
            </p>
            <p
              className={`mt-2 text-sm font-semibold ${
                isConfigured ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {isConfigured ? 'Ready' : 'Treasury / governance missing'}
            </p>
            {lastUpdatedAt ? (
              <p className="mt-1 text-xs text-black/50">
                Last updated: {new Date(lastUpdatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>

        {/* <div className="mt-3">
          {isLoading ? (
            <p className="text-sm text-black/60">Loading factory state…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error.message}</p>
          ) : (
            SlotList
          )}
        </div> */}
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-black">Create slot</h2>
          <p className="text-sm text-black/60">
            Configure economic parameters and deploy a new slot directly from
            the factory.
          </p>
          {!isFactoryOwner ? (
            <p className="text-xs text-amber-700">
              Only the factory owner {effectiveOwner ?? 'N/A'} can create new
              slots. Connect the authorized wallet to enable this form.
            </p>
          ) : null}
        </div>

        <form
          className="mt-3 grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateSlot();
          }}
        >
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-black">
              Slot variant
            </label>
            <Controller
              control={createForm.control}
              name="slotType"
              render={({ field }) => (
                <div className="mt-2 flex gap-2">
                  {(['enabled', 'shielded'] as SlotVariant[]).map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                        field.value === option
                          ? 'border-black bg-black text-white'
                          : 'border-black/10 bg-black/5 text-black'
                      } ${!isFactoryOwner ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (!isFactoryOwner) return;
                        field.onChange(option);
                      }}
                      disabled={!isFactoryOwner}
                    >
                      {option === 'enabled'
                        ? 'Valuation Tax Enabled'
                        : 'Valuation Tax Shielded'}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <Input
            label="Bond rate (%)"
            description="Bond = valuation × rate ÷ 100"
            placeholder="20"
            type="number"
            labelPlacement="outside"
            isDisabled={!isFactoryOwner}
            {...createForm.register('bondRatePercent')}
          />

          <Input
            label="Tax period (days)"
            placeholder="30"
            type="number"
            labelPlacement="outside"
            isDisabled={!isFactoryOwner}
            {...createForm.register('taxPeriodDays')}
          />

          <Input
            label="Annual tax rate (%)"
            placeholder="5"
            type="number"
            labelPlacement="outside"
            isDisabled={!isFactoryOwner}
            {...createForm.register('annualTaxRatePercent')}
          />

          <Input
            label="Minimum bid increment (%)"
            placeholder="10"
            type="number"
            labelPlacement="outside"
            isDisabled={!isFactoryOwner}
            {...createForm.register('minBidIncrementPercent')}
          />

          <Input
            label="Minimum valuation (ETH)"
            placeholder="0.5"
            labelPlacement="outside"
            isDisabled={!isFactoryOwner}
            {...createForm.register('minValuationEth')}
          />

          <Input
            label="Content update limit"
            placeholder="5"
            type="number"
            labelPlacement="outside"
            isDisabled={!isFactoryOwner}
            {...createForm.register('contentUpdateLimit')}
          />

          {createForm.watch('slotType') === 'enabled' ? (
            <Input
              label="Dust rate (%)"
              placeholder="1"
              type="number"
              labelPlacement="outside"
              isDisabled={!isFactoryOwner}
              {...createForm.register('dustRatePercent')}
            />
          ) : null}

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              color="primary"
              type="submit"
              isDisabled={isCreatingSlot || !isFactoryOwner}
              isLoading={isCreatingSlot}
            >
              Create slot
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-black">
            Configure global addresses
          </h2>
          <p className="text-sm text-black/60">
            setGlobalAddresses is restricted to the factory owner. Ensure the
            connected wallet has the required permissions before proceeding.
          </p>
          {!isFactoryOwner ? (
            <p className="text-xs text-amber-700">
              Only the factory owner {effectiveOwner ?? 'N/A'} can update global
              addresses.
            </p>
          ) : null}
        </div>

        <form
          className="mt-3 grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSetGlobalAddresses();
          }}
        >
          <div className="flex gap-[10px]">
            <Input
              label="Treasury address"
              placeholder="0x..."
              labelPlacement="outside"
              isDisabled={!isFactoryOwner}
              {...globalForm.register('treasury')}
            />

            <Input
              label="Governance address"
              placeholder="0x..."
              labelPlacement="outside"
              isDisabled={!isFactoryOwner}
              {...globalForm.register('governance')}
            />
          </div>

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              color="primary"
              type="submit"
              isDisabled={isSettingGlobals || !isFactoryOwner}
              isLoading={isSettingGlobals}
            >
              Update addresses
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
