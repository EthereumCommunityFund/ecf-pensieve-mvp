'use client';

import { Tab, Tabs } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import {
  ActiveSlotCard,
  VacantSlotCard,
  buildActiveStats,
} from '@/components/pages/ad-management/AvailableSlotCard';
import ClaimSlotModal from '@/components/pages/ad-management/ClaimSlotModal';
import StatsSummary, {
  type StatsSummaryItem,
} from '@/components/pages/ad-management/StatsSummary';
import YourSlotsCard, {
  type SlotAction,
  type SlotStatus,
} from '@/components/pages/ad-management/YourSlotsCard';

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

interface VacantSlotMock {
  id: string;
  slotName: string;
  statusLabel?: string;
  valuation: string;
  valuationHelper: string;
  bondRate: string;
  bondRateHelper: string;
  taxRate: string;
  taxRateHelper: string;
  actionLabel: string;
  bondRateValue: string;
  taxCostValue: string;
  coverageDuration: string;
  totalCostValue: string;
  valuationDefault: string;
  valuationMinimum: string;
  coverageDescription: string;
}

interface ActiveSlotMock {
  id: string;
  slotName: string;
  statusLabel?: string;
  owner: string;
  mediaUrl?: string;
  mediaAlt?: string;
  valuation: string;
  lockedBond: string;
  remainingUnits: string;
  minTakeoverBid: string;
  takeoverCta: string;
}

const STATS_SUMMARY: StatsSummaryItem[] = [
  {
    id: 'owned',
    label: 'Owned Slots',
    value: '4',
  },
  {
    id: 'tax',
    label: 'Total Tax Owed',
    value: '2.48 ETH',
  },
  {
    id: 'overdue',
    label: 'Overdue',
    value: '1',
  },
];

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

const AVAILABLE_VACANT_SLOTS: VacantSlotMock[] = [
  {
    id: 'vacant-1',
    slotName: 'Homescreen / Top Banner',
    statusLabel: 'Open',
    valuation: '0.05 ETH',
    valuationHelper: 'The minimum default valuation for this slot.',
    bondRate: '20%',
    bondRateHelper: 'Percentage of valuation locked as collateral.',
    taxRate: '5%',
    taxRateHelper: 'Annual tax rate applied to slot valuations.',
    actionLabel: 'Make Claim',
    bondRateValue: '0.400 ETH',
    taxCostValue: '0.002 ETH',
    coverageDuration: '7 days',
    totalCostValue: '0.402 ETH',
    valuationDefault: '2.00',
    valuationMinimum: '0.05 ETH',
    coverageDescription:
      'Choose how many tax periods to prepay. Longer coverage means higher upfront cost but no need to pay taxes frequently. (1 tax period = 24 hours / 620000 seconds)',
  },
  {
    id: 'vacant-2',
    slotName: 'Homescreen / Sidebar',
    statusLabel: 'Open',
    valuation: '0.05 ETH',
    valuationHelper: 'The minimum default valuation for this slot.',
    bondRate: '20%',
    bondRateHelper: 'Percentage of valuation locked as collateral.',
    taxRate: '5%',
    taxRateHelper: 'Annual tax rate applied to slot valuations.',
    actionLabel: 'Make Claim',
    bondRateValue: '0.400 ETH',
    taxCostValue: '0.002 ETH',
    coverageDuration: '7 days',
    totalCostValue: '0.402 ETH',
    valuationDefault: '2.00',
    valuationMinimum: '0.05 ETH',
    coverageDescription:
      'Choose how many tax periods to prepay. Longer coverage means higher upfront cost but no need to pay taxes frequently. (1 tax period = 24 hours / 620000 seconds)',
  },
  {
    id: 'vacant-3',
    slotName: 'Times Square / Skyline Board',
    statusLabel: 'Open',
    valuation: '1.50 ETH',
    valuationHelper: 'High-visibility placement updated nightly.',
    bondRate: '25%',
    bondRateHelper: 'Collateral requirement based on appraisal risk band.',
    taxRate: '8%',
    taxRateHelper: 'Applies to premium city inventory annually.',
    actionLabel: 'Make Claim',
    bondRateValue: '0.375 ETH',
    taxCostValue: '0.012 ETH',
    coverageDuration: '14 days',
    totalCostValue: '0.387 ETH',
    valuationDefault: '2.50',
    valuationMinimum: '1.50 ETH',
    coverageDescription:
      'Premium slots support extended prepayment windows for global campaigns. (1 tax period = 24 hours / 620000 seconds)',
  },
];

