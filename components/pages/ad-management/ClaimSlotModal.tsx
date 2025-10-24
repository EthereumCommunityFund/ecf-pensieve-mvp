'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseEther } from 'viem';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, ShowMetricsIcon, XIcon } from '@/components/icons';
import type { VacantSlotData } from '@/hooks/useHarbergerSlots';
import {
  ZERO_BIGINT,
  calculateBond,
  calculateTaxForPeriods,
  formatEth,
} from '@/utils/harberger';

interface ClaimPayload {
  valuationWei: bigint;
  taxPeriods: bigint;
  creativeUri: string;
  metadata: {
    contentType: string;
    title: string;
    linkUrl: string;
    mediaUrl: string;
  };
}

type ClaimStep = 1 | 2;

const CONTENT_TYPE_OPTIONS = [
  { key: 'image', label: 'Image' },
  { key: 'html', label: 'HTML Embed' },
  { key: 'video', label: 'Video' },
];

interface ClaimSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: VacantSlotData | null;
  statusLabel?: string;
  valuationDefault: string;
  valuationMinimumLabel: string;
  coverageHint: string;
  onSubmit: (payload: ClaimPayload) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export default function ClaimSlotModal({
  isOpen,
  onClose,
  slot,
  statusLabel = 'Open',
  valuationDefault,
  valuationMinimumLabel,
  coverageHint,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: ClaimSlotModalProps) {
  const [step, setStep] = useState<ClaimStep>(1);
  const [valuationInput, setValuationInput] = useState(valuationDefault);
  const [selectedCoverageKey, setSelectedCoverageKey] = useState<string>('1');
  const [contentType, setContentType] = useState<string>(
    CONTENT_TYPE_OPTIONS[0].key,
  );
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setValuationInput(valuationDefault);
      setSelectedCoverageKey('1');
      setContentType(CONTENT_TYPE_OPTIONS[0].key);
      setTitle('');
      setLinkUrl('');
      setMediaUrl('');
      setLocalError(null);
    }
  }, [isOpen, valuationDefault]);

  const coverageOptions = useMemo(() => {
    if (!slot) {
      return [] as Array<{
        key: string;
        label: string;
        periods: bigint;
      }>;
    }

    const presets = [1, 7, 14, 30, 90, 182, 365];
    return presets.map((days) => {
      const periods = BigInt(days);
      const label = days === 1 ? '1day' : `${days}days`;
      return {
        key: days.toString(),
        label,
        periods,
      };
    });
  }, [slot]);

  const selectedCoverage = useMemo(() => {
    return (
      coverageOptions.find((option) => option.key === selectedCoverageKey) ??
      coverageOptions[0]
    );
  }, [coverageOptions, selectedCoverageKey]);

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
    if (!slot || !parsedValuationWei || !selectedCoverage) {
      return ZERO_BIGINT;
    }
    return calculateTaxForPeriods(
      parsedValuationWei,
      slot.annualTaxRateBps,
      slot.taxPeriodInSeconds,
      selectedCoverage.periods,
    );
  }, [parsedValuationWei, selectedCoverage, slot]);

  const coverageLabel = useMemo(() => {
    if (!slot || !selectedCoverage) {
      return '—';
    }
    return selectedCoverage.label;
  }, [selectedCoverage, slot]);

  const totalValue = useMemo(
    () => bondRequired + taxRequired,
    [bondRequired, taxRequired],
  );

  const isStepOneValid = Boolean(
    slot &&
      parsedValuationWei &&
      parsedValuationWei >= slot.minValuationWei &&
      selectedCoverage,
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
      if (!isStepOneValid || !parsedValuationWei || !selectedCoverage) {
        setLocalError(
          'Enter a valuation above the minimum and select coverage.',
        );
        return;
      }
      setLocalError(null);
      setStep(2);
      return;
    }

    if (!parsedValuationWei || !selectedCoverage) {
      setLocalError('Unable to resolve valuation or coverage.');
      return;
    }

    const trimmedLink = linkUrl.trim();
    const trimmedMedia = mediaUrl.trim();
    const trimmedTitle = title.trim();

    let creativeUri = '';
    if (trimmedMedia) {
      creativeUri = trimmedMedia;
    } else if (trimmedLink) {
      creativeUri = trimmedLink;
    } else {
      const payload = {
        contentType,
        title: trimmedTitle,
        linkUrl: trimmedLink,
        mediaUrl: trimmedMedia,
      };
      creativeUri = `data:application/json,${encodeURIComponent(
        JSON.stringify(payload),
      )}`;
    }

    try {
      await onSubmit({
        valuationWei: parsedValuationWei,
        taxPeriods: selectedCoverage.periods,
        creativeUri,
        metadata: {
          contentType,
          title: trimmedTitle,
          linkUrl: trimmedLink,
          mediaUrl: trimmedMedia,
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
      taxLabel: `Tax (${selectedCoverage?.label ?? '—'})`,
      taxValue: formatEth(taxRequired),
      coverageLabel: 'Coverage',
      coverageValue: coverageLabel,
      totalLabel: 'Total Cost',
      totalValue: formatEth(totalValue),
    };
  }, [
    bondRequired,
    coverageLabel,
    selectedCoverage,
    slot,
    taxRequired,
    totalValue,
  ]);

  const combinedError = localError ?? errorMessage ?? null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      classNames={{
        base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px]',
      }}
      placement="center"
    >
      <ModalContent>
        {() => (
          <>
            <div className="flex flex-col gap-[6px] px-5 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ECFTypography type="subtitle2" className="text-[18px]">
                    Claim Slot
                  </ECFTypography>
                  <span className="rounded-[6px] border border-black/10 bg-[#F4F5F7] px-[8px] py-[2px] text-[12px] font-semibold uppercase tracking-[0.04em] text-black/70">
                    {statusLabel}
                  </span>
                </div>

                <Button
                  isIconOnly
                  radius="sm"
                  className="size-[32px] rounded-[8px] bg-black/5 p-0 text-black/50 hover:bg-black/10"
                  onPress={handleClose}
                  isDisabled={isSubmitting}
                >
                  <XIcon size={16} />
                </Button>
              </div>
            </div>

            <ModalBody className="flex flex-col gap-[20px] px-5 pb-0 pt-4">
              <div className="flex flex-col gap-[8px]">
                <span className="text-[13px] font-semibold text-black/50">
                  Slot:
                </span>
                <span className="text-[14px] font-semibold text-black">
                  {slot?.slotName ?? '—'}
                </span>
              </div>

              {step === 1 ? (
                <div className="flex flex-col gap-[20px]">
                  <div className="flex flex-col gap-[12px] rounded-[12px] border border-black/10 bg-[#FCFCFC] p-[16px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-[8px] text-[13px] font-semibold text-black/70">
                        <ShowMetricsIcon className="size-[18px] text-black/40" />
                        <span>Bonding Cost Breakdown:</span>
                      </div>
                      <InfoIcon size={18} />
                    </div>

                    <BreakdownRow
                      label={breakdownRows.bondRateLabel}
                      value={breakdownRows.bondRateValue}
                    />
                    <BreakdownRow
                      label={breakdownRows.taxLabel}
                      value={breakdownRows.taxValue}
                    />
                    <BreakdownRow
                      label={breakdownRows.coverageLabel}
                      value={breakdownRows.coverageValue}
                    />

                    <div className="flex items-center justify-between rounded-[8px] bg-black/[0.03] px-[12px] py-[10px]">
                      <div className="flex items-center gap-[6px] text-[13px] font-semibold text-black/80">
                        <span>{breakdownRows.totalLabel}</span>
                        <InfoIcon size={16} />
                      </div>
                      <span className="text-[14px] font-semibold text-[#0C7A32]">
                        {breakdownRows.totalValue}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Set Valuation (ETH)" />
                    <Input
                      value={valuationInput}
                      aria-label="Set valuation"
                      className="text-[16px] font-semibold"
                      onValueChange={setValuationInput}
                      isInvalid={Boolean(valuationInput) && !parsedValuationWei}
                      isDisabled={!slot}
                    />
                    <span className="text-[12px] text-black/50">
                      Min: {valuationMinimumLabel}
                    </span>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Tax Coverage" />
                    <span className="text-[12px] leading-[18px] text-black/60">
                      {coverageHint}
                    </span>
                    <Select
                      selectedKeys={
                        selectedCoverage ? [selectedCoverage.key] : []
                      }
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string | undefined;
                        if (key) {
                          setSelectedCoverageKey(key);
                        }
                      }}
                      className="w-full"
                      aria-label="Select tax coverage"
                      isDisabled={!slot}
                    >
                      {coverageOptions.map((option) => (
                        <SelectItem key={option.key}>{option.label}</SelectItem>
                      ))}
                    </Select>
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
                      className="w-full"
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
                    />
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Link URL" />
                    <Input
                      placeholder="https://"
                      aria-label="Link URL"
                      value={linkUrl}
                      onValueChange={setLinkUrl}
                    />
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <LabelWithInfo label="Media / Image URI" />
                    <Input
                      placeholder="https:// or ipfs://"
                      aria-label="Image reference"
                      value={mediaUrl}
                      onValueChange={setMediaUrl}
                    />
                    <span className="text-[12px] text-black/50">
                      Provide a direct asset link when available. If omitted,
                      metadata is embedded on-chain.
                    </span>
                  </div>
                </div>
              )}

              {combinedError ? (
                <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                  {combinedError}
                </div>
              ) : null}
            </ModalBody>

            <ModalFooter className="flex items-center gap-[12px] p-5">
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
                  step === 1 ? !isStepOneValid || !slot : isSubmitting
                }
                isLoading={isSubmitting}
              >
                {step === 1 ? 'Next' : 'Submit Claim'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
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
