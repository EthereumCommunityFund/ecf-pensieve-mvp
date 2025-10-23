'use client';

import { Tab, Tabs } from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import {
  ActiveSlotCard,
  ActiveSlotCardSkeleton,
  VacantSlotCard,
  VacantSlotCardSkeleton,
  buildActiveStats,
} from '@/components/pages/ad-management/AvailableSlotCard';
import ClaimSlotModal from '@/components/pages/ad-management/ClaimSlotModal';
import StatsSummary, {
  type StatsSummaryItem,
} from '@/components/pages/ad-management/StatsSummary';
import TakeoverSlotModal, {
  type TakeoverSlotModalProps,
} from '@/components/pages/ad-management/TakeoverSlotModal';
import YourSlotsCard, {
  type SlotAction,
  type SlotStatus,
  type YourSlotCardProps,
} from '@/components/pages/ad-management/YourSlotsCard';
import {
  useHarbergerSlots,
  type ActiveSlotData,
  type VacantSlotData,
} from '@/hooks/useHarbergerSlots';
import { AddressValidator } from '@/lib/utils/addressValidation';
import {
  ONE_BIGINT,
  ZERO_BIGINT,
  calculateBond,
  calculateTaxForPeriods,
  formatDuration,
  formatEth,
  formatNumberInputFromWei,
  sumBigints,
} from '@/utils/harberger';

type TabKey = 'yourSlots' | 'templateProposals' | 'availableSlots';

type TakeoverModalConfig = Pick<
  TakeoverSlotModalProps,
  | 'contextLabel'
  | 'contextTone'
  | 'minBidValue'
  | 'minBidHelper'
  | 'valuation'
  | 'coverage'
  | 'breakdown'
  | 'harbergerInfo'
  | 'ctaLabel'
  | 'isCtaDisabled'
>;

const DEFAULT_TAKEOVER_DATA: TakeoverModalConfig = {
  contextLabel: '',
  contextTone: 'default',
  minBidValue: '0 ETH',
  valuation: {
    helper: '',
  },
  coverage: {
    label: '',
    description: '',
    sliderPosition: 0,
    rangeStart: '',
    rangeEnd: '',
    minDays: 1,
    maxDays: 12,
    stepDays: 1,
    defaultDays: 1,
  },
  breakdown: {
    bondRateLabel: '',
    bondRateValue: '',
    taxLabel: '',
    taxValue: '',
    coverageLabel: '',
    coverageValue: '',
    totalLabel: '',
    totalValue: '',
  },
  harbergerInfo: '',
  ctaLabel: '',
};

