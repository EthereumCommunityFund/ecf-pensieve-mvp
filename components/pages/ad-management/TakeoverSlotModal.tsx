'use client';

import { cn, Slider, Tooltip } from '@heroui/react';
import { CoinVertical, TrendUp } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Modal, ModalBody, ModalContent } from '@/components/base/modal';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, XIcon } from '@/components/icons';

import { BreakdownRow } from './ClaimSlotModal';
import CreativePhotoUpload from './CreativePhotoUpload';
import ValueLabel, { IValueLabelType } from './ValueLabel';
import {
  CREATIVE_GUIDANCE,
  DESKTOP_CREATIVE_CONFIG,
  MOBILE_CREATIVE_CONFIG,
} from './creativeConstants';

type ContextTone = 'default' | 'danger';
type SlotModalMode = 'takeover' | 'edit' | 'view';

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
  slotDisplayName?: string;
  page?: string;
  position?: string;
  imageSize?: string;
  statusLabel?: string;
  owner: string;
  ownerLabel?: string;
  taxRate: string;
  taxRateLabel?: string;
  minBidLabel: string;
  minBidValue: string;
  minBidHelper?: string;
  valuation?: ValuationConfig;
  coverage?: CoverageConfig;
  breakdown?: BreakdownConfig;
  harbergerInfo?: string;
  ctaLabel?: string;
  isCtaDisabled?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  creativeUriValue?: string;
  onCreativeUriChange?: (value: string) => void;
  errorMessage?: string;
  mode?: SlotModalMode;
}

