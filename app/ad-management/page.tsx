'use client';

import { Tab, Tabs } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import AdManagementHeader from '@/components/pages/ad-management/AdViewer/AdManagementHeader';
import {
  ActiveSlotCard,
  ActiveSlotCardSkeleton,
  VacantSlotCard,
  VacantSlotCardSkeleton,
} from '@/components/pages/ad-management/AvailableSlotCard';
import ClaimSlotModal from '@/components/pages/ad-management/ClaimSlotModal';
import StatsSummary, {
  type StatsSummaryItem,
} from '@/components/pages/ad-management/StatsSummary';
import TakeoverSlotModal, {
  type TakeoverSubmissionPayload,
} from '@/components/pages/ad-management/TakeoverSlotModal';
import YourSlotsCard from '@/components/pages/ad-management/YourSlotsCard';
import { useHarbergerSlotActions } from '@/hooks/useHarbergerSlotActions';
import {
  useHarbergerSlots,
  type ActiveSlotData,
  type VacantSlotData,
} from '@/hooks/useHarbergerSlots';
import {
  ONE_BIGINT,
  ZERO_BIGINT,
  calculateTaxForPeriods,
  formatEth,
  sumBigints,
} from '@/utils/harberger';

type TabKey = 'yourSlots' | 'templateProposals' | 'availableSlots';

