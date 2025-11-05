'use client';

import {
  Card,
  CardBody,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import {
  Clock,
  CoinVertical,
  Notebook,
  NotePencil,
} from '@phosphor-icons/react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base/button';
import type { ActiveSlotData } from '@/hooks/useHarbergerSlots';
import { extractCreativeAssets } from '@/utils/creative';
import {
  calculateTaxForPeriods,
  formatDuration,
  formatEth,
  ONE_BIGINT,
  ZERO_BIGINT,
} from '@/utils/harberger';

import { CoverageSlider } from './TakeoverSlotModal';
import ValueLabel from './ValueLabel';

type PendingSlotAction = {
  slotId: string;
  action: 'renew' | 'forfeit' | 'poke';
};

type SlotStatus = 'owned' | 'overdue' | 'vacant' | 'closed';

export interface YourSlotCardProps {
  slot: ActiveSlotData;
  pendingAction?: PendingSlotAction | null;
  onRenew?: (slot: ActiveSlotData, taxPeriods: bigint) => Promise<void> | void;
  onEdit?: (slot: ActiveSlotData) => void;
  onShowDetails?: (slot: ActiveSlotData) => void;
  onForfeit?: (slot: ActiveSlotData) => void;
  editState?: {
    isSubmitting: boolean;
    activeSlotId?: string | null;
  };
}

function formatUtcTimestamp(timestamp: bigint): string {
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
}

const THREE_DAYS_IN_SECONDS = BigInt(60 * 60 * 24 * 3);
const MIN_RENEW_PERIODS = 1;
const MAX_RENEW_PERIODS = 30;

const formatPeriodsLabel = (value: number): string => {
  return value === 1 ? '1 period' : `${value} periods`;
};

export default function YourSlotsCard({
  slot,
  pendingAction,
  onRenew,
  onEdit,
  onShowDetails,
  onForfeit,
  editState,
}: YourSlotCardProps) {
  const creativeAssets = useMemo(
    () => extractCreativeAssets(slot.currentAdURI ?? ''),
    [slot.currentAdURI],
  );
  const desktopCreativeConfig = slot.creativeConfig.desktop;
  const desktopAspectStyle = desktopCreativeConfig.style;

  const status: SlotStatus = slot.isExpired
    ? 'closed'
    : slot.isOverdue
      ? 'overdue'
      : 'owned';

  const valuationBasis = useMemo(() => {
    return slot.valuationWei > ZERO_BIGINT
      ? slot.valuationWei
      : slot.minValuationWei;
  }, [slot.minValuationWei, slot.valuationWei]);

  const taxPerPeriodWei = useMemo(() => {
    return calculateTaxForPeriods(
      valuationBasis,
      slot.taxRateBps,
      slot.taxPeriodInSeconds,
      ONE_BIGINT,
    );
  }, [valuationBasis, slot.taxPeriodInSeconds, slot.taxRateBps]);

  const perPeriodTaxLabel = formatEth(taxPerPeriodWei);
  const taxOwedWei = slot.isOverdue ? taxPerPeriodWei : ZERO_BIGINT;
  const taxOwedDisplay = formatEth(taxOwedWei);

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  const periodEnding = formatUtcTimestamp(slot.taxPaidUntilTimestamp);
  const hasTimeRemaining = slot.timeRemainingInSeconds > ZERO_BIGINT;
  const remainingDuration = formatDuration(slot.timeRemainingInSeconds, {
    fallback: '0s',
  });

  const overdueSeconds =
    slot.taxPaidUntilTimestamp > ZERO_BIGINT &&
    nowSeconds > slot.taxPaidUntilTimestamp
      ? nowSeconds - slot.taxPaidUntilTimestamp
      : ZERO_BIGINT;
  const overdueDuration =
    overdueSeconds > ZERO_BIGINT
      ? formatDuration(overdueSeconds, { fallback: '0s' })
      : '';

  const taxDueCountdown = (() => {
    if (status === 'closed') {
      return '—';
    }

    if (hasTimeRemaining) {
      return remainingDuration ? `${remainingDuration} left` : '—';
    }

    if (overdueDuration) {
      return `Overdue ${overdueDuration}`;
    }

    return 'Overdue';
  })();

  const activityBadge = (() => {
    if (status === 'closed') {
      return periodEnding ? `Ended ${periodEnding}` : '';
    }

    if (hasTimeRemaining) {
      return remainingDuration
        ? `Period Ending (${remainingDuration} left)`
        : '';
    }

    return '';
  })();

  const isSoonExpiring =
    status === 'owned' &&
    slot.timeRemainingInSeconds > ZERO_BIGINT &&
    slot.timeRemainingInSeconds <= THREE_DAYS_IN_SECONDS;

  const currentAdTone: 'default' | 'danger' =
    slot.isOverdue || isSoonExpiring ? 'danger' : 'default';

  const valuationDisplay =
    slot.valuationWei > ZERO_BIGINT
      ? slot.valuation
      : formatEth(slot.minValuationWei);

  const contentUpdatesTotal = Number(slot.contentUpdateLimit ?? ZERO_BIGINT);
  const contentUpdatesUsed = Number(slot.contentUpdateCount ?? ZERO_BIGINT);
  const hasExhaustedContentUpdates =
    contentUpdatesTotal >= 0 && contentUpdatesUsed >= contentUpdatesTotal;
  const creativeUpdatesUsed =
    contentUpdatesTotal >= 0
      ? `${Math.max(0, contentUpdatesUsed)} / ${Math.max(0, contentUpdatesTotal)}${hasExhaustedContentUpdates ? ' (limit reached)' : ''}`
      : '—';

  const mediaPreview = creativeAssets.primaryImageUrl ?? null;
  const isRenewPending =
    pendingAction?.slotId === slot.id && pendingAction.action === 'renew';
  const isForfeitPending =
    pendingAction?.slotId === slot.id && pendingAction.action === 'forfeit';
  const isEditPending = Boolean(
    editState?.isSubmitting && editState?.activeSlotId === slot.id,
  );
  const isCardInactive = status === 'closed';
  const canForfeit = status === 'overdue' && slot.canForfeit;
  const isActionLocked = isForfeitPending;
  const [isConfirmingForfeit, setIsConfirmingForfeit] = useState(false);
  const [forfeitError, setForfeitError] = useState<string | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedCoveragePeriods, setSelectedCoveragePeriods] =
    useState<number>(MIN_RENEW_PERIODS);
  const [renewError, setRenewError] = useState<string | null>(null);

  const selectedCoverageBigInt = useMemo(() => {
    const normalized = Math.max(selectedCoveragePeriods, MIN_RENEW_PERIODS);
    return BigInt(normalized);
  }, [selectedCoveragePeriods]);

  const totalTaxWei = useMemo(() => {
    return calculateTaxForPeriods(
      valuationBasis,
      slot.taxRateBps,
      slot.taxPeriodInSeconds,
      selectedCoverageBigInt,
    );
  }, [
    valuationBasis,
    slot.taxPeriodInSeconds,
    slot.taxRateBps,
    selectedCoverageBigInt,
  ]);

  const totalTaxLabel = formatEth(totalTaxWei);
  const coverageDurationLabel = useMemo(() => {
    const totalCoverageSeconds =
      slot.taxPeriodInSeconds * selectedCoverageBigInt;
    return formatDuration(totalCoverageSeconds, { fallback: '0s' });
  }, [selectedCoverageBigInt, slot.taxPeriodInSeconds]);

  const periodDurationLabel = formatDuration(slot.taxPeriodInSeconds, {
    fallback: '0s',
  });
  const coverageRangeStartLabel = formatPeriodsLabel(MIN_RENEW_PERIODS);
  const coverageRangeEndLabel = formatPeriodsLabel(MAX_RENEW_PERIODS);
  const selectedPeriodsLabel = formatPeriodsLabel(selectedCoveragePeriods);
  const isRenewConfirmDisabled =
    totalTaxWei <= ZERO_BIGINT || isRenewPending || !onRenew;

  const handleOpenRenewModal = useCallback(() => {
    if (isCardInactive || isRenewPending || isActionLocked) {
      return;
    }
    setRenewError(null);
    setSelectedCoveragePeriods(MIN_RENEW_PERIODS);
    setIsRenewModalOpen(true);
  }, [isActionLocked, isCardInactive, isRenewPending]);

  const handleCloseRenewModal = useCallback(() => {
    if (isRenewPending) {
      return;
    }
    setIsRenewModalOpen(false);
    setRenewError(null);
  }, [isRenewPending]);

  const handleCoverageSliderChange = useCallback((value: number) => {
    const normalized = Math.min(
      Math.max(value, MIN_RENEW_PERIODS),
      MAX_RENEW_PERIODS,
    );
    setSelectedCoveragePeriods(normalized);
  }, []);

  const handleConfirmRenew = useCallback(async () => {
    if (!onRenew) {
      return;
    }

    if (selectedCoverageBigInt <= ZERO_BIGINT) {
      setRenewError('Select at least one tax period.');
      return;
    }

    try {
      setRenewError(null);
      await Promise.resolve(onRenew(slot, selectedCoverageBigInt));
      setIsRenewModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message || 'Failed to renew coverage.'
          : 'Failed to renew coverage.';
      setRenewError(message);
    }
  }, [onRenew, selectedCoverageBigInt, slot]);

  const handleOpenConfirm = useCallback(() => {
    if (isActionLocked || !canForfeit) {
      return;
    }
    setForfeitError(null);
    setIsConfirmingForfeit(true);
  }, [canForfeit, isActionLocked]);

  const handleCloseConfirm = useCallback(() => {
    if (isForfeitPending) {
      return;
    }
    setIsConfirmingForfeit(false);
    setForfeitError(null);
  }, [isForfeitPending]);

  const handleConfirmForfeit = useCallback(async () => {
    if (!onForfeit || isForfeitPending || !canForfeit) {
      return;
    }
    try {
      setForfeitError(null);
      await onForfeit(slot);
      setIsConfirmingForfeit(false);
    } catch (error) {
      const rawMessage =
        error instanceof Error ? (error.message ?? '') : String(error ?? '');
      const isTaxActive = rawMessage.includes('0x03e6d7c0');
      const friendlyMessage = isTaxActive
        ? 'Slot still has active tax coverage on-chain. Wait until coverage fully lapses or have an operator poke before forfeiting.'
        : 'Unable to submit forfeit transaction. Please retry after a few moments.';
      setForfeitError(friendlyMessage);
    }
  }, [canForfeit, isForfeitPending, onForfeit, slot]);

  const taxDueIsOverdue = taxDueCountdown.startsWith('Overdue');
  const isCritical = taxDueIsOverdue || currentAdTone === 'danger';
  const renewalCtaLabel = status === 'overdue' ? 'Pay Due Tax' : 'Prepay Tax';

  const displayName = slot.slotDisplayName ?? slot.slotName;

  return (
    <Card
      shadow="none"
      className={cn(
        'rounded-[10px] border border-black/10 bg-white transition-[transform,opacity]',
        'flex h-full flex-col justify-between',
        isCardInactive
          ? status === 'closed'
            ? 'opacity-70 grayscale-[35%]'
            : 'opacity-60'
          : '',
      )}
    >
      <CardBody className="mobile:gap-[14px] mobile:p-[14px] flex h-full flex-col gap-[20px] p-[20px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-wrap items-center gap-[6px]">
              <span className="text-[13px] font-semibold text-black/50">
                Slot:
              </span>
              <span className="text-[13px] font-semibold text-black">
                {displayName}
              </span>
            </div>
          </div>

          <ValueLabel>{valuationDisplay}</ValueLabel>
        </div>

        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <span className="text-[13px] font-semibold text-black/45">
              {status === 'closed' ? 'Closed:' : 'Current Ad:'}
            </span>
            {activityBadge ? (
              <ValueLabel
                className={cn(
                  'inline-flex items-center text-[13px]',
                  currentAdTone === 'danger'
                    ? ' bg-[rgba(199,24,24,0.20)] text-[#C71818]'
                    : ' bg-black/[0.04] text-black/70',
                )}
              >
                {activityBadge}
              </ValueLabel>
            ) : (
              <span className="text-[13px] text-black/30">—</span>
            )}
          </div>

          <div
            className="relative overflow-hidden rounded-[10px] border border-black/10 bg-black/5"
            style={desktopAspectStyle}
          >
            {mediaPreview ? (
              <Image
                src={mediaPreview}
                alt={displayName}
                fill
                sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[12px] text-black/40">
                No creative uploaded
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[14px] font-medium text-black/70">
              Tax Owed:
            </span>
            <ValueLabel valueLabelType="bordered">{taxOwedDisplay}</ValueLabel>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[14px] font-medium text-black/70">
              Tax Due:
            </span>
            <div
              className={cn(
                'inline-flex items-center gap-[6px] rounded-[6px] px-[6px] py-[2px] text-[14px] font-semibold',
                isCritical
                  ? ' bg-[#FEE4E2] text-[#C71818]'
                  : ' bg-[#F5F5F5] text-black',
              )}
            >
              <Clock
                size={14}
                weight="fill"
                className={isCritical ? 'text-[#C71818]' : 'text-black/50'}
              />
              {taxDueCountdown}
            </div>
          </div>

          {status !== 'closed' ? (
            <Button
              color="primary"
              radius="md"
              size="md"
              className="h-[32px] w-full rounded-[6px] text-[14px] font-semibold"
              isDisabled={isCardInactive || isRenewPending || isActionLocked}
              isLoading={isRenewPending}
              onPress={handleOpenRenewModal}
            >
              <CoinVertical className="size-[20px] opacity-50" />
              {renewalCtaLabel}
            </Button>
          ) : null}

          {status === 'overdue' && canForfeit ? (
            <Button
              color="danger"
              size="sm"
              className="min-w-[140px] flex-1 rounded-[6px] text-[14px] font-semibold text-white"
              isDisabled={isActionLocked || !canForfeit}
              isLoading={isForfeitPending}
              onPress={handleOpenConfirm}
            >
              Forfeit Slot
            </Button>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap gap-3 border-t border-black/10 pt-[10px]">
            {status !== 'closed' ? (
              <Button
                color="secondary"
                size="sm"
                className="min-w-[140px] flex-1 rounded-[6px] border border-black/15 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                isDisabled={
                  isCardInactive ||
                  isRenewPending ||
                  isActionLocked ||
                  hasExhaustedContentUpdates
                }
                isLoading={isEditPending}
                title={
                  hasExhaustedContentUpdates
                    ? 'Content update limit reached. Request governance reset to enable edits.'
                    : undefined
                }
                onPress={() => onEdit?.(slot)}
                startContent={<NotePencil size={20} className="opacity-50" />}
              >
                Edit
              </Button>
            ) : null}

            <Button
              color="secondary"
              size="sm"
              className="min-w-[140px] flex-1 rounded-[6px] border border-black/15 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
              isDisabled={isCardInactive || isActionLocked}
              onPress={() => onShowDetails?.(slot)}
              startContent={<Notebook size={20} className="text-black/50" />}
            >
              Slot Details
            </Button>
          </div>

          <div className="mt-[5px] flex flex-wrap items-center justify-between gap-[6px] text-[13px] text-black/50">
            <span>Content Updates Used:</span>
            <span className="font-semibold text-black/70">
              {creativeUpdatesUsed}
            </span>
          </div>
        </div>
      </CardBody>

      <Modal
        isOpen={isRenewModalOpen}
        onClose={handleCloseRenewModal}
        isDismissable={!isRenewPending}
        placement="center"
        classNames={{
          base: 'max-w-[420px] bg-white p-0',
          header: 'p-[20px] text-[18px] font-semibold text-black',
          body: 'p-[20px] flex flex-col gap-[14px] text-[14px] text-black/70',
          footer: 'p-[16px] flex justify-end gap-[12px]',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Prepay Tax</ModalHeader>
              <ModalBody>
                <p className="text-[13px] text-black/60">
                  One period ≈ {periodDurationLabel}. Adjust coverage to prepay
                  multiple periods at once.
                </p>

                <CoverageSlider
                  value={selectedCoveragePeriods}
                  min={MIN_RENEW_PERIODS}
                  max={MAX_RENEW_PERIODS}
                  rangeStart={coverageRangeStartLabel}
                  rangeEnd={coverageRangeEndLabel}
                  onChange={handleCoverageSliderChange}
                  onChangeEnd={handleCoverageSliderChange}
                />

                <div className="flex flex-col gap-[10px] rounded-[8px] border border-black/10 bg-[#F9F9F9] p-[12px]">
                  <div className="flex items-center justify-between text-[13px] text-black/70">
                    <span>Tax per Period</span>
                    <ValueLabel valueLabelType="bordered">
                      {perPeriodTaxLabel}
                    </ValueLabel>
                  </div>
                  <div className="flex items-center justify-between text-[13px] text-black/70">
                    <span>Selected Coverage</span>
                    <ValueLabel valueLabelType="pureText">
                      {selectedPeriodsLabel}
                    </ValueLabel>
                  </div>
                  <div className="flex items-center justify-between text-[13px] text-black/70">
                    <span>Coverage Duration</span>
                    <ValueLabel valueLabelType="pureText">
                      {coverageDurationLabel}
                    </ValueLabel>
                  </div>
                  <div className="flex items-center justify-between text-[13px] font-semibold text-black">
                    <span>Total Tax</span>
                    <ValueLabel valueLabelType="dark">
                      {totalTaxLabel}
                    </ValueLabel>
                  </div>
                  <div className="rounded-[6px] bg-black/[0.04] px-[10px] py-[8px] text-[12px] text-black/50">
                    {perPeriodTaxLabel} × {selectedCoveragePeriods}{' '}
                    {selectedCoveragePeriods === 1 ? 'period' : 'periods'} ={' '}
                    {totalTaxLabel}
                  </div>
                </div>

                {renewError ? (
                  <div className="rounded-[6px] bg-[#FEF2F2] px-[10px] py-[8px] text-[12px] text-[#B91C1C]">
                    {renewError}
                  </div>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  size="sm"
                  className="rounded-[6px] px-[12px] text-[14px] font-semibold"
                  isDisabled={isRenewPending}
                  onPress={handleCloseRenewModal}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  className="rounded-[6px] px-[14px] text-[14px] font-semibold text-white"
                  isDisabled={isRenewConfirmDisabled}
                  isLoading={isRenewPending}
                  onPress={handleConfirmRenew}
                >
                  {`Prepay ${totalTaxLabel}`}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isConfirmingForfeit}
        onClose={handleCloseConfirm}
        isDismissable={!isForfeitPending}
        placement="center"
        classNames={{
          base: 'max-w-[420px] bg-white p-0',
          header: 'p-[20px] text-[18px] font-semibold text-black',
          body: 'p-[20px] text-[14px] text-black/70',
          footer: 'p-[16px] flex justify-end gap-[12px]',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Confirm Forfeit</ModalHeader>
              <ModalBody>
                <p>
                  Forfeiting will immediately release this slot and refund any
                  remaining balances according to the contract rules. Continue?
                </p>
                {forfeitError ? (
                  <div className="mt-[10px] rounded-[6px] bg-[#FEF2F2] p-[10px] text-[12px] text-[#B91C1C]">
                    {forfeitError}
                  </div>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  size="sm"
                  className="rounded-[6px] px-[12px] text-[14px] font-semibold"
                  isDisabled={isForfeitPending}
                  onPress={handleCloseConfirm}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  className="rounded-[6px] px-[14px] text-[14px] font-semibold text-white"
                  isLoading={isForfeitPending}
                  onPress={handleConfirmForfeit}
                >
                  Forfeit Slot
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
}