export default function TakeoverSlotModal({
  isOpen,
  onClose,
  contextLabel,
  contextTone = 'default',
  slotName,
  slotDisplayName,
  page,
  position,
  imageSize,
  statusLabel = 'Owned',
  owner,
  ownerLabel = 'Owner',
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
  mode = 'takeover',
}: TakeoverSlotModalProps) {
  const isTakeoverMode = mode === 'takeover';
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const allowCreativeEditing = isTakeoverMode || isEditMode;
  const requireCreativeReady = allowCreativeEditing;

  const displayName = slotDisplayName ?? slotName;

  const minCoverageDays = Math.max(coverage?.minDays ?? 1, 0);
  const rawMaxCoverageDays = coverage?.maxDays ?? 365;
  const maxCoverageDays =
    rawMaxCoverageDays > minCoverageDays ? rawMaxCoverageDays : minCoverageDays;
  const stepCoverageDays =
    coverage?.stepDays && coverage.stepDays > 0 ? coverage.stepDays : 1;

  const coverageSliderPosition = coverage?.sliderPosition ?? 0;
  const coverageDefaultDays = coverage?.defaultDays;
  const coverageLabelText = coverage?.label;
  const breakdownCoverageText = breakdown?.coverageValue;

  const derivedInitialCoverageDays = useMemo(() => {
    const progressDays = computeDaysFromProgress(
      coverageSliderPosition,
      minCoverageDays,
      maxCoverageDays,
    );
    const candidateValue =
      coverageDefaultDays ??
      extractDaysFromString(coverageLabelText) ??
      extractDaysFromString(breakdownCoverageText) ??
      progressDays;
    return snapToStep(
      candidateValue ?? minCoverageDays,
      minCoverageDays,
      maxCoverageDays,
      stepCoverageDays,
    );
  }, [
    coverageDefaultDays,
    coverageLabelText,
    coverageSliderPosition,
    breakdownCoverageText,
    minCoverageDays,
    maxCoverageDays,
    stepCoverageDays,
  ]);

  const [selectedCoverageDays, setSelectedCoverageDays] = useState(
    derivedInitialCoverageDays,
  );
  const [creativeTitle, setCreativeTitle] = useState('');
  const [creativeLink, setCreativeLink] = useState('');
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [creativeUri, setCreativeUri] = useState(creativeUriValue ?? '');
  const [localCreativeError, setLocalCreativeError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setSelectedCoverageDays(derivedInitialCoverageDays);
  }, [derivedInitialCoverageDays]);

  useEffect(() => {
    if (!creativeUriValue) {
      setCreativeUri('');
      setCreativeTitle('');
      setCreativeLink('');
      setFallbackImageUrl('');
      setDesktopImageUrl('');
      setMobileImageUrl('');
      setLocalCreativeError(null);
      return;
    }

    const trimmedValue = creativeUriValue.trim();
    setCreativeUri(trimmedValue);

    if (trimmedValue.startsWith('data:application/json')) {
      try {
        const [, payload = ''] = trimmedValue.split(',', 2);
        if (payload) {
          const decoded = decodeURIComponent(payload);
          const parsed = JSON.parse(decoded) as {
            title?: string;
            linkUrl?: string;
            mediaUrl?: string;
            assets?: Record<string, string>;
          };
          setCreativeTitle(parsed.title ?? '');
          setCreativeLink(parsed.linkUrl ?? '');
          const desktop = parsed.assets?.desktop ?? parsed.mediaUrl ?? '';
          const mobile = parsed.assets?.mobile ?? '';
          const fallback = parsed.assets?.fallback ?? '';
          setDesktopImageUrl(desktop);
          setMobileImageUrl(mobile);
          setFallbackImageUrl(fallback);
          setLocalCreativeError(null);
          return;
        }
      } catch (error) {
        console.error('Failed to parse creative metadata:', error);
      }
    } else {
      setCreativeTitle('');
      setCreativeLink('');
      setFallbackImageUrl('');
      setMobileImageUrl('');
      setDesktopImageUrl(trimmedValue);
      setLocalCreativeError(null);
      return;
    }

    setCreativeTitle('');
    setCreativeLink('');
    setFallbackImageUrl('');
    setDesktopImageUrl(trimmedValue);
    setMobileImageUrl('');
    setLocalCreativeError(null);
  }, [creativeUriValue]);

  const isCreativeReady = useMemo(() => {
    if (!requireCreativeReady) {
      return true;
    }
    return (
      desktopImageUrl.trim().length > 0 && mobileImageUrl.trim().length > 0
    );
  }, [requireCreativeReady, desktopImageUrl, mobileImageUrl]);

  useEffect(() => {
    if (!requireCreativeReady || !isCreativeReady) {
      return;
    }

    const desktop = desktopImageUrl.trim();
    const mobile = mobileImageUrl.trim();
    const title = creativeTitle.trim();
    const link = creativeLink.trim();
    const fallback = fallbackImageUrl.trim();

    const assets: Record<string, string> = {
      desktop,
      mobile,
    };

    if (fallback) {
      assets.fallback = fallback;
    }

    const payload = {
      contentType: 'image',
      title,
      linkUrl: link,
      mediaUrl: desktop,
      assets,
    };

    const nextCreativeUri = `data:application/json,${encodeURIComponent(
      JSON.stringify(payload),
    )}`;

    setCreativeUri(nextCreativeUri);
    onCreativeUriChange?.(nextCreativeUri);
  }, [
    creativeLink,
    creativeTitle,
    desktopImageUrl,
    fallbackImageUrl,
    isCreativeReady,
    mobileImageUrl,
    onCreativeUriChange,
    requireCreativeReady,
  ]);

  useEffect(() => {
    if (requireCreativeReady && isCreativeReady) {
      setLocalCreativeError(null);
    }
  }, [isCreativeReady, requireCreativeReady]);

  const formattedCoverageLabel = `(${formatDaysLabel(selectedCoverageDays)})`;
  const coverageRangeStartLabel =
    coverage?.rangeStart ?? formatRangeBoundary(minCoverageDays);
  const coverageRangeEndLabel =
    coverage?.rangeEnd ?? formatRangeBoundary(maxCoverageDays);

  const handleCoverageSliderChange = useCallback(
    (value: number) => {
      const normalizedValue = snapToStep(
        value,
        minCoverageDays,
        maxCoverageDays,
        stepCoverageDays,
      );
      setSelectedCoverageDays(normalizedValue);
      coverage?.onChange?.(normalizedValue);
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
      coverage?.onChangeEnd?.(normalizedValue);
    },
    [coverage, minCoverageDays, maxCoverageDays, stepCoverageDays],
  );

  const combinedError =
    (allowCreativeEditing ? localCreativeError : null) ?? errorMessage ?? null;

  const handlePrimaryAction = useCallback(() => {
    if (requireCreativeReady && !isCreativeReady) {
      setLocalCreativeError(
        'Upload both desktop and mobile creatives before continuing.',
      );
      return;
    }

    setLocalCreativeError(null);

    if (allowCreativeEditing && creativeUri) {
      onCreativeUriChange?.(creativeUri);
    }

    onSubmit?.();
  }, [
    allowCreativeEditing,
    creativeUri,
    isCreativeReady,
    onCreativeUriChange,
    onSubmit,
    requireCreativeReady,
  ]);

  const cancelLabel = isViewMode ? 'Close' : 'Cancel';
  const showCoverageSection = isTakeoverMode && Boolean(coverage);
  const showValuationSection = isTakeoverMode && Boolean(valuation);
  const showBreakdownSection = isTakeoverMode && Boolean(breakdown);
  const showHarbergerInfo = isTakeoverMode && Boolean(harbergerInfo);
  const showCtaButton = Boolean(ctaLabel && onSubmit);

  const creativeDescription = isViewMode
    ? CREATIVE_GUIDANCE.viewDescription
    : CREATIVE_GUIDANCE.combinedDescription(
        MOBILE_CREATIVE_CONFIG.ratioLabel,
        DESKTOP_CREATIVE_CONFIG.labelSuffix,
      );

  const desktopPlaceholderLabel = allowCreativeEditing
    ? 'Click to upload desktop asset'
    : 'Desktop creative asset';
  const mobilePlaceholderLabel = allowCreativeEditing
    ? 'Click to upload mobile asset'
    : 'Mobile creative asset';

  const creativeInputDisabled = !allowCreativeEditing || isSubmitting;
  const textInputDisabled = !allowCreativeEditing || isSubmitting;

  const ctaDisabled =
    showCtaButton &&
    (Boolean(isCtaDisabled) ||
      isSubmitting ||
      (requireCreativeReady && !isCreativeReady));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px]]',
        body: 'max-h-[80vh] overflow-y-scroll',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-[20px] py-[10px]">
              <div className="flex flex-col">
                <ECFTypography type="subtitle2" className="text-[18px]">
                  {contextLabel}
                </ECFTypography>
                <span
                  className={cn(
                    'text-[12px]',
                    contextTone === 'danger'
                      ? 'text-[#D92D20]'
                      : 'text-black/40',
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              <Button
                isIconOnly
                radius="sm"
                className="size-[32px] rounded-[8px] p-0 text-black/50 hover:bg-black/10"
                onPress={onClose}
                isDisabled={isSubmitting}
              >
                <XIcon size={16} />
              </Button>
            </div>

            <ModalBody className="mobile:p-[10px] flex flex-col gap-[20px] p-[20px]">
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <div className="flex flex-wrap items-center gap-[10px]">
                  <span className="text-[13px] font-semibold text-black/50">
                    Slot:
                  </span>
                  <span className="text-[13px] font-semibold text-black">
                    {displayName}
                  </span>
                </div>
                <ValueLabel className="text-[12px]">{statusLabel}</ValueLabel>
              </div>

              <div className="grid grid-cols-1 gap-[8px] rounded-[10px] border border-black/10 bg-white p-[10px] md:grid-cols-3">
                <InfoStat
                  label={ownerLabel}
                  value={owner}
                  labelType={'light'}
                />
                <InfoStat
                  label={taxRateLabel}
                  value={taxRate}
                  labelType={'light'}
                />
                <InfoStat
                  label={minBidLabel}
                  value={minBidValue}
                  labelType={'dark'}
                  tooltip={minBidHelper}
                />
              </div>

              {showValuationSection && valuation ? (
                <div className="flex flex-col gap-[10px]">
                  <LabelWithInfo label="Set New Valuation (ETH)" />
                  <div className="flex flex-col gap-[5px]">
                    <Input
                      placeholder={valuation.placeholder}
                      value={valuation.value ?? ''}
                      onValueChange={valuation.onChange}
                      isInvalid={!!valuation.errorMessage}
                      isDisabled={valuation.isDisabled}
                      aria-label="Set new valuation"
                      readOnly={valuation.isDisabled}
                    />
                    <span className="font-inter text-[13px] font-[400] text-black/80">
                      Must be at least 10.0% higher than current valuation
                    </span>
                  </div>
                </div>
              ) : null}

              {showCoverageSection ? (
                <div className="flex flex-col gap-[10px]">
                  <div className="flex flex-col gap-[5px]">
                    <LabelWithInfo
                      label={`Tax Coverage ${formattedCoverageLabel}`}
                    />
                    <span className="text-[13px] text-black/80">
                      Choose how many tax periods to prepay. Longer coverage
                      means higher upfront cost but no need to pay taxes
                      frequently. (1 tax period = 24 hours / 86400 seconds)
                    </span>
                  </div>
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
              ) : null}

              {showBreakdownSection && breakdown ? (
                <div className="space-y-[8px] rounded-[10px] border border-black/10 bg-[#FCFCFC] p-[10px]">
                  <div className="flex items-center justify-center gap-[8px] text-[14px] leading-[20px] text-black">
                    <TrendUp size={20} weight="bold" />
                    <span>Bonding Cost Breakdown:</span>
                  </div>

                  <BreakdownRow
                    label={breakdown.bondRateLabel}
                    value={breakdown.bondRateValue}
                    valueLabelType="light"
                  />
                  <BreakdownRow
                    label={breakdown.taxLabel}
                    value={breakdown.taxValue}
                    valueLabelType="light"
                  />
                  <BreakdownRow
                    label={breakdown.coverageLabel}
                    value={breakdown.coverageValue}
                    valueLabelType="pureText"
                    className="opacity-50"
                  />

                  <div className="flex items-center justify-between border-t border-black/10 pt-[8px]">
                    <div className="flex items-center gap-[6px] text-[14px] text-black/80">
                      <span>{breakdown.totalLabel}</span>
                      <InfoIcon size={16} />
                    </div>
                    <span className="text-[16px] font-semibold text-[#3CBF91]">
                      {breakdown.totalValue}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-[16px] rounded-[10px] border border-black/10 bg-[#FCFCFC] p-[12px]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[14px] font-semibold text-black/80">
                    Creative Assets
                  </span>
                  <span className="text-[12px] leading-[18px] text-black/50">
                    {creativeDescription}
                  </span>
                </div>

                <div className="flex flex-col gap-[12px]">
                  <span className="text-[13px] font-semibold text-black/70">
                    {`Desktop Creative (${DESKTOP_CREATIVE_CONFIG.labelSuffix})`}
                  </span>
                  <CreativePhotoUpload
                    initialUrl={desktopImageUrl || undefined}
                    onUploadSuccess={(url) => {
                      setDesktopImageUrl(url);
                      setLocalCreativeError(null);
                    }}
                    isDisabled={creativeInputDisabled}
                    cropAspectRatio={DESKTOP_CREATIVE_CONFIG.aspectRatio}
                    cropMaxWidth={DESKTOP_CREATIVE_CONFIG.maxWidth}
                    cropMaxHeight={DESKTOP_CREATIVE_CONFIG.maxHeight}
                    className={DESKTOP_CREATIVE_CONFIG.previewWidthClass}
                  >
                    <div
                      className={`${DESKTOP_CREATIVE_CONFIG.previewAspectClass} w-full overflow-hidden rounded-[10px] border border-dashed border-black/20 bg-[#F5F5F5]`}
                    >
                      {desktopImageUrl ? (
                        <img
                          src={desktopImageUrl}
                          alt="Desktop creative preview"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-[6px] text-center text-[13px] text-black/50">
                          <span>{desktopPlaceholderLabel}</span>
                          {allowCreativeEditing ? (
                            <span className="text-[11px] text-black/40">
                              {DESKTOP_CREATIVE_CONFIG.helperText}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </CreativePhotoUpload>
                  {allowCreativeEditing ? (
                    <span className="text-[11px] text-black/50">
                      Supports JPG, PNG, or GIF up to 10MB.
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-[12px]">
                  <span className="text-[13px] font-semibold text-black/70">
                    {`Mobile Creative (${MOBILE_CREATIVE_CONFIG.labelSuffix})`}
                  </span>
                  <CreativePhotoUpload
                    initialUrl={mobileImageUrl || undefined}
                    onUploadSuccess={(url) => {
                      setMobileImageUrl(url);
                      setLocalCreativeError(null);
                    }}
                    isDisabled={creativeInputDisabled}
                    cropAspectRatio={MOBILE_CREATIVE_CONFIG.aspectRatio}
                    cropMaxWidth={MOBILE_CREATIVE_CONFIG.maxWidth}
                    cropMaxHeight={MOBILE_CREATIVE_CONFIG.maxHeight}
                    className={MOBILE_CREATIVE_CONFIG.previewWidthClass}
                  >
                    <div
                      className={`${MOBILE_CREATIVE_CONFIG.previewAspectClass} w-full overflow-hidden rounded-[10px] border border-dashed border-black/20 bg-[#F5F5F5]`}
                    >
                      {mobileImageUrl ? (
                        <img
                          src={mobileImageUrl}
                          alt="Mobile creative preview"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-[6px] text-center text-[13px] text-black/50">
                          <span>{mobilePlaceholderLabel}</span>
                          {allowCreativeEditing ? (
                            <span className="text-[11px] text-black/40">
                              {MOBILE_CREATIVE_CONFIG.helperText}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </CreativePhotoUpload>
                  {allowCreativeEditing ? (
                    <span className="text-[11px] text-black/50">
                      The mobile asset is cropped to a{' '}
                      {MOBILE_CREATIVE_CONFIG.ratioLabel} ratio for responsive
                      layouts.
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-[8px]">
                  <span className="text-[13px] font-semibold text-black/70">
                    Target Link
                  </span>
                  <Input
                    placeholder="https://"
                    value={creativeLink}
                    onValueChange={(value) => {
                      setCreativeLink(value);
                      setLocalCreativeError(null);
                    }}
                    isDisabled={textInputDisabled}
                    aria-label="Creative target link"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <span className="text-[13px] font-semibold text-black/70">
                    Title (Optional)
                  </span>
                  <Input
                    placeholder="Creative title"
                    value={creativeTitle}
                    onValueChange={(value) => {
                      setCreativeTitle(value);
                      setLocalCreativeError(null);
                    }}
                    isDisabled={textInputDisabled}
                    aria-label="Creative title"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <span className="text-[13px] font-semibold text-black/70">
                    Fallback Image URL (Optional)
                  </span>
                  <Input
                    placeholder="https:// or ipfs://"
                    value={fallbackImageUrl}
                    onValueChange={(value) => {
                      setFallbackImageUrl(value);
                      setLocalCreativeError(null);
                    }}
                    isDisabled={textInputDisabled}
                    aria-label="Fallback image URL"
                  />
                </div>
              </div>

              {showHarbergerInfo ? (
                <div className="flex flex-col gap-[10px]">
                  <span className="text-[14px] font-semibold text-black/80">
                    How Harberger Tax Works:
                  </span>
                  <span className="text-[13px] leading-[18px] text-black/50">
                    {harbergerInfo}
                  </span>
                </div>
              ) : null}

              {combinedError ? (
                <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                  {combinedError}
                </div>
              ) : null}

              <div className="flex items-center gap-[10px]">
                <Button
                  color="secondary"
                  className="h-[40px] w-[90px] rounded-[5px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  {cancelLabel}
                </Button>
                {showCtaButton ? (
                  <Button
                    color="primary"
                    className="h-[40px] flex-1 rounded-[5px] bg-black text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
                    isDisabled={ctaDisabled}
                    isLoading={Boolean(isSubmitting)}
                    onPress={handlePrimaryAction}
                  >
                    {isTakeoverMode ? <CoinVertical size={24} /> : null}
                    {ctaLabel}
                  </Button>
                ) : null}
              </div>
            </ModalBody>
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
  labelType = 'light',
  tooltip,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  labelType: IValueLabelType;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-[6px]">
      <div className="flex items-center justify-start gap-[5px]">
        <span className="font-sans text-[14px] text-black/80">{label}:</span>
        {tooltip ? (
          <Tooltip content={tooltip}>
            <span className="flex items-center opacity-30">
              <InfoIcon size={20} />
            </span>
          </Tooltip>
        ) : null}
      </div>

      <ValueLabel valueLabelType={labelType}>{value}</ValueLabel>
    </div>
  );
}

function LabelWithInfo({
  label,
  tooltip,
  classNames = {},
}: {
  label: string;
  tooltip?: string;
  classNames?: Partial<
    Record<'container' | 'label' | 'icon' | 'tooltip', string>
  >;
}) {
  return (
    <div
      className={cn('flex items-center gap-[6px]', classNames?.container ?? '')}
    >
      <span
        className={cn(
          'text-[16px] font-semibold font-inter leading-[1.6]',
          classNames?.label ?? '',
        )}
      >
        {label}
      </span>
      <Tooltip
        content={tooltip ?? label}
        className={cn(classNames?.tooltip ?? '')}
      >
        <span
          className={cn('flex items-center opacity-50', classNames?.icon ?? '')}
        >
          <InfoIcon size={20} />
        </span>
      </Tooltip>
    </div>
  );
}

export function CoverageSlider({
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
