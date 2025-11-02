'use client';

import { cn } from '@heroui/react';
import { TrendUp } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseEther } from 'viem';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Modal, ModalBody, ModalContent } from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, XIcon } from '@/components/icons';
import type { VacantSlotData } from '@/hooks/useHarbergerSlots';
import {
  ZERO_BIGINT,
  calculateBond,
  calculateTaxForPeriods,
  formatEth,
} from '@/utils/harberger';

import {
  DESKTOP_CREATIVE_CONFIG,
  MOBILE_CREATIVE_CONFIG,
} from './creativeConstants';
import CreativePhotoUpload from './CreativePhotoUpload';
import { CoverageSlider } from './TakeoverSlotModal';
import ValueLabel, { IValueLabelType } from './ValueLabel';

interface ClaimPayload {
  valuationWei: bigint;
  taxPeriods: bigint;
  creativeUri: string;
  metadata: {
    contentType: string;
    title: string;
    linkUrl: string;
    mediaUrl: string;
    desktopImageUrl: string;
    mobileImageUrl: string;
    assets?: Record<string, string>;
  };
}

type ClaimStep = 1 | 2;

const DEFAULT_CLAIM_COVERAGE_DAYS = 7;

const CONTENT_TYPE_OPTIONS = [
  { key: 'image', label: 'Image' },
  // { key: 'html', label: 'HTML Embed' },
  // { key: 'video', label: 'Video' },
];

