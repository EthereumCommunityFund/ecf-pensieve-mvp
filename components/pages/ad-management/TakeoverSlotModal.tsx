'use client';

import { Slider } from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  onChange?: (value: string) => void;
}

interface CoverageConfig {
  label: string;
  description: string;
  sliderPosition: number;
  rangeStart: string;
  rangeEnd: string;
  minDays?: number;
  maxDays?: number;
  stepDays?: number;
  defaultDays?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
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
  onSubmit?: () => void;
  isSubmitting?: boolean;
  creativeUriValue?: string;
  onCreativeUriChange?: (value: string) => void;
  errorMessage?: string;
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
  onSubmit,
  isSubmitting = false,
  creativeUriValue,
  onCreativeUriChange,
  errorMessage,
}: TakeoverSlotModalProps) {
  const contextClassName = useMemo(() => {
    if (contextTone === 'danger') {
      return 'text-[#D92D20]';
    }
    return 'text-[#2F6FED]';
  }, [contextTone]);

  const minCoverageDays = Math.max(coverage.minDays ?? 1, 0);
  const rawMaxCoverageDays = coverage.maxDays ?? 365;
  const maxCoverageDays =
    rawMaxCoverageDays > minCoverageDays ? rawMaxCoverageDays : minCoverageDays;
  const stepCoverageDays =
    coverage.stepDays && coverage.stepDays > 0 ? coverage.stepDays : 1;

  const derivedInitialCoverageDays = useMemo(() => {
    const progressDays = computeDaysFromProgress(
      coverage.sliderPosition,
      minCoverageDays,
      maxCoverageDays,
    );
    const candidateValue =
      coverage.defaultDays ??
      extractDaysFromString(coverage.label) ??
      extractDaysFromString(breakdown.coverageValue) ??
      progressDays;
    return snapToStep(
      candidateValue ?? minCoverageDays,
      minCoverageDays,
      maxCoverageDays,
      stepCoverageDays,
    );
  }, [
    coverage.defaultDays,
    coverage.label,
    coverage.sliderPosition,
    breakdown.coverageValue,
    minCoverageDays,
    maxCoverageDays,
    stepCoverageDays,
  ]);

  const [selectedCoverageDays, setSelectedCoverageDays] = useState(
    derivedInitialCoverageDays,
  );
  const [creativeUri, setCreativeUri] = useState(creativeUriValue ?? '');

  useEffect(() => {
    setSelectedCoverageDays(derivedInitialCoverageDays);
  }, [derivedInitialCoverageDays]);

  useEffect(() => {
    setCreativeUri(creativeUriValue ?? '');
  }, [creativeUriValue]);

  const formattedCoverageLabel = `(${formatDaysLabel(selectedCoverageDays)})`;
  const coverageRangeStartLabel =
    coverage.rangeStart ?? formatRangeBoundary(minCoverageDays);
  const coverageRangeEndLabel =
    coverage.rangeEnd ?? formatRangeBoundary(maxCoverageDays);

  const handleCoverageSliderChange = useCallback(
    (value: number) => {
      const normalizedValue = snapToStep(
        value,
        minCoverageDays,
        maxCoverageDays,
        stepCoverageDays,
      );
      setSelectedCoverageDays(normalizedValue);
      coverage.onChange?.(normalizedValue);
    },
    [coverage, minCoverageDays, maxCoverageDays, stepCoverageDays],
  );

  const handleCoverageSliderChangeEnd = useCallback(
    (value: number) => {
      const normalizedValue = snapToStep(
        value,
        minCoverageDays,
        maxCoverageDays,
        stepCoverageDays,
      );
      coverage.onChangeEnd?.(normalizedValue);
    },
    [coverage, minCoverageDays, maxCoverageDays, stepCoverageDays],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px] h-[calc(100vh-200px)]',
        body: 'overflow-y-scroll',
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
                  isDisabled={isSubmitting}
                >
                  <XIcon size={16} />
                </Button>
              </div>
            </div>

            <ModalBody className="flex flex-col gap-[20px] px-5 pb-0 pt-4 ">
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
                  value={valuation.value ?? ''}
                  onValueChange={valuation.onChange}
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
                <LabelWithInfo
                  label={`Tax Coverage ${formattedCoverageLabel}`}
                />
                <span className="text-[12px] leading-[18px] text-black/60">
                  {coverage.description}
                </span>
                <CoverageSlider
                  value={selectedCoverageDays}
                  min={minCoverageDays}
                  max={maxCoverageDays}
                  step={stepCoverageDays}
                  rangeStart={coverageRangeStartLabel}
                  rangeEnd={coverageRangeEndLabel}
                  onChange={handleCoverageSliderChange}
                  onChangeEnd={handleCoverageSliderChangeEnd}
                />
              </div>

              <div className="flex flex-col gap-[12px]">
                <LabelWithInfo label="Creative URI" />
                <Input
                  placeholder="https:// or data:..."
                  aria-label="Creative URI"
                  value={creativeUri}
                  onValueChange={(value) => {
                    setCreativeUri(value);
                    onCreativeUriChange?.(value);
                  }}
                  isDisabled={valuation.isDisabled}
                />
                <span className="text-[12px] text-black/50">
                  Provide a direct asset link for the new creative. Leave blank
                  to reuse the existing creative and update later.
                </span>
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

              {errorMessage ? (
                <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                  {errorMessage}
                </div>
              ) : null}
            </ModalBody>

            <ModalFooter className="flex items-center gap-[12px] p-5">
              <Button
                color="secondary"
                className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                onPress={onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                className="h-[40px] flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
                isDisabled={isCtaDisabled || isSubmitting}
                isLoading={Boolean(isSubmitting)}
                onPress={onSubmit}
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
  value,
  min,
  max,
  step = 1,
  rangeStart,
  rangeEnd,
  onChange,
  onChangeEnd,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  rangeStart: string;
  rangeEnd: string;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}) {
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const normalizeValue = useCallback(
    (input: number | number[]) => {
      const numericValue = Array.isArray(input) ? input[0] : input;
      const clampedValue = clampValue(numericValue, min, max);
      return snapToStep(clampedValue, min, max, step);
    },
    [min, max, step],
  );

  const handleChange = useCallback(
    (next: number | number[]) => {
      const normalizedValue = normalizeValue(next);
      setSliderValue(normalizedValue);
      onChange?.(normalizedValue);
    },
    [normalizeValue, onChange],
  );

  const handleChangeEnd = useCallback(
    (next: number | number[]) => {
      const normalizedValue = normalizeValue(next);
      setSliderValue(normalizedValue);
      onChangeEnd?.(normalizedValue);
    },
    [normalizeValue, onChangeEnd],
  );

  return (
    <div className="flex flex-col gap-[10px]">
      <Slider
        aria-label="Tax coverage slider"
        value={sliderValue}
        minValue={min}
        maxValue={max}
        step={step}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        classNames={{
          base: 'w-full gap-0',
          trackWrapper: 'flex items-center gap-0 py-0',
          track:
            'relative flex h-[6px] w-full rounded-full bg-black/10 border-0 !border-0 !border-l-0 !border-r-0',
          filler:
            'absolute inset-y-0 left-0 h-full rounded-full bg-black transition-none motion-reduce:transition-none',
          thumb:
            'z-10 size-[18px] rounded-full border border-black/60 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)] before:hidden after:hidden',
        }}
      />
      <div className="flex items-center justify-between text-[12px] text-black/50">
        <span>{rangeStart}</span>
        <span>{rangeEnd}</span>
      </div>
    </div>
  );
}

