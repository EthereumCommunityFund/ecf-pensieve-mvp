'use client';

import { Tab, Tabs } from '@heroui/react';
import { useMemo, useState } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
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

export default function AdManagementPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('yourSlots');

  const yourSlots = useMemo(() => YOUR_SLOTS_DATA, []);

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
              <TabPlaceholder
                title="Marketplace integration pending"
                description="Browse active bids and vacant inventory once the marketplace endpoint is connected."
                actionLabel="View Market Overview"
              />
            </Tab>
          </Tabs>
        </section>
      </div>
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
