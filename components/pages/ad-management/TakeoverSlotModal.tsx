'use client';

import { useMemo } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, ShowMetricsIcon, XIcon } from '@/components/icons';

type ContextTone = 'default' | 'danger';

interface BreakdownConfig {
  bondRateLabel: string;
  bondRateValue: string;
  taxLabel: string;
  taxValue: string;
  coverageLabel: string;
  coverageValue: string;
  totalLabel: string;
  totalValue: string;
}

interface ValuationConfig {
  placeholder?: string;
  helper: string;
  value?: string;
  errorMessage?: string;
  isDisabled?: boolean;
}

interface CoverageConfig {
  label: string;
  description: string;
  sliderPosition: number;
  rangeStart: string;
  rangeEnd: string;
}

export interface TakeoverSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextLabel: string;
  contextTone?: ContextTone;
  slotName: string;
  statusLabel?: string;
  owner: string;
  ownerLabel?: string;
  taxRate: string;
  taxRateLabel?: string;
  minBidLabel: string;
  minBidValue: string;
  minBidHelper?: string;
  valuation: ValuationConfig;
  coverage: CoverageConfig;
  breakdown: BreakdownConfig;
  harbergerInfo: string;
  ctaLabel: string;
  isCtaDisabled?: boolean;
}

export default function TakeoverSlotModal({
  isOpen,
  onClose,
  contextLabel,
  contextTone = 'default',
  slotName,
  statusLabel = 'Owned',
  owner,
  ownerLabel = 'Current Owner',
  taxRate,
  taxRateLabel = 'Tax Rate',
  minBidLabel,
  minBidValue,
  minBidHelper,
  valuation,
  coverage,
  breakdown,
  harbergerInfo,
  ctaLabel,
  isCtaDisabled,
}: TakeoverSlotModalProps) {
  const contextClassName = useMemo(() => {
    if (contextTone === 'danger') {
      return 'text-[#D92D20]';
    }
    return 'text-[#2F6FED]';
  }, [contextTone]);

  const sliderProgress = Math.min(Math.max(coverage.sliderPosition, 0), 1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px]',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <div className="flex flex-col gap-[6px] px-5 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ECFTypography type="subtitle2" className="text-[18px]">
                    Takeover Slot
                  </ECFTypography>
                  <span className="rounded-[6px] border border-black/10 bg-[#F4F5F7] px-[8px] py-[2px] text-[12px] font-semibold uppercase tracking-[0.04em] text-black/70">
                    {statusLabel}
                  </span>
                </div>
                <Button
                  isIconOnly
                  radius="sm"
                  className="size-[32px] rounded-[8px] bg-black/5 p-0 text-black/50 hover:bg-black/10"
                  onPress={onClose}
                >
                  <XIcon size={16} />
                </Button>
              </div>
            </div>

            <ModalBody className="flex flex-col gap-[20px] px-5 pb-0 pt-4">
              <div className="flex flex-col gap-[10px]">
                <span className="text-[13px] font-semibold text-black/50">
                  Slot:
                </span>
                <span className="text-[14px] font-semibold text-black">
                  {slotName}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-[12px] rounded-[12px] border border-black/10 bg-white p-[16px] md:grid-cols-3">
                <InfoStat label={ownerLabel} value={owner} />
                <InfoStat label={taxRateLabel} value={taxRate} />
                <InfoStat label={minBidLabel} value={minBidValue} emphasized />
              </div>
              {minBidHelper ? (
                <span className="text-[12px] text-black/60">
                  {minBidHelper}
                </span>
              ) : null}

              <div className="flex flex-col gap-[12px]">
                <LabelWithInfo label="Set New Valuation (ETH)" />
                <Input
                  placeholder={valuation.placeholder}
                  defaultValue={valuation.value}
                  isInvalid={!!valuation.errorMessage}
                  isDisabled={valuation.isDisabled}
                  aria-label="Set new valuation"
                  readOnly={valuation.isDisabled}
                />
                {valuation.errorMessage ? (
                  <span className="text-[12px] font-medium text-[#D92D20]">
                    {valuation.errorMessage}
                  </span>
                ) : (
                  <span className="text-[12px] text-black/60">
                    {valuation.helper}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-[12px]">
                <LabelWithInfo label={`Tax Coverage ${coverage.label}`} />
                <span className="text-[12px] leading-[18px] text-black/60">
                  {coverage.description}
                </span>
                <CoverageSlider
                  progress={sliderProgress}
                  rangeStart={coverage.rangeStart}
                  rangeEnd={coverage.rangeEnd}
                />
              </div>

              <div className="flex flex-col gap-[16px] rounded-[12px] border border-black/10 bg-[#FCFCFC] p-[16px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-[8px] text-[13px] font-semibold text-black/70">
                    <ShowMetricsIcon className="size-[18px] text-black/40" />
                    <span>Bonding Cost Breakdown:</span>
                  </div>
                  <InfoIcon size={18} />
                </div>

                <BreakdownRow
                  label={breakdown.bondRateLabel}
                  value={breakdown.bondRateValue}
                />
                <BreakdownRow
                  label={breakdown.taxLabel}
                  value={breakdown.taxValue}
                />
                <BreakdownRow
                  label={breakdown.coverageLabel}
                  value={breakdown.coverageValue}
                />

                <div className="flex items-center justify-between rounded-[8px] bg-black/[0.03] px-[12px] py-[10px]">
                  <div className="flex items-center gap-[6px] text-[13px] font-semibold text-black/80">
                    <span>{breakdown.totalLabel}</span>
                    <InfoIcon size={16} />
                  </div>
                  <span className="text-[14px] font-semibold text-[#0C7A32]">
                    {breakdown.totalValue}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-[10px] rounded-[12px]  p-[16px]">
                <span className="text-[13px] font-semibold text-black/80">
                  How Harberger Tax Works:
                </span>
                <span className="text-[12px] leading-[18px] text-black/60">
                  {harbergerInfo}
                </span>
              </div>
            </ModalBody>

            <ModalFooter className="flex items-center gap-[12px] p-5">
              <Button
                color="secondary"
                className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                className="h-[40px] flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
                isDisabled={isCtaDisabled}
              >
                {ctaLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function InfoStat({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/45">
        {label}
      </span>
      <span
        className={`text-[14px] font-semibold ${
          emphasized
            ? 'rounded-[6px] border border-black/15 bg-black/[0.05] px-[10px] py-[4px] text-black'
            : 'text-black'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function LabelWithInfo({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[8px] text-[13px] font-semibold text-black/70">
      <span>{label}</span>
      <InfoIcon size={16} />
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-black/10 pb-[10px] text-[13px] text-black/70 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-[6px]">
        <span>{label}</span>
        <InfoIcon size={16} />
      </div>
      <span className="font-semibold text-black">{value}</span>
    </div>
  );
}

function CoverageSlider({
  progress,
  rangeStart,
  rangeEnd,
}: {
  progress: number;
  rangeStart: string;
  rangeEnd: string;
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="relative h-[6px] w-full rounded-full bg-black/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-black"
          style={{ width: `${clampedProgress * 100}%` }}
        />
        <div
          className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
          style={{ left: `${clampedProgress * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[12px] text-black/50">
        <span>{rangeStart}</span>
        <span>{rangeEnd}</span>
      </div>
    </div>
  );
}
