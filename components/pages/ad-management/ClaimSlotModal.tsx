'use client';

import { cn, Drawer, DrawerBody, DrawerContent, Tooltip } from '@heroui/react';
import { TrendUp } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseEther } from 'viem';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Modal, ModalContent } from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, XIcon } from '@/components/icons';
import type { VacantSlotData } from '@/hooks/useHarbergerSlots';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  calculateBond,
  calculateTaxForPeriods,
  formatEth,
  ZERO_BIGINT,
} from '@/utils/harberger';

import { DEFAULT_CLAIM_COVERAGE_DAYS } from './constants';
import {
  DEFAULT_CREATIVE_UPLOAD_CONFIG,
  resolveCreativeUploadConfigs,
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
const MOBILE_MAX_WIDTH_PX = 809;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

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
  const isMobileViewport = useMediaQuery(MOBILE_MEDIA_QUERY);
  const isModalOpen = isOpen && !isMobileViewport;
  const isDrawerOpen = isOpen && isMobileViewport;
  const creativeUploadConfigs = useMemo(() => {
    if (!slot?.creativeConfig) {
      return DEFAULT_CREATIVE_UPLOAD_CONFIG;
    }
    return resolveCreativeUploadConfigs(slot.creativeConfig);
  }, [slot?.creativeConfig]);

  const desktopCreativeConfig = creativeUploadConfigs.desktop;
  const mobileCreativeConfig = creativeUploadConfigs.mobile;
  const desktopAspectRatio = `${desktopCreativeConfig.width} / ${desktopCreativeConfig.height}`;
  const mobileAspectRatio = `${mobileCreativeConfig.width} / ${mobileCreativeConfig.height}`;

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
      handleModalClose();
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

  const handleModalClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setStep(1);
    onClose();
  }, [isSubmitting, onClose]);

  const breakdownRows = useMemo(() => {
    const defaults = {
      bondRateLabel: 'Bond Rate',
      bondRateValue: '—',
      bondRateHelper:
        'Portion of the valuation locked as collateral when you claim the slot.',
      taxLabel: 'Tax',
      taxValue: '—',
      taxHelper: 'Upfront tax payment covering the selected number of periods.',
      coverageLabel: 'Coverage',
      coverageValue: coverageLabel,
      coverageHelper:
        'Duration that your prepaid tax covers before renewal is required.',
      totalLabel: 'Total Cost',
      totalValue: '—',
      totalHelper: 'Combined ETH required now, including bond and prepaid tax.',
    };

    if (!slot) {
      return defaults;
    }

    return {
      ...defaults,
      bondRateLabel: `Bond Rate (${slot.bondRate})`,
      bondRateValue: formatEth(bondRequired),
      taxLabel: `Tax (${coverageLabel})`,
      taxValue: formatEth(taxRequired),
      totalValue: formatEth(totalValue),
    };
  }, [bondRequired, coverageLabel, slot, taxRequired, totalValue]);

  const combinedError = localError ?? errorMessage ?? null;

  const renderOverlayContent = useCallback(
    (close: () => void, variant: 'modal' | 'drawer') => {
      const handleOverlayClose = () => {
        if (isSubmitting) {
          return;
        }

        if (variant === 'drawer') {
          setStep(1);
          close();
          return;
        }

        handleModalClose();
      };

      return (
        <div className="flex max-h-[80vh] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-[20px] py-[10px]">
            <div className="flex items-center gap-3 ">
              <ECFTypography type="subtitle2" className="text-[18px]">
                Claim Slot
              </ECFTypography>
            </div>

            <Button
              isIconOnly
              radius="sm"
              className="size-[32px] rounded-[8px] bg-transparent  p-0 text-black/50 hover:bg-black/10"
              onPress={handleOverlayClose}
              isDisabled={isSubmitting}
            >
              <XIcon size={16} />
            </Button>
          </div>

          <div
            className={cn(
              'flex flex-1 flex-col gap-[20px] overflow-y-auto p-[20px]',
              'mobile:p-[10px]',
              variant === 'drawer' ? 'pb-[32px]' : '',
            )}
          >
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
                    helperText={breakdownRows.bondRateHelper}
                    value={breakdownRows.bondRateValue}
                    valueLabelType="light"
                  />
                  <BreakdownRow
                    label={breakdownRows.taxLabel}
                    helperText={breakdownRows.taxHelper}
                    value={breakdownRows.taxValue}
                    valueLabelType="light"
                  />
                  <BreakdownRow
                    label={breakdownRows.coverageLabel}
                    helperText={breakdownRows.coverageHelper}
                    value={breakdownRows.coverageValue}
                    valueLabelType="pureText"
                    className="opacity-50"
                  />

                  <div className="flex items-center justify-between border-t border-black/10 pt-[8px]">
                    <div className="flex items-center gap-[6px] text-[14px] text-black/80">
                      <span>{breakdownRows.totalLabel}</span>
                      <Tooltip content={breakdownRows.totalHelper}>
                        <span className="flex items-center opacity-60">
                          <InfoIcon size={16} />
                        </span>
                      </Tooltip>
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
                    Choose how many tax periods to prepay. Longer coverage means
                    higher upfront cost but no need to pay taxes frequently.{' '}
                    <strong>(1 tax period = 24 hours / 620000 seconds)</strong>
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
                    label={`Desktop Creative (${desktopCreativeConfig.label})`}
                  />
                  <CreativePhotoUpload
                    initialUrl={desktopImageUrl || undefined}
                    onUploadSuccess={(url) => {
                      setDesktopImageUrl(url);
                      setLocalError(null);
                    }}
                    isDisabled={isSubmitting}
                    cropAspectRatio={desktopCreativeConfig.aspectRatio}
                    cropMaxWidth={desktopCreativeConfig.width}
                    cropMaxHeight={desktopCreativeConfig.height}
                    className="mobile:w-[80vw] w-[429px] overflow-hidden rounded-[10px]"
                  >
                    <div
                      className="mobile:w-[80vw] w-[429px] overflow-hidden rounded-[10px] border border-dashed border-black/20 bg-[#F5F5F5]"
                      style={{ aspectRatio: desktopAspectRatio }}
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
                            {desktopCreativeConfig.helperText}
                          </span>
                        </div>
                      )}
                    </div>
                  </CreativePhotoUpload>
                  {/* <span className="text-[12px] text-black/50">
                  The asset will be cropped to a {desktopCreativeConfig.ratioLabel}{' '}
                  ratio automatically; click again to replace it.
                </span> */}
                </div>

                <div className="flex flex-col gap-[12px]">
                  <LabelWithInfo
                    label={`Mobile Creative (${mobileCreativeConfig.label})`}
                  />
                  <CreativePhotoUpload
                    initialUrl={mobileImageUrl || undefined}
                    onUploadSuccess={(url) => {
                      setMobileImageUrl(url);
                      setLocalError(null);
                    }}
                    isDisabled={isSubmitting}
                    cropAspectRatio={mobileCreativeConfig.aspectRatio}
                    cropMaxWidth={mobileCreativeConfig.width}
                    cropMaxHeight={mobileCreativeConfig.height}
                    className="mobile:w-[60vw] w-[317px] overflow-hidden rounded-[10px]"
                  >
                    <div
                      className="mobile:w-[60vw] w-[317px] overflow-hidden rounded-[10px] border border-dashed border-black/20 bg-[#F5F5F5]"
                      style={{ aspectRatio: mobileAspectRatio }}
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
                            {mobileCreativeConfig.helperText}
                          </span>
                        </div>
                      )}
                    </div>
                  </CreativePhotoUpload>
                  {/* <span className="text-[12px] text-black/50">
                  The mobile asset will be cropped to a{' '}
                  {mobileCreativeConfig.ratioLabel} ratio for responsive layouts.
                </span> */}
                </div>

                {/* <div className="flex flex-col gap-[12px]">
                <LabelWithInfo label="Fallback Image URL (Optional)" />
                <Input
                  placeholder="https:// or ipfs://"
                  aria-label="Fallback image reference"
                  value={mediaUrl}
                  onValueChange={setMediaUrl}
                  className="bg-[#F5F5F5]"
                />
                <span className="text-[12px] text-black/50">
                  Provide an optional external asset link if you host creatives elsewhere.
                </span>
              </div> */}
              </div>
            )}

            {combinedError ? (
              <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                {combinedError}
              </div>
            ) : null}

            <div className="flex items-center gap-[12px]">
              <Button
                color="secondary"
                className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                onPress={step === 1 ? handleOverlayClose : handleBack}
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
                {step === 1 ? 'Next' : 'Submit Claim'}
              </Button>
            </div>
          </div>
        </div>
      );
    },
    [
      breakdownRows,
      combinedError,
      coverageSliderValue,
      contentType,
      desktopAspectRatio,
      desktopCreativeConfig,
      desktopImageUrl,
      handleBack,
      handleCoverageSliderChange,
      handleModalClose,
      handleNext,
      isStepOneValid,
      isSubmitting,
      linkUrl,
      mediaUrl,
      mobileAspectRatio,
      mobileCreativeConfig,
      mobileImageUrl,
      parsedValuationWei,
      slot,
      slotMetadataDisplayName,
      statusLabel,
      step,
      title,
      valuationInput,
      valuationMinimumLabel,
    ],
  );

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        classNames={{
          wrapper: 'mobile:hidden flex',
          base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px] max-h-[80vh] flex flex-col',
          body: 'flex-1 overflow-hidden p-0',
        }}
        placement="center"
      >
        <ModalContent>
          {() => renderOverlayContent(handleModalClose, 'modal')}
        </ModalContent>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        placement="bottom"
        hideCloseButton
        onOpenChange={(open) => {
          if (!open && isMobileViewport) {
            handleModalClose();
          }
        }}
        classNames={{
          wrapper: 'hidden mobile:flex',
          base: 'hidden w-full max-h-full rounded-t-[20px] border border-black/10 bg-white mobile:flex mobile:flex-col',
          backdrop: 'hidden bg-black/40 mobile:block',
          body: 'p-0 h-full',
        }}
      >
        <DrawerContent>
          {(drawerClose) => (
            <DrawerBody className="h-full p-0">
              {renderOverlayContent(() => {
                if (isSubmitting) {
                  return;
                }
                drawerClose();
              }, 'drawer')}
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </>
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
  helperText,
  value,
  valueLabelType,
  className = '',
}: {
  label: string;
  helperText?: string;
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
        <Tooltip content={helperText ?? label}>
          <span className="flex items-center opacity-60">
            <InfoIcon size={16} />
          </span>
        </Tooltip>
      </div>
      <ValueLabel valueLabelType={valueLabelType}>{value}</ValueLabel>
    </div>
  );
}