export default function AdManagementPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('availableSlots');
  const [selectedVacantSlot, setSelectedVacantSlot] =
    useState<VacantSlotData | null>(null);
  const [selectedTakeoverSlot, setSelectedTakeoverSlot] =
    useState<ActiveSlotData | null>(null);
  const [selectedEditSlot, setSelectedEditSlot] =
    useState<ActiveSlotData | null>(null);
  const [selectedDetailsSlot, setSelectedDetailsSlot] =
    useState<ActiveSlotData | null>(null);
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [isTakeoverSubmitting, setIsTakeoverSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [pendingSlotAction, setPendingSlotAction] = useState<{
    slotId: string;
    action: 'renew' | 'forfeit' | 'poke';
  } | null>(null);
  const { address: connectedAddress } = useAccount();

  const { metrics, vacantSlots, activeSlots, isLoading, error, refetch } =
    useHarbergerSlots();

  const {
    claim: claimSlot,
    takeover: takeoverSlot,
    renew: renewSlot,
    forfeit: forfeitSlot,
    poke: pokeSlot,
    updateCreative,
  } = useHarbergerSlotActions();

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

  const handleRenewSlot = useCallback(
    async (slot: ActiveSlotData) => {
      setPendingSlotAction({ slotId: slot.id, action: 'renew' });
      try {
        await renewSlot({ slot, taxPeriods: ONE_BIGINT });
        await refetch();
      } finally {
        setPendingSlotAction(null);
      }
    },
    [refetch, renewSlot],
  );

  const handleForfeitSlot = useCallback(
    async (slot: ActiveSlotData) => {
      setPendingSlotAction({ slotId: slot.id, action: 'forfeit' });
      try {
        await forfeitSlot({ slot });
        await refetch();
        setSelectedDetailsSlot((current) =>
          current && current.id === slot.id ? null : current,
        );
        setSelectedEditSlot((current) =>
          current && current.id === slot.id ? null : current,
        );
      } finally {
        setPendingSlotAction(null);
      }
    },
    [forfeitSlot, refetch],
  );

  const handlePokeSlot = useCallback(
    async (slot: ActiveSlotData) => {
      setPendingSlotAction({ slotId: slot.id, action: 'poke' });
      try {
        await pokeSlot({ slot });
        await refetch();
      } finally {
        setPendingSlotAction(null);
      }
    },
    [pokeSlot, refetch],
  );

  const handleClaimSubmit = useCallback(
    async ({
      valuationWei,
      taxPeriods,
      creativeUri,
    }: {
      valuationWei: bigint;
      taxPeriods: bigint;
      creativeUri: string;
    }) => {
      if (!selectedVacantSlot) {
        throw new Error('No slot selected.');
      }

      setIsClaimSubmitting(true);

      try {
        await claimSlot({
          slot: selectedVacantSlot,
          valuationWei,
          taxPeriods,
          creativeUri,
        });
        await refetch();
        setSelectedVacantSlot(null);
      } catch (error) {
        throw error;
      } finally {
        setIsClaimSubmitting(false);
      }
    },
    [claimSlot, refetch, selectedVacantSlot],
  );

  const handleTakeoverSubmit = useCallback(
    async ({
      valuationWei,
      taxPeriods,
      creativeUri,
    }: TakeoverSubmissionPayload) => {
      if (!selectedTakeoverSlot || !valuationWei || !taxPeriods) {
        return;
      }

      setIsTakeoverSubmitting(true);

      try {
        await takeoverSlot({
          slot: selectedTakeoverSlot,
          valuationWei,
          taxPeriods,
          creativeUri:
            creativeUri && creativeUri.trim().length > 0
              ? creativeUri.trim()
              : (selectedTakeoverSlot.currentAdURI ?? ''),
        });
        setSelectedTakeoverSlot(null);
        await refetch();
      } catch (error) {
        throw error;
      } finally {
        setIsTakeoverSubmitting(false);
      }
    },
    [refetch, selectedTakeoverSlot, takeoverSlot],
  );

  const handleEditSubmit = useCallback(
    async ({ creativeUri }: { creativeUri?: string }) => {
      if (
        !selectedEditSlot ||
        !creativeUri ||
        creativeUri.trim().length === 0
      ) {
        return;
      }

      setIsEditSubmitting(true);
      try {
        await updateCreative({
          slot: selectedEditSlot,
          creativeUri: creativeUri.trim(),
        });
        await refetch();
        setSelectedEditSlot(null);
      } catch (error) {
        throw error;
      } finally {
        setIsEditSubmitting(false);
      }
    },
    [refetch, selectedEditSlot, updateCreative],
  );

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
        id: 'overdue',
        label: 'Overdue',
        value: metrics.overdueCount.toString(),
      },
    ];
  }, [metrics.overdueCount, ownedSlots.length, ownedSlotsTotalTaxDueWei]);

  const isDetailsForfeitLoading =
    pendingSlotAction?.slotId === selectedDetailsSlot?.id &&
    pendingSlotAction?.action === 'forfeit';

  const handleCloseClaimModal = useCallback(() => {
    if (isClaimSubmitting) {
      return;
    }
    setSelectedVacantSlot(null);
  }, [isClaimSubmitting]);

  const handleCloseTakeoverModal = useCallback(() => {
    if (isTakeoverSubmitting) {
      return;
    }
    setSelectedTakeoverSlot(null);
  }, [isTakeoverSubmitting]);

  const handleCloseEditModal = useCallback(() => {
    if (isEditSubmitting) {
      return;
    }
    setSelectedEditSlot(null);
  }, [isEditSubmitting]);

  const handleCloseDetailsModal = useCallback(() => {
    setSelectedDetailsSlot(null);
  }, []);

  return (
    <div className="mobile:px-[10px] px-[32px] pb-[72px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[20px]">
        <AdManagementHeader connectedAddress={connectedAddress} />

        <StatsSummary items={statsItems} />

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
                  <p className="font-mona text-[18px] font-[500] text-black/50">
                    Vacant Slots:
                  </p>

                  {isLoading && vacantSlots.length === 0 ? (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <VacantSlotCardSkeleton
                          key={`vacant-skeleton-${index}`}
                        />
                      ))}
                    </div>
                  ) : vacantSlots.length === 0 || error ? (
                    <DataFallback message="No vacant slots published by the factory yet." />
                  ) : (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {vacantSlots.map((slot) => (
                        <VacantSlotCard
                          key={slot.id}
                          slot={slot}
                          onClaim={setSelectedVacantSlot}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-[16px]">
                  <p className="font-mona text-[18px] font-[500] text-black/50">
                    Active Slots:
                  </p>

                  {isLoading && activeSlots.length === 0 ? (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <ActiveSlotCardSkeleton
                          key={`active-skeleton-${index}`}
                        />
                      ))}
                    </div>
                  ) : activeSlots.length === 0 || error ? (
                    <DataFallback message="No active slots claimed yet." />
                  ) : (
                    <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                      {activeSlots.map((slot) => (
                        <ActiveSlotCard
                          key={slot.id}
                          slot={slot}
                          onTakeover={setSelectedTakeoverSlot}
                          onPoke={handlePokeSlot}
                          takeoverState={{
                            isSubmitting: isTakeoverSubmitting,
                            activeSlotId: selectedTakeoverSlot?.id ?? null,
                          }}
                          pendingAction={pendingSlotAction}
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
              ) : ownedSlots.length === 0 ? (
                <DataFallback message="You do not own any slots yet." />
              ) : (
                <div className="mobile:grid-cols-1 grid grid-cols-2 gap-[20px]">
                  {ownedSlots.map((slot) => (
                    <YourSlotsCard
                      key={slot.id}
                      slot={slot}
                      pendingAction={pendingSlotAction}
                      onRenew={handleRenewSlot}
                      onEdit={setSelectedEditSlot}
                      onShowDetails={setSelectedDetailsSlot}
                      onForfeit={handleForfeitSlot}
                      editState={{
                        isSubmitting: isEditSubmitting,
                        activeSlotId: selectedEditSlot?.id ?? null,
                      }}
                    />
                  ))}
                </div>
              )}
            </Tab>

            {/* <Tab key="templateProposals" title="Template Proposals">
              <TabPlaceholder
                title="Template library coming soon"
                description="Save and reuse campaigns for recurring Harberger slots. Upload templates and share with collaborators."
              />
            </Tab> */}
          </Tabs>
        </section>
      </div>

      <ClaimSlotModal
        isOpen={!!selectedVacantSlot}
        onClose={handleCloseClaimModal}
        slot={selectedVacantSlot}
        onSubmit={handleClaimSubmit}
        isSubmitting={isClaimSubmitting}
      />

      <TakeoverSlotModal
        isOpen={!!selectedEditSlot}
        onClose={handleCloseEditModal}
        slot={selectedEditSlot}
        mode="edit"
        onSubmit={handleEditSubmit}
        isSubmitting={isEditSubmitting}
      />

      <TakeoverSlotModal
        isOpen={!!selectedDetailsSlot}
        onClose={handleCloseDetailsModal}
        slot={selectedDetailsSlot}
        mode="view"
        onSubmit={
          selectedDetailsSlot
            ? async () => {
                await handleForfeitSlot(selectedDetailsSlot);
              }
            : undefined
        }
        isSubmitting={isDetailsForfeitLoading}
      />

      <TakeoverSlotModal
        isOpen={!!selectedTakeoverSlot}
        onClose={handleCloseTakeoverModal}
        slot={selectedTakeoverSlot}
        mode="takeover"
        onSubmit={handleTakeoverSubmit}
        isSubmitting={isTakeoverSubmitting}
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
