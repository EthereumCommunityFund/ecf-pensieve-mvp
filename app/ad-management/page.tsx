'use client';

import { Tab, Tabs } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';

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
} from '@/components/pages/ad-management/YourSlotsCard';
import {
  aggregatePrepaidTax,
  useHarbergerSlots,
  type ActiveSlotData,
  type VacantSlotData,
} from '@/hooks/useHarbergerSlots';
import { AddressValidator } from '@/lib/utils/addressValidation';
import {
  ONE_BIGINT,
  calculateBond,
  calculateTaxForPeriods,
  formatDuration,
  formatEth,
} from '@/utils/harberger';

type TabKey = 'yourSlots' | 'templateProposals' | 'availableSlots';

interface YourSlotMock {
  id: string;
  title: string;
  location?: string;
  status: SlotStatus;
  valuation: string;
  taxDue: string;
  periodEnding: string;
  minTakeoverBid: string;
  contentSummary?: string;
  primaryAction?: {
    id: string;
    label: string;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    id: string;
    label: string;
    variant?: 'primary' | 'secondary';
  };
  avatarUrl?: string;
  slotLabel?: string;
  slotValueLabel?: string;
  currentAdBadge?: string;
  currentAdBadgeTone?: 'default' | 'danger';
  taxOwed?: string;
  taxDueCountdown?: string;
  takeoverBid?: string;
  contentUpdates?: { used: number; total: number };
  adImageUrl?: string;
  tertiaryAction?: SlotAction;
}

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