export default function AdManagementPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('availableSlots');
  const [selectedVacantSlot, setSelectedVacantSlot] =
    useState<VacantSlotData | null>(null);
  const [selectedTakeoverSlot, setSelectedTakeoverSlot] =
    useState<ActiveSlotData | null>(null);
  const [takeoverCoverageDays, setTakeoverCoverageDays] = useState<number>(0);
  const [takeoverValuationWei, setTakeoverValuationWei] = useState<
    bigint | null
  >(null);
  const [takeoverValuationInput, setTakeoverValuationInput] =
    useState<string>('');
  const { address: connectedAddress } = useAccount();

  const {
    metrics,
    vacantSlots,
    activeSlots,
    slotIdCounter,
    treasuryAddress,
    governanceAddress,
    isLoading,
    error,
  } = useHarbergerSlots();

  useEffect(() => {
    if (!selectedTakeoverSlot) {
      setTakeoverCoverageDays(0);
      setTakeoverValuationWei(null);
      setTakeoverValuationInput('');
      return;
    }

    const periodSeconds = Number(selectedTakeoverSlot.taxPeriodInSeconds);
    const periodDays = periodSeconds > 0 ? periodSeconds / 86_400 : 1;
    const fallbackValuation =
      selectedTakeoverSlot.minTakeoverBidWei > ZERO_BIGINT
        ? selectedTakeoverSlot.minTakeoverBidWei
        : selectedTakeoverSlot.minValuationWei;
    const fallbackInput = formatNumberInputFromWei(fallbackValuation, 4);

    setTakeoverCoverageDays(periodDays);
    setTakeoverValuationWei(fallbackValuation);
    setTakeoverValuationInput(fallbackInput);
  }, [selectedTakeoverSlot]);

  const normalizedAccount = useMemo(
    () => connectedAddress?.toLowerCase() ?? null,
    [connectedAddress],
  );

  const ownedSlots = useMemo<ActiveSlotData[]>(() => {
    if (!normalizedAccount) {
      return [];
    }

    return activeSlots.filter((slot) => {
      if (!slot.ownerAddress) {
        return false;
      }
      return slot.ownerAddress.toLowerCase() === normalizedAccount;
    });
  }, [activeSlots, normalizedAccount]);

  const computeTaxPerPeriodWei = useCallback((slot: ActiveSlotData) => {
    const valuationBasis =
      slot.valuationWei > ZERO_BIGINT
        ? slot.valuationWei
        : slot.minValuationWei;

    return calculateTaxForPeriods(
      valuationBasis,
      slot.taxRateBps,
      slot.taxPeriodInSeconds,
      ONE_BIGINT,
    );
  }, []);

  const handleTakeoverValuationChange = useCallback(
    (input: string) => {
      setTakeoverValuationInput(input);

      if (!selectedTakeoverSlot) {
        return;
      }

      const normalizedInput = input.trim();
      if (normalizedInput.length === 0) {
        setTakeoverValuationWei(null);
        return;
      }

      try {
        const parsed = parseEther(normalizedInput);
        setTakeoverValuationWei(parsed);
      } catch (error) {
        setTakeoverValuationWei(null);
      }
    },
    [selectedTakeoverSlot],
  );

  const handleTakeoverCoverageChange = useCallback((value: number) => {
    if (Number.isNaN(value)) {
      return;
    }
    setTakeoverCoverageDays(value);
  }, []);

  const formatUtcTimestamp = useCallback((timestamp: bigint) => {
    if (timestamp <= ZERO_BIGINT) {
      return '—';
    }

    const numeric = Number(timestamp);
    if (!Number.isFinite(numeric)) {
      return '—';
    }

    const date = new Date(numeric * 1000);
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });

    const parts = formatter.formatToParts(date);
    const lookup = (type: string) =>
      parts.find((part) => part.type === type)?.value ?? '';

    const month = lookup('month');
    const day = lookup('day');
    const year = lookup('year');
    const hour = lookup('hour');
    const minute = lookup('minute');

    if (!month || !day || !year || !hour || !minute) {
      return formatter.format(date);
    }

    return `${month} ${day}, ${year} · ${hour}:${minute} UTC`;
  }, []);

  const ownedSlotCards = useMemo(() => {
    return ownedSlots.map((slot) => {
      const status: SlotStatus = slot.isExpired
        ? 'closed'
        : slot.isOverdue
          ? 'overdue'
          : 'owned';

      const taxPerPeriodWei = computeTaxPerPeriodWei(slot);
      const taxOwedWei = slot.isOverdue ? taxPerPeriodWei : ZERO_BIGINT;

      const periodEnding = formatUtcTimestamp(slot.taxPaidUntilTimestamp);
      const countdownLabel =
        status === 'closed'
          ? 'Expired'
          : slot.isOverdue
            ? 'Due now'
            : `Due in ${formatDuration(slot.timeRemainingInSeconds, { fallback: '0s' })}`;

      const activityBadge =
        status === 'closed'
          ? 'Expired slot'
          : slot.isOverdue
            ? 'Tax overdue'
            : `Period Ending (${formatDuration(slot.timeRemainingInSeconds, { fallback: '0s' })})`;

      const currentAdBadgeTone: 'default' | 'danger' =
        status === 'closed' || status === 'overdue' ? 'danger' : 'default';

      const primaryAction: SlotAction | undefined =
        status === 'closed'
          ? undefined
          : slot.isOverdue
            ? {
                id: `pay-tax-${slot.id}`,
                label: 'Pay Due Tax',
                variant: 'primary',
              }
            : {
                id: `renew-${slot.id}`,
                label: 'Renew Coverage',
                variant: 'primary',
              };

      const secondaryAction: SlotAction | undefined =
        status === 'closed'
          ? {
              id: `view-audit-${slot.id}`,
              label: 'View Audit Trail',
              variant: 'secondary',
            }
          : {
              id: `edit-${slot.id}`,
              label: 'Edit Creative',
              variant: 'secondary',
            };

      const tertiaryAction: SlotAction | undefined = {
        id: `slot-details-${slot.id}`,
        label: 'Slot Details',
        variant: status === 'closed' ? 'secondary' : undefined,
      };

      const valuationDisplay =
        slot.valuationWei > ZERO_BIGINT
          ? slot.valuation
          : formatEth(slot.minValuationWei);

      const contentUpdatesTotal = Number(
        slot.contentUpdateLimit ?? ZERO_BIGINT,
      );
      const contentUpdatesUsed = Number(slot.contentUpdateCount ?? ZERO_BIGINT);

      const hasCreativeUrl =
        slot.currentAdURI && slot.currentAdURI.startsWith('http');

      return {
        id: slot.id,
        title: slot.slotName,
        valuation: valuationDisplay,
        taxDue: formatEth(taxPerPeriodWei),
        periodEnding,
        minTakeoverBid: slot.minTakeoverBid,
        status,
        location: slot.slotTypeLabel,
        slotLabel: slot.slotName,
        slotValueLabel: slot.slotTypeLabel,
        currentAdBadge: activityBadge,
        currentAdBadgeTone,
        taxOwed: formatEth(taxOwedWei),
        taxDueCountdown: countdownLabel,
        takeoverBid: slot.minTakeoverBid,
        contentUpdates:
          contentUpdatesTotal > 0
            ? {
                used: contentUpdatesUsed,
                total: contentUpdatesTotal,
              }
            : undefined,
        adImageUrl: hasCreativeUrl ? slot.currentAdURI : undefined,
        primaryAction,
        secondaryAction,
        tertiaryAction,
      } satisfies YourSlotCardProps;
    });
  }, [computeTaxPerPeriodWei, formatUtcTimestamp, ownedSlots]);

  const ownedSlotsTotalTaxDueWei = useMemo(() => {
    if (ownedSlots.length === 0) {
      return ZERO_BIGINT;
    }

    const taxes = ownedSlots.map((slot) => computeTaxPerPeriodWei(slot));
    return sumBigints(taxes);
  }, [computeTaxPerPeriodWei, ownedSlots]);

  const statsItems = useMemo<StatsSummaryItem[]>(() => {
    const ownedCount = ownedSlots.length;
    const taxOwedDisplay = formatEth(ownedSlotsTotalTaxDueWei);

    return [
      {
        id: 'owned',
        label: 'Owned Slots',
        value: ownedCount.toString(),
      },
      {
        id: 'taxOwed',
        label: 'Total Tax Owed',
        value: taxOwedDisplay,
      },
      {
        id: 'vacant',
        label: 'Vacant Slots',
        value: metrics.vacantCount.toString(),
      },
      {
        id: 'overdue',
        label: 'Overdue / Expired',
        value: metrics.overdueCount.toString(),
      },
    ];
  }, [
    metrics.overdueCount,
    metrics.vacantCount,
    ownedSlots.length,
    ownedSlotsTotalTaxDueWei,
  ]);

  const takeoverData = useMemo<TakeoverModalConfig>(() => {
    if (!selectedTakeoverSlot) {
      return DEFAULT_TAKEOVER_DATA;
    }

    const periodSeconds = Number(selectedTakeoverSlot.taxPeriodInSeconds);
    const basePeriodDays = periodSeconds > 0 ? periodSeconds / 86_400 : 1;
    const effectiveCoverageDays =
      takeoverCoverageDays > 0 ? takeoverCoverageDays : basePeriodDays;
    const coveragePeriods = Math.max(
      Math.round(effectiveCoverageDays / basePeriodDays),
      1,
    );
    const coveragePeriodsBigInt = BigInt(coveragePeriods);

    const fallbackValuationWei =
      selectedTakeoverSlot.minTakeoverBidWei > ZERO_BIGINT
        ? selectedTakeoverSlot.minTakeoverBidWei
        : selectedTakeoverSlot.minValuationWei;

    const isValuationValid = Boolean(
      takeoverValuationWei &&
        takeoverValuationWei >= selectedTakeoverSlot.minTakeoverBidWei,
    );

    const valuationWeiForPricing =
      isValuationValid && takeoverValuationWei
        ? takeoverValuationWei
        : fallbackValuationWei;

    const bondRequired = calculateBond(
      valuationWeiForPricing,
      selectedTakeoverSlot.bondRateBps,
    );
    const taxRequired = calculateTaxForPeriods(
      valuationWeiForPricing,
      selectedTakeoverSlot.taxRateBps,
      selectedTakeoverSlot.taxPeriodInSeconds,
      coveragePeriodsBigInt,
    );
    const totalValue = bondRequired + taxRequired;

    const coverageDuration = formatDuration(
      selectedTakeoverSlot.taxPeriodInSeconds * coveragePeriodsBigInt,
      { fallback: '0s' },
    );
    const minBidPlaceholder = formatEth(
      selectedTakeoverSlot.minTakeoverBidWei,
      { withUnit: false, maximumFractionDigits: 4 },
    );

    return {
      contextLabel: `${selectedTakeoverSlot.slotTypeLabel} · Takeover`,
      contextTone:
        selectedTakeoverSlot.isOverdue || selectedTakeoverSlot.isExpired
          ? 'danger'
          : 'default',
      minBidValue: selectedTakeoverSlot.minTakeoverBid,
      minBidHelper: selectedTakeoverSlot.takeoverHelper,
      valuation: {
        placeholder: `≥ ${minBidPlaceholder}`,
        helper: selectedTakeoverSlot.takeoverHelper,
        value: takeoverValuationInput,
        errorMessage: isValuationValid
          ? undefined
          : 'Bid must meet the minimum increment.',
        onChange: handleTakeoverValuationChange,
      },
      coverage: {
        label: `(${coverageDuration})`,
        description: selectedTakeoverSlot.coverageDescription,
        sliderPosition: 0,
        rangeStart: formatDuration(selectedTakeoverSlot.taxPeriodInSeconds, {
          fallback: 'One period',
        }),
        rangeEnd: formatDuration(
          selectedTakeoverSlot.taxPeriodInSeconds * BigInt(12),
          { fallback: 'Twelve periods' },
        ),
        minDays: basePeriodDays,
        maxDays: basePeriodDays * 12,
        stepDays: basePeriodDays,
        defaultDays: effectiveCoverageDays,
        onChange: handleTakeoverCoverageChange,
        onChangeEnd: handleTakeoverCoverageChange,
      },
      breakdown: {
        bondRateLabel: `Bond Rate (${selectedTakeoverSlot.bondRate})`,
        bondRateValue: formatEth(bondRequired),
        taxLabel: `Tax (${coveragePeriods} period${
          coveragePeriods > 1 ? 's' : ''
        })`,
        taxValue: formatEth(taxRequired),
        coverageLabel: 'Coverage',
        coverageValue: coverageDuration,
        totalLabel: 'Total',
        totalValue: formatEth(totalValue),
      },
      harbergerInfo:
        'Takeover pays the declared valuation to the treasury and restarts the tax period at your price.',
      ctaLabel: selectedTakeoverSlot.takeoverCta,
      isCtaDisabled: !isValuationValid || coveragePeriods <= 0,
    };
  }, [
    handleTakeoverCoverageChange,
    handleTakeoverValuationChange,
    selectedTakeoverSlot,
    takeoverCoverageDays,
    takeoverValuationInput,
    takeoverValuationWei,
  ]);

  const handleCloseClaimModal = useCallback(() => {
    setSelectedVacantSlot(null);
  }, []);

  const handleCloseTakeoverModal = useCallback(() => {
    setSelectedTakeoverSlot(null);
  }, []);

  return (
    <div className="mobile:px-[12px] px-[32px] pb-[72px] pt-[32px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[20px]">
        <StatsSummary items={statsItems} />
        <FactoryOverview
          slotIdCounter={slotIdCounter}
          treasury={treasuryAddress}
          governance={governanceAddress}
        />

        <section className="flex flex-col">
          <Tabs
            aria-label="Ad management tabs"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as TabKey)}
            variant="underlined"
            classNames={{
              tabList: 'bg-white border-b border-black/10 p-0 gap-0',
              tab: 'text-[14px] font-semibold px-[10px] py-[6px]',
              tabContent:
                'group-data-[selected=true]:text-black/100 text-black/50',
              cursor: 'rounded-[10px]',
              panel: 'pt-[20px]',
            }}
          >
            <Tab key="availableSlots" title="Available Ad Slots">
              <div className="flex flex-col gap-[32px]">
                <section className="flex flex-col gap-[16px]">
                  <ECFTypography
                    type="subtitle2"
                    className="text-[16px] font-semibold text-black"
                  >
                    Vacant Slots
                  </ECFTypography>

                  {error ? (
                    <DataFallback
                      tone="danger"
                      message={`Unable to load slot inventory: ${error.message}`}
                    />
                  ) : isLoading && vacantSlots.length === 0 ? (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <VacantSlotCardSkeleton
                          key={`vacant-skeleton-${index}`}
                        />
                      ))}
                    </div>
                  ) : vacantSlots.length === 0 ? (
                    <DataFallback message="No vacant slots published by the factory yet." />
                  ) : (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {vacantSlots.map((slot) => (
                        <VacantSlotCard
                          key={slot.id}
                          {...slot}
                          onClaim={() => setSelectedVacantSlot(slot)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-[16px]">
                  <ECFTypography
                    type="subtitle2"
                    className="text-[16px] font-semibold text-black"
                  >
                    Active Slots
                  </ECFTypography>

                  {error ? (
                    <DataFallback
                      tone="danger"
                      message={`Unable to load active slots: ${error.message}`}
                    />
                  ) : isLoading && activeSlots.length === 0 ? (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <ActiveSlotCardSkeleton
                          key={`active-skeleton-${index}`}
                        />
                      ))}
                    </div>
                  ) : activeSlots.length === 0 ? (
                    <DataFallback message="No active slots claimed yet." />
                  ) : (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {activeSlots.map((slot) => (
                        <ActiveSlotCard
                          key={slot.id}
                          slotName={slot.slotName}
                          statusLabel={slot.statusLabel}
                          owner={slot.owner}
                          mediaUrl={slot.currentAdURI || undefined}
                          mediaAlt={slot.slotName}
                          stats={buildActiveStats(
                            slot.valuation,
                            slot.lockedBond,
                            slot.remainingUnits,
                            slot.minTakeoverBid,
                          )}
                          takeoverCta={slot.takeoverCta}
                          onTakeover={() => setSelectedTakeoverSlot(slot)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </Tab>
            <Tab key="yourSlots" title="Your Slots">
              {!connectedAddress ? (
                <DataFallback message="Connect your wallet to manage your slots." />
              ) : ownedSlotCards.length === 0 ? (
                <DataFallback message="You do not own any slots yet." />
              ) : (
                <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                  {ownedSlotCards.map((slot) => (
                    <YourSlotsCard key={slot.id} {...slot} />
                  ))}
                </div>
              )}
            </Tab>

            <Tab key="templateProposals" title="Template Proposals">
              <TabPlaceholder
                title="Template library coming soon"
                description="Save and reuse campaigns for recurring Harberger slots. Upload templates and share with collaborators."
                actionLabel="Explore Beta Program"
              />
            </Tab>
          </Tabs>
        </section>
      </div>

      <ClaimSlotModal
        isOpen={!!selectedVacantSlot}
        onClose={handleCloseClaimModal}
        slotName={selectedVacantSlot?.slotName ?? ''}
        statusLabel={selectedVacantSlot?.statusLabel}
        breakdown={{
          bondRateLabel: `Bond Rate (${selectedVacantSlot?.bondRate ?? '—'})`,
          bondRateValue: selectedVacantSlot?.bondRateValue ?? '—',
          taxLabel: 'Tax',
          taxValue: selectedVacantSlot?.taxCostValue ?? '—',
          coverageLabel: 'Coverage',
          coverageValue: selectedVacantSlot?.coverageDuration ?? '—',
          totalLabel: 'Total Cost',
          totalValue: selectedVacantSlot?.totalCostValue ?? '—',
        }}
        valuationDefault={selectedVacantSlot?.valuationDefault ?? '0.00'}
        valuationMinimum={selectedVacantSlot?.valuationMinimum ?? '0 ETH'}
        coverageDescription={
          selectedVacantSlot?.coverageDescription ??
          'Select how many tax periods to prepay.'
        }
      />

      <TakeoverSlotModal
        isOpen={!!selectedTakeoverSlot}
        onClose={handleCloseTakeoverModal}
        contextLabel={takeoverData.contextLabel}
        contextTone={takeoverData.contextTone}
        slotName={selectedTakeoverSlot?.slotName ?? ''}
        statusLabel={selectedTakeoverSlot?.statusLabel ?? 'Owned'}
        owner={selectedTakeoverSlot?.owner ?? ''}
        taxRate={selectedTakeoverSlot?.taxRate ?? ''}
        minBidLabel="Minimum Bid Required"
        minBidValue={takeoverData.minBidValue}
        minBidHelper={takeoverData.minBidHelper}
        valuation={takeoverData.valuation}
        coverage={takeoverData.coverage}
        breakdown={takeoverData.breakdown}
        harbergerInfo={takeoverData.harbergerInfo}
        ctaLabel={takeoverData.ctaLabel}
        isCtaDisabled={takeoverData.isCtaDisabled}
      />
    </div>
  );
}

interface TabPlaceholderProps {
  title: string;
  description: string;
  actionLabel?: string;
}

function TabPlaceholder({
  title,
  description,
  actionLabel,
}: TabPlaceholderProps) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-[16px] border border-dashed border-black/20 bg-white/70 px-6 py-14 text-center">
      <ECFTypography type="subtitle2" className="font-semibold">
        {title}
      </ECFTypography>
      <span className="max-w-[480px] text-[14px] leading-[20px] text-black/60">
        {description}
      </span>
      {actionLabel ? (
        <ECFButton className="border border-black/15 bg-transparent text-black hover:bg-black/10">
          {actionLabel}
        </ECFButton>
      ) : null}
    </div>
  );
}

function DataFallback({
  message,
  tone = 'default',
}: {
  message: string;
  tone?: 'default' | 'danger';
}) {
  const borderClasses =
    tone === 'danger'
      ? 'border-[#F87171] text-[#B91C1C]'
      : 'border-black/15 text-black/60';
  const backgroundClasses = tone === 'danger' ? 'bg-[#FEF2F2]' : 'bg-white';

  return (
    <div
      className={`flex min-h-[120px] items-center justify-center rounded-[12px] border px-6 py-8 text-center text-[14px] font-medium ${borderClasses} ${backgroundClasses}`}
    >
      {message}
    </div>
  );
}

function FactoryOverview({
  slotIdCounter,
  treasury,
  governance,
}: {
  slotIdCounter: bigint;
  treasury: `0x${string}`;
  governance: `0x${string}`;
}) {
  const formattedSlotCounter = slotIdCounter.toString();
  const displayTreasury = AddressValidator.shortenAddress(treasury);
  const displayGovernance = AddressValidator.shortenAddress(governance);

  return (
    <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-black/10 bg-white px-5 py-4 text-[13px] text-black/70 md:grid-cols-3">
      <div className="flex flex-col gap-[4px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/50">
          Slot Counter
        </span>
        <span className="font-semibold text-black/80">
          {formattedSlotCounter}
        </span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/50">
          Treasury
        </span>
        <span className="font-mono text-[13px] text-black/80">
          {displayTreasury}
        </span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/50">
          Governance
        </span>
        <span className="font-mono text-[13px] text-black/80">
          {displayGovernance}
        </span>
      </div>
    </div>
  );
}