function clampValue(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  if (max <= min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, max: number, step: number) {
  if (max <= min) {
    return min;
  }

  const safeStep = step > 0 ? step : 1;
  const clampedValue = clampValue(value, min, max);
  const steps = Math.round((clampedValue - min) / safeStep);
  const snappedValue = min + steps * safeStep;

  return clampValue(snappedValue, min, max);
}

function computeDaysFromProgress(
  progress: number | undefined,
  min: number,
  max: number,
) {
  if (max <= min) {
    return min;
  }

  if (typeof progress !== 'number' || Number.isNaN(progress)) {
    return min;
  }

  const boundedProgress = clampValue(progress, 0, 1);
  return min + boundedProgress * (max - min);
}

function extractDaysFromString(text?: string) {
  if (!text) {
    return undefined;
  }

  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) {
    return undefined;
  }

  const value = Number(match[1]);
  return Number.isNaN(value) ? undefined : value;
}

function formatDaysLabel(value: number) {
  const roundedValue = Number.isInteger(value)
    ? value
    : Number(value.toFixed(2));
  const unit = roundedValue === 1 ? 'Day' : 'Days';
  return `${roundedValue} ${unit}`;
}

function formatRangeBoundary(value: number) {
  const roundedValue = Math.round(value);
  return roundedValue === 1 ? '1 day' : `${roundedValue} days`;
}