const AVAILABLE_ACTIVE_SLOTS: ActiveSlotMock[] = [
  {
    id: 'active-1',
    slotName: 'Homescreen / Footer Banner',
    statusLabel: 'Owned',
    owner: '0x000',
    mediaUrl:
      'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Burger campaign creative',
    valuation: '0.05 ETH',
    lockedBond: '0.00 ETH',
    remainingUnits: '7 days',
    minTakeoverBid: '0.000 ETH',
    takeoverCta: 'Takeover for 0.00 ETH',
  },
  {
    id: 'active-2',
    slotName: 'Homescreen / List Inline',
    statusLabel: 'Owned',
    owner: '0x000',
    mediaUrl:
      'https://images.unsplash.com/photo-1559058737-7b8da6e5abf4?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Burger combo promotion',
    valuation: '0.05 ETH',
    lockedBond: '0.00 ETH',
    remainingUnits: '7 days',
    minTakeoverBid: '0.000 ETH',
    takeoverCta: 'Takeover for 0.00 ETH',
  },
  {
    id: 'active-3',
    slotName: 'Marketplace / Featured Banner',
    statusLabel: 'Owned',
    owner: '0xC0FFEE',
    mediaUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Dynamic pricing teaser',
    valuation: '0.80 ETH',
    lockedBond: '0.10 ETH',
    remainingUnits: '3 days',
    minTakeoverBid: '0.880 ETH',
    takeoverCta: 'Takeover for 0.88 ETH',
  },
];

export default function AdManagementPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('yourSlots');
  const [selectedVacantSlot, setSelectedVacantSlot] =
    useState<VacantSlotMock | null>(null);

  const yourSlots = useMemo(() => YOUR_SLOTS_DATA, []);
  const vacantSlots = useMemo(() => AVAILABLE_VACANT_SLOTS, []);
  const activeSlots = useMemo(() => AVAILABLE_ACTIVE_SLOTS, []);

  const handleCloseClaimModal = useCallback(() => {
    setSelectedVacantSlot(null);
  }, []);

  return (
    <div className="mobile:px-[12px] px-[32px] pb-[72px] pt-[32px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[20px]">
        <StatsSummary items={STATS_SUMMARY} />

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

            <Tab key="availableSlots" title="Available Ad Slots">
              <div className="flex flex-col gap-[32px]">
                <section className="flex flex-col gap-[16px]">
                  <ECFTypography
                    type="subtitle2"
                    className="text-[16px] font-semibold text-black"
                  >
                    Vacant Slots
                  </ECFTypography>

                  <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                    {vacantSlots.map((slot) => (
                      <VacantSlotCard
                        key={slot.id}
                        {...slot}
                        onClaim={() => setSelectedVacantSlot(slot)}
                      />
                    ))}
                  </div>
                </section>

                <section className="flex flex-col gap-[16px]">
                  <ECFTypography
                    type="subtitle2"
                    className="text-[16px] font-semibold text-black"
                  >
                    Active Slots
                  </ECFTypography>

                  <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                    {activeSlots.map((slot) => (
                      <ActiveSlotCard
                        key={slot.id}
                        slotName={slot.slotName}
                        statusLabel={slot.statusLabel}
                        owner={slot.owner}
                        mediaUrl={slot.mediaUrl}
                        mediaAlt={slot.mediaAlt}
                        stats={buildActiveStats(
                          slot.valuation,
                          slot.lockedBond,
                          slot.remainingUnits,
                          slot.minTakeoverBid,
                        )}
                        takeoverCta={slot.takeoverCta}
                      />
                    ))}
                  </div>
                </section>
              </div>
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