interface ClaimSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: VacantSlotData | null;
  onSubmit: (payload: ClaimPayload) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export default function ClaimSlotModal({
  isOpen,
  onClose,
  slot,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: ClaimSlotModalProps) {
  const statusLabel = slot?.statusLabel ?? 'Open';
  const valuationDefault = slot?.valuationDefault ?? '0.00';
  const valuationMinimumLabel = slot?.valuationMinimum ?? '0 ETH';
  const coverageHint =
    slot?.coverageDescription ?? 'Select how many tax periods to prepay.';
  const [step, setStep] = useState<ClaimStep>(1);
  const [valuationInput, setValuationInput] = useState(valuationDefault);
  const [coverageSliderValue, setCoverageSliderValue] = useState<number>(
    DEFAULT_CLAIM_COVERAGE_DAYS,
  );
  const [contentType, setContentType] = useState<string>(
    CONTENT_TYPE_OPTIONS[0].key,
  );
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setValuationInput(valuationDefault);
      setCoverageSliderValue(DEFAULT_CLAIM_COVERAGE_DAYS);
      setContentType(CONTENT_TYPE_OPTIONS[0].key);
      setTitle('');
      setLinkUrl('');
      setMediaUrl('');
      setDesktopImageUrl('');
      setMobileImageUrl('');
      setLocalError(null);
    }
  }, [isOpen, valuationDefault]);

  useEffect(() => {
    if (!slot) {
      setCoverageSliderValue(1);
    }
  }, [slot]);

  const coveragePeriods = useMemo(() => {
    const normalized = Math.min(
      365,
      Math.max(1, Math.round(coverageSliderValue)),
    );
    return BigInt(normalized);
  }, [coverageSliderValue]);

  const coverageLabel = useMemo(() => {
    const days = Math.min(365, Math.max(1, Math.round(coverageSliderValue)));
    return `${days} day${days === 1 ? '' : 's'}`;
  }, [coverageSliderValue]);

  const handleCoverageSliderChange = useCallback((value: number) => {
    const normalized = Math.min(365, Math.max(1, Math.round(value)));
    setCoverageSliderValue(normalized);
  }, []);

  const parsedValuationWei = useMemo(() => {
    try {
      if (!valuationInput || valuationInput.trim().length === 0) {
        return null;
      }
      const value = parseEther(valuationInput.trim());
      return value;
    } catch (error) {
      return null;
    }
  }, [valuationInput]);

  const bondRequired = useMemo(() => {
    if (!slot || !parsedValuationWei) {
      return ZERO_BIGINT;
    }
    return calculateBond(parsedValuationWei, slot.bondRateBps);
  }, [parsedValuationWei, slot]);

  const taxRequired = useMemo(() => {
    if (!slot || !parsedValuationWei) {
      return ZERO_BIGINT;
    }
    return calculateTaxForPeriods(
      parsedValuationWei,
      slot.annualTaxRateBps,
      slot.taxPeriodInSeconds,
      coveragePeriods,
    );
  }, [coveragePeriods, parsedValuationWei, slot]);

  const totalValue = useMemo(
    () => bondRequired + taxRequired,
    [bondRequired, taxRequired],
  );

  const slotMetadataDisplayName =
    slot?.slotDisplayName ?? slot?.slotName ?? '—';

  const isStepOneValid = Boolean(
    slot &&
      parsedValuationWei &&
      parsedValuationWei >= slot.minValuationWei &&
      coveragePeriods >= BigInt(1),
  );

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    setStep(1);
    onClose();
  };

  const handleNext = async () => {
    if (!slot) {
      return;
    }

    if (step === 1) {
      if (!isStepOneValid || !parsedValuationWei) {
        setLocalError('Enter a valuation above the minimum.');
        return;
      }
      setLocalError(null);
      setStep(2);
      return;
    }

    if (!parsedValuationWei) {
      setLocalError('Unable to resolve valuation.');
      return;
    }

    const trimmedLink = linkUrl.trim();
    const trimmedMedia = mediaUrl.trim();
    const trimmedTitle = title.trim();
    const desktopAsset = desktopImageUrl.trim();
    const mobileAsset = mobileImageUrl.trim();

    if (!desktopAsset || !mobileAsset) {
      setLocalError(
        'Upload both desktop and mobile creatives before submitting.',
      );
      return;
    }

    const metadataAssets: Record<string, string> = {
      desktop: desktopAsset,
      mobile: mobileAsset,
    };

    if (trimmedMedia) {
      metadataAssets.fallback = trimmedMedia;
    }

    const metadataPayload = {
      contentType,
      title: trimmedTitle,
      linkUrl: trimmedLink,
      mediaUrl: desktopAsset,
      assets: metadataAssets,
    };

    const creativeUri = `data:application/json,${encodeURIComponent(
      JSON.stringify(metadataPayload),
    )}`;

    try {
      await onSubmit({
        valuationWei: parsedValuationWei,
        taxPeriods: coveragePeriods,
        creativeUri,
        metadata: {
          contentType,
          title: trimmedTitle,
          linkUrl: trimmedLink,
          mediaUrl: desktopAsset,
          desktopImageUrl: desktopAsset,
          mobileImageUrl: mobileAsset,
          assets: metadataAssets,
        },
      });
      setLocalError(null);
      handleClose();
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Failed to submit claim.',
      );
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setLocalError(null);
    }
  };

  const breakdownRows = useMemo(() => {
    if (!slot) {
      return {
        bondRateLabel: 'Bond Rate',
        bondRateValue: '—',
        taxLabel: 'Tax',
        taxValue: '—',
        coverageLabel: 'Coverage',
        coverageValue: coverageLabel,
        totalLabel: 'Total Cost',
        totalValue: '—',
      };
    }

    return {
      bondRateLabel: `Bond Rate (${slot.bondRate})`,
      bondRateValue: formatEth(bondRequired),
      taxLabel: `Tax (${coverageLabel})`,
      taxValue: formatEth(taxRequired),
      coverageLabel: 'Coverage',
      coverageValue: coverageLabel,
      totalLabel: 'Total Cost',
      totalValue: formatEth(totalValue),
    };
  }, [bondRequired, coverageLabel, slot, taxRequired, totalValue]);

  const combinedError = localError ?? errorMessage ?? null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      classNames={{
        base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px]',
        body: 'max-h-[calc(80vh)] overflow-y-scroll',
      }}
      placement="center"
    >
      <ModalContent>
        {() => (
          <>
            {/* header */}
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-[20px] py-[10px]">
              <div className="flex items-center gap-3 ">
                <ECFTypography type="subtitle2" className="text-[18px]">
                  Claim Slot
                </ECFTypography>
                {/* <span className="rounded-[6px] border border-black/10 bg-[#F4F5F7] px-[8px] py-[2px] text-[12px] font-semibold uppercase tracking-[0.04em] text-black/70">
                  {statusLabel}
                </span> */}
              </div>

              <Button
                isIconOnly
                radius="sm"
                className="size-[32px] rounded-[8px] bg-transparent  p-0 text-black/50 hover:bg-black/10"
                onPress={handleClose}
                isDisabled={isSubmitting}
              >
                <XIcon size={16} />
              </Button>
            </div>

            <ModalBody className="mobile:p-[10px] flex flex-col gap-[20px] p-[20px]">
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[13px] font-semibold text-black/50">
                    Slot:
                  </span>
                  <span className="text-[14px] font-semibold text-black">
                    {slotMetadataDisplayName}
                  </span>
                </div>

                <ValueLabel className="text-[12px]">{statusLabel}</ValueLabel>
              </div>

              {step === 1 ? (
                <div className="space-y-[20px]">
                  <div className="space-y-[8px] rounded-[10px] border border-black/10 bg-[#FCFCFC] p-[10px]">
                    <div className="flex items-center justify-center gap-[8px] text-[14px] leading-[20px] text-black">
                      <TrendUp size={20} weight="bold" />
                      <span>Bonding Cost Breakdown:</span>
                    </div>

                    <BreakdownRow
                      label={breakdownRows.bondRateLabel}
                      value={breakdownRows.bondRateValue}
                      valueLabelType="light"
                    />
                    <BreakdownRow
                      label={breakdownRows.taxLabel}
                      value={breakdownRows.taxValue}
                      valueLabelType="light"
                    />
                    <BreakdownRow
                      label={breakdownRows.coverageLabel}
                      value={breakdownRows.coverageValue}
                      valueLabelType="pureText"
                      className="opacity-50"
                    />

                    <div className="flex items-center justify-between rounded-[8px] border-t border-black/10 pt-[8px]">
                      <div className="flex items-center gap-[6px] text-[14px] text-black/80">
                        <span>{breakdownRows.totalLabel}</span>
                        <InfoIcon size={16} />
                      </div>
                      <span className="text-[16px] font-semibold text-[#3CBF91]">
                        {breakdownRows.totalValue}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <LabelWithInfo label="Set Valuation (ETH)" />
                    <Input
                      value={valuationInput}
                      aria-label="Set valuation"
                      className="mb-[5px] mt-[10px] bg-[#F5F5F5] text-[16px] font-semibold"
                      onValueChange={setValuationInput}
                      isInvalid={Boolean(valuationInput) && !parsedValuationWei}
                      isDisabled={!slot}
                    />
                    <span className="text-[13px] text-black/80">
                      Min: {valuationMinimumLabel}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <LabelWithInfo
                      label={`Tax Coverage (${coverageSliderValue} Days)`}
                    />
                    <span className="mt-[5px] text-[13px] leading-[18px] text-black/80">
                      Choose how many tax periods to prepay. Longer coverage
                      means higher upfront cost but no need to pay taxes
                      frequently.{' '}
                      <strong>
                        (1 tax period = 24 hours / 620000 seconds)
                      </strong>
                    </span>
                    <div className="mt-[10px]">
                      <CoverageSlider
                        value={coverageSliderValue}
                        min={1}
                        max={365}
                        step={1}
                        rangeStart="1 day"
                        rangeEnd="365 days"
                        onChange={handleCoverageSliderChange}
                        onChangeEnd={handleCoverageSliderChange}
                      />
                    </div>
                    {/* <span className="mt-[6px] text-[12px] text-black/60">
                      Selected: {coverageLabel}
                    </span> */}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-[20px]">
                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Content Type" />
                    <Select
                      selectedKeys={[contentType]}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string | undefined;
                        if (key) {
                          setContentType(key);
                        }
                      }}
                      className="w-full bg-[#F5F5F5]"
                      aria-label="Select content type"
                    >
                      {CONTENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.key}>{option.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Title" />
                    <Input
                      placeholder="type here"
                      aria-label="Slot title"
                      value={title}
                      onValueChange={setTitle}
                      className="bg-[#F5F5F5]"
                    />
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Link URL" />
                    <Input
                      placeholder="https://"
                      aria-label="Link URL"
                      value={linkUrl}
                      onValueChange={setLinkUrl}
                      className="bg-[#F5F5F5]"
                    />
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo
                      label={`Desktop Creative (${DESKTOP_CREATIVE_CONFIG.labelSuffix})`}
                    />
                    <CreativePhotoUpload
                      initialUrl={desktopImageUrl || undefined}
                      onUploadSuccess={(url) => {
                        setDesktopImageUrl(url);
                        setLocalError(null);
                      }}
                      isDisabled={isSubmitting}
                      cropAspectRatio={DESKTOP_CREATIVE_CONFIG.aspectRatio}
                      cropMaxWidth={DESKTOP_CREATIVE_CONFIG.maxWidth}
                      cropMaxHeight={DESKTOP_CREATIVE_CONFIG.maxHeight}
                      className={DESKTOP_CREATIVE_CONFIG.previewWidthClass}
                    >
                      <div
                        className={`${DESKTOP_CREATIVE_CONFIG.previewAspectClass} w-full overflow-hidden rounded-[12px] border border-dashed border-black/20 bg-[#F5F5F5]`}
                      >
                        {desktopImageUrl ? (
                          <img
                            src={desktopImageUrl}
                            alt="Desktop creative preview"
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full flex-col items-center justify-center gap-[6px] text-center text-[13px] text-black/50">
                            <span>Click to upload desktop asset</span>
                            <span className="text-[12px] text-black/40">
                              {DESKTOP_CREATIVE_CONFIG.helperText}
                            </span>
                          </div>
                        )}
                      </div>
                    </CreativePhotoUpload>
                    <span className="text-[12px] text-black/50">
                      The asset will be cropped to a{' '}
                      {DESKTOP_CREATIVE_CONFIG.ratioLabel} ratio automatically;
                      click again to replace it.
                    </span>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo
                      label={`Mobile Creative (${MOBILE_CREATIVE_CONFIG.labelSuffix})`}
                    />
                    <CreativePhotoUpload
                      initialUrl={mobileImageUrl || undefined}
                      onUploadSuccess={(url) => {
                        setMobileImageUrl(url);
                        setLocalError(null);
                      }}
                      isDisabled={isSubmitting}
                      cropAspectRatio={MOBILE_CREATIVE_CONFIG.aspectRatio}
                      cropMaxWidth={MOBILE_CREATIVE_CONFIG.maxWidth}
                      cropMaxHeight={MOBILE_CREATIVE_CONFIG.maxHeight}
                      className={MOBILE_CREATIVE_CONFIG.previewWidthClass}
                    >
                      <div
                        className={`${MOBILE_CREATIVE_CONFIG.previewAspectClass} w-full overflow-hidden rounded-[12px] border border-dashed border-black/20 bg-[#F5F5F5]`}
                      >
                        {mobileImageUrl ? (
                          <img
                            src={mobileImageUrl}
                            alt="Mobile creative preview"
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full flex-col items-center justify-center gap-[6px] text-center text-[13px] text-black/50">
                            <span>Click to upload mobile asset</span>
                            <span className="text-[12px] text-black/40">
                              {MOBILE_CREATIVE_CONFIG.helperText}
                            </span>
                          </div>
                        )}
                      </div>
                    </CreativePhotoUpload>
                    <span className="text-[12px] text-black/50">
                      The mobile asset will be cropped to a{' '}
                      {MOBILE_CREATIVE_CONFIG.ratioLabel} ratio for responsive
                      layouts.
                    </span>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Fallback Image URL (Optional)" />
                    <Input
                      placeholder="https:// or ipfs://"
                      aria-label="Fallback image reference"
                      value={mediaUrl}
                      onValueChange={setMediaUrl}
                      className="bg-[#F5F5F5]"
                    />
                    <span className="text-[12px] text-black/50">
                      Provide an optional external asset link if you host
                      creatives elsewhere.
                    </span>
                  </div>
                </div>
              )}

              {combinedError ? (
                <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                  {combinedError}
                </div>
              ) : null}

              {/* footer */}
              <div className="flex items-center gap-[12px]">
                <Button
                  color="secondary"
                  className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                  onPress={step === 1 ? handleClose : handleBack}
                  isDisabled={isSubmitting}
                >
                  {step === 1 ? 'Close' : 'Back'}
                </Button>
                <Button
                  color="primary"
                  className="h-[40px] flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white hover:bg-black/90"
                  onPress={handleNext}
                  isDisabled={
                    step === 1
                      ? !isStepOneValid || !slot
                      : isSubmitting ||
                        desktopImageUrl.trim().length === 0 ||
                        mobileImageUrl.trim().length === 0
                  }
                  isLoading={isSubmitting}
                >
                  {step === 1 ? 'Next(1)' : 'Submit Claim'}
                </Button>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function LabelWithInfo({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[8px]">
      <span className="text-[16px] font-semibold leading-[1.6] text-black">
        {label}
      </span>
      <InfoIcon size={20} />
    </div>
  );
}

export function BreakdownRow({
  label,
  value,
  valueLabelType,
  className = '',
}: {
  label: string;
  value: string;
  valueLabelType: IValueLabelType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between text-[13px] text-black/70 last:border-b-0 last:pb-0',
        className,
      )}
    >
      <div className="flex items-center gap-[6px]">
        <span>{label}</span>
        <InfoIcon size={16} />
      </div>
      <ValueLabel valueLabelType={valueLabelType}>{value}</ValueLabel>
    </div>
  );
}