const YOUR_SLOTS_DATA: YourSlotMock[] = [
  {
    id: 'slot-1',
    title: 'Times Square · North Facade',
    location: 'Digital Billboard · NYC',
    status: 'owned',
    valuation: '12.00 ETH',
    taxDue: '0.64 ETH',
    periodEnding: 'Apr 18, 2025 · 03:00 UTC',
    minTakeoverBid: '≥ 12.80 ETH',
    contentSummary:
      'Launching the Q2 product reveal. Runtime creative with dynamic pricing banner.',
    primaryAction: {
      id: 'manage-slot-1',
      label: 'Manage Slot',
      variant: 'primary',
    },
    secondaryAction: { id: 'edit-creative-slot-1', label: 'Edit Creative' },
    tertiaryAction: { id: 'slot-details-1', label: 'Slot Details' },
    currentAdBadge: 'Period Ending (4d 6h left)',
    taxOwed: '0.64 ETH',
    taxDueCountdown: 'Due in 4d 6h',
    takeoverBid: '≥ 12.80 ETH',
    contentUpdates: { used: 2, total: 5 },
    adImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'slot-2',
    title: 'Crypto Weekly · Homepage Masthead',
    location: 'Web · Global',
    status: 'overdue',
    valuation: '5.20 ETH',
    taxDue: '0.42 ETH',
    periodEnding: 'Apr 03, 2025 · 11:30 UTC',
    minTakeoverBid: '≥ 5.72 ETH',
    contentSummary:
      'Weekly awareness push for Harberger Starter Kit. Refresh creative after payment.',
    primaryAction: {
      id: 'pay-tax-slot-2',
      label: 'Pay Due Tax',
      variant: 'primary',
    },
    secondaryAction: { id: 'forfeit-slot-2', label: 'Forfeit Slot' },
    tertiaryAction: { id: 'slot-details-2', label: 'Slot Details' },
    currentAdBadge: 'Tax overdue · Settled in under 6h',
    currentAdBadgeTone: 'danger',
    taxOwed: '0.42 ETH',
    taxDueCountdown: 'Due in 6h 20m',
    takeoverBid: '≥ 5.72 ETH',
    contentUpdates: { used: 1, total: 5 },
    adImageUrl:
      'https://images.unsplash.com/photo-1468971050039-be99497410af?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'slot-3',
    title: 'Protocol Podcast · Mid-roll',
    location: 'Audio · Season 6',
    status: 'vacant',
    valuation: '1.10 ETH',
    taxDue: '0.08 ETH',
    periodEnding: 'Apr 27, 2025 · 18:00 UTC',
    minTakeoverBid: '≥ 1.21 ETH',
    contentSummary:
      'Audience overlap with DeFi builders. Prepare refreshed script with CTA link tracking.',
    primaryAction: {
      id: 'renew-slot-3',
      label: 'Renew Coverage',
      variant: 'primary',
    },
    secondaryAction: { id: 'view-bid-slot-3', label: 'View Market Bid' },
    tertiaryAction: { id: 'slot-details-3', label: 'Slot Details' },
    currentAdBadge: 'Period Ending (9d left)',
    taxOwed: '0.08 ETH',
    taxDueCountdown: 'Due in 9d 4h',
    takeoverBid: '≥ 1.21 ETH',
    contentUpdates: { used: 0, total: 3 },
    adImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'slot-4',
    title: 'Harberger Expo · LED Column',
    location: 'On-site · Singapore',
    status: 'closed',
    valuation: '—',
    taxDue: '—',
    periodEnding: 'Closed on Feb 20, 2025',
    minTakeoverBid: 'N/A',
    contentSummary:
      'This slot is shielded by governance. Re-open will be announced.',
    secondaryAction: { id: 'view-audit-slot-4', label: 'View Audit Trail' },
    tertiaryAction: { id: 'slot-details-4', label: 'Slot Details' },
    currentAdBadge: 'Closed · Governance hold',
    taxOwed: '—',
    taxDueCountdown: 'Unavailable',
    takeoverBid: 'N/A',
    contentUpdates: { used: 0, total: 0 },
    adImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function AdManagementPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('availableSlots');
  const [selectedVacantSlot, setSelectedVacantSlot] =
    useState<VacantSlotData | null>(null);
  const [selectedTakeoverSlot, setSelectedTakeoverSlot] =
    useState<ActiveSlotData | null>(null);

  const yourSlots = useMemo(() => YOUR_SLOTS_DATA, []);
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

  const statsItems = useMemo<StatsSummaryItem[]>(() => {
    const items: StatsSummaryItem[] = [
      {
        id: 'owned',
        label: 'Owned Slots',
        value: metrics.activeCount.toString(),
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

    if (activeSlots.length > 0) {
      items.splice(1, 0, {
        id: 'prepaidTax',
        label: 'Total Prepaid Tax',
        value: aggregatePrepaidTax(activeSlots),
      });
    }

    return items;
  }, [metrics, activeSlots]);

  const takeoverData = useMemo<TakeoverModalConfig>(() => {
    if (!selectedTakeoverSlot) {
      return DEFAULT_TAKEOVER_DATA;
    }

    const bondRequired = calculateBond(
      selectedTakeoverSlot.minTakeoverBidWei,
      selectedTakeoverSlot.bondRateBps,
    );
    const taxRequired = calculateTaxForPeriods(
      selectedTakeoverSlot.minTakeoverBidWei,
      selectedTakeoverSlot.taxRateBps,
      selectedTakeoverSlot.taxPeriodInSeconds,
      ONE_BIGINT,
    );
    const coverageLabel = formatDuration(
      selectedTakeoverSlot.taxPeriodInSeconds,
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
      },
      coverage: {
        label: `(${coverageLabel})`,
        description: selectedTakeoverSlot.coverageDescription,
        sliderPosition: 0,
        rangeStart: '1 period',
        rangeEnd: '12 periods',
        minDays: 1,
        maxDays: 12,
        stepDays: 1,
        defaultDays: 1,
      },
      breakdown: {
        bondRateLabel: `Bond Rate (${selectedTakeoverSlot.bondRate})`,
        bondRateValue: formatEth(bondRequired),
        taxLabel: 'Tax (1 period)',
        taxValue: formatEth(taxRequired),
        coverageLabel: 'Coverage',
        coverageValue: coverageLabel,
        totalLabel: 'Total',
        totalValue: formatEth(bondRequired + taxRequired),
      },
      harbergerInfo:
        'Takeover pays the declared valuation to the treasury and restarts the tax period at your price.',
      ctaLabel: selectedTakeoverSlot.takeoverCta,
      isCtaDisabled: false,
    };
  }, [selectedTakeoverSlot]);

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
        {/* <FactoryOverview
          slotIdCounter={slotIdCounter}
          treasury={treasuryAddress}
          governance={governanceAddress}
        /> */}

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
              {/* TODO  */}
              <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                {yourSlots.map((slot) => (
                  <YourSlotsCard key={slot.id} {...slot} />
                ))}
              </div>
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
