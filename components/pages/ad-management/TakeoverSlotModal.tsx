'use client';

import {
  cn,
  Drawer,
  DrawerBody,
  DrawerContent,
  Slider,
  Tooltip,
} from '@heroui/react';
import { CoinVertical, TrendUp, Warning } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseEther } from 'viem';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Modal, ModalBody, ModalContent } from '@/components/base/modal';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, XIcon } from '@/components/icons';
import type { ActiveSlotData } from '@/hooks/useHarbergerSlots';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  calculateBond,
  calculateTaxForPeriods,
  formatBps,
  formatDuration,
  formatEth,
  formatNumberInputFromWei,
  ZERO_BIGINT,
} from '@/utils/harberger';

import { BreakdownRow } from './ClaimSlotModal';
import CreativePhotoUpload from './CreativePhotoUpload';
import OwnedSlotOverview from './OwnedSlotOverview';
import ValueLabel, { IValueLabelType } from './ValueLabel';
import {
  CREATIVE_GUIDANCE,
  resolveCreativeUploadConfigs,
} from './creativeConstants';

const MOBILE_MAX_WIDTH_PX = 809;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

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

export interface TakeoverSubmissionPayload {
  valuationWei?: bigint;
  taxPeriods?: bigint;
  creativeUri?: string;
}

export interface TakeoverSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ActiveSlotData | null;
  mode?: SlotModalMode;
  onSubmit?: (payload: TakeoverSubmissionPayload) => Promise<void> | void;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export default function TakeoverSlotModal({
  isOpen,
  onClose,
  slot,
  mode = 'takeover',
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: TakeoverSlotModalProps) {
  const isTakeoverMode = mode === 'takeover';
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const [activeStep, setActiveStep] = useState(isTakeoverMode ? 1 : 2);
  const isMobileViewport = useMediaQuery(MOBILE_MEDIA_QUERY);

  const resetActiveStep = useCallback(() => {
    setActiveStep(isTakeoverMode ? 1 : 2);
  }, [isTakeoverMode]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    resetActiveStep();
  }, [isOpen, resetActiveStep, slot?.id]);

  const isModalOpen = isOpen && !isMobileViewport;
  const isDrawerOpen = isOpen && isMobileViewport;

  const contextTone: ContextTone =
    slot && (slot.isOverdue || slot.isExpired) ? 'danger' : 'default';

  const headerTitle = useMemo(() => {
    if (isTakeoverMode) {
      return activeStep === 1 ? 'View Owned Slot' : 'Takeover Slot';
    }
    if (isEditMode) {
      return 'Edit Slot Creative';
    }
    return 'View Owned Slot';
  }, [activeStep, isEditMode, isTakeoverMode]);

  const headerSubtitle = slot
    ? `${slot.slotTypeLabel} · ${slot.slotDisplayName ?? slot.slotName}`
    : 'Slot Details';

  const headerStepLabel = isTakeoverMode
    ? `Step ${Math.min(activeStep, 2)} of 2`
    : null;

  const shouldShowOverview = Boolean(
    slot && (isViewMode || (isTakeoverMode && activeStep === 1)),
  );

  const shouldShowActionForm = Boolean(
    slot && (isEditMode || (isTakeoverMode && activeStep === 2)),
  );

  const handleProceedToForm = useCallback(() => {
    if (!isTakeoverMode) {
      return;
    }
    setActiveStep(2);
  }, [isTakeoverMode]);

  const handleBackToOverview = useCallback(() => {
    if (!isTakeoverMode) {
      return;
    }
    setActiveStep(1);
  }, [isTakeoverMode]);

  const handleForfeitAction = useCallback(async () => {
    if (!onSubmit) {
      return;
    }

    try {
      await onSubmit({});
    } catch (error) {
      console.error('Failed to submit action:', error);
    }
  }, [onSubmit]);

  const handleModalClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    resetActiveStep();
    onClose();
  }, [isSubmitting, onClose, resetActiveStep]);

  const renderOverlayContent = useCallback(
    (close: () => void, variant: 'modal' | 'drawer') => {
      const handleClose = () => {
        if (isSubmitting) {
          return;
        }
        resetActiveStep();
        close();
      };

      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-[20px] py-[10px]">
            <div className="flex flex-col gap-[2px]">
              <ECFTypography type="subtitle2" className="text-[18px]">
                {headerTitle}
              </ECFTypography>
            </div>

            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                radius="sm"
                className="size-[32px] rounded-[8px] p-0 text-black/50 hover:bg-black/10"
                onPress={handleClose}
                isDisabled={isSubmitting}
              >
                <XIcon size={16} />
              </Button>
            </div>
          </div>

          <ModalBody
            className={cn(
              'flex flex-1 flex-col gap-[20px] overflow-y-auto p-[20px]',
              'mobile:p-[10px]',
              variant === 'drawer' ? 'pb-[32px]' : '',
            )}
          >
            {!slot ? (
              <div className="rounded-[10px] border border-black/10 bg-[#FCFCFC] px-4 py-6 text-center text-[13px] text-black/60">
                Slot information is unavailable.
              </div>
            ) : (
              <>
                {shouldShowOverview ? (
                  <SlotOverviewStep
                    slot={slot}
                    mode={mode}
                    tone={contextTone}
                    isSubmitting={isSubmitting}
                    errorMessage={isViewMode ? errorMessage : undefined}
                    onCancel={handleClose}
                    onProceed={isTakeoverMode ? handleProceedToForm : undefined}
                    onForfeit={isViewMode ? handleForfeitAction : undefined}
                  />
                ) : null}

                {shouldShowActionForm ? (
                  <SlotActionFormContent
                    slot={slot}
                    mode={mode}
                    isOpen={isOpen}
                    isSubmitting={isSubmitting}
                    onCancel={handleClose}
                    onSubmit={onSubmit}
                    errorMessage={errorMessage}
                  />
                ) : null}
              </>
            )}
          </ModalBody>
        </div>
      );
    },
    [
      activeStep,
      contextTone,
      errorMessage,
      handleBackToOverview,
      handleForfeitAction,
      handleProceedToForm,
      headerStepLabel,
      headerSubtitle,
      headerTitle,
      isOpen,
      isSubmitting,
      isTakeoverMode,
      isViewMode,
      mode,
      onSubmit,
      resetActiveStep,
      shouldShowActionForm,
      shouldShowOverview,
      slot,
    ],
  );

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        placement="center"
        classNames={{
          wrapper: 'mobile:hidden flex',
          base: 'w-[600px] bg-white p-0 max-w-[9999px]',
          body: 'p-0 max-h-[80vh] overflow-hidden',
        }}
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
          base: 'hidden h-full w-full max-h-full rounded-t-[0px] border border-black/10 bg-white mobile:flex mobile:flex-col',
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
                resetActiveStep();
                drawerClose();
              }, 'drawer')}
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

export interface SlotOverviewStepProps {
  slot: ActiveSlotData;
  mode: SlotModalMode;
  tone: ContextTone;
  isSubmitting: boolean;
  onCancel: () => void;
  onProceed?: () => void;
  onForfeit?: () => void | Promise<void>;
  errorMessage?: string;
}

export function SlotOverviewStep({
  slot,
  mode,
  tone,
  isSubmitting,
  onCancel,
  onProceed,
  onForfeit,
  errorMessage,
}: SlotOverviewStepProps) {
  const isTakeoverMode = mode === 'takeover';
  const isViewMode = mode === 'view';

  const takeoverPreviewLabel = formatEth(slot.minTakeoverBidWei, {
    maximumFractionDigits: 4,
  });

  const takeoverLabel = slot.takeoverCta
    ? slot.takeoverCta
    : takeoverPreviewLabel
      ? `Takeover for ${takeoverPreviewLabel}`
      : 'Continue';

  const cancelLabel = isViewMode ? 'Close' : 'Cancel';
  const canProceed = Boolean(isTakeoverMode && onProceed);
  const canForfeit = Boolean(isViewMode && !slot.isExpired && onForfeit);
  const showPrimaryButton = canProceed || canForfeit;
  const primaryLabel = isTakeoverMode ? takeoverLabel : 'Forfeit Slot';

  const handlePrimaryAction = useCallback(() => {
    if (isTakeoverMode) {
      onProceed?.();
      return;
    }

    if (isViewMode && !slot.isExpired) {
      onForfeit?.();
    }
  }, [isTakeoverMode, isViewMode, onForfeit, onProceed, slot.isExpired]);

  return (
    <div className="flex flex-col gap-[20px]">
      <OwnedSlotOverview slot={slot} tone={tone} />

      {errorMessage ? (
        <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex items-center gap-[10px]">
        <Button
          color="secondary"
          className="h-[40px] w-[90px] rounded-[5px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
          onPress={onCancel}
          isDisabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
        {showPrimaryButton ? (
          <Button
            color="primary"
            className="h-[40px] flex-1 rounded-[5px] bg-black text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            isDisabled={
              isSubmitting ||
              (isTakeoverMode && !canProceed) ||
              (isViewMode && !canForfeit)
            }
            onPress={handlePrimaryAction}
          >
            {isTakeoverMode ? <CoinVertical size={24} /> : null}
            {primaryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

interface SlotActionFormContentProps {
  slot: ActiveSlotData;
  mode: SlotModalMode;
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit?: (payload: TakeoverSubmissionPayload) => Promise<void> | void;
  errorMessage?: string;
}

function SlotActionFormContent({
  slot,
  mode,
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
  errorMessage,
}: SlotActionFormContentProps) {
  const isTakeoverMode = mode === 'takeover';
  const isEditMode = mode === 'edit';
  const allowCreativeEditing = isTakeoverMode || isEditMode;
  const requireCreativeReady = allowCreativeEditing;
  const contextTone: ContextTone =
    slot.isOverdue || slot.isExpired ? 'danger' : 'default';
  const creativeUploadConfigs = useMemo(() => {
    return resolveCreativeUploadConfigs(slot.creativeConfig);
  }, [slot.creativeConfig]);
  const desktopCreativeConfig = creativeUploadConfigs.desktop;
  const mobileCreativeConfig = creativeUploadConfigs.mobile;
  const desktopAspectRatio = `${desktopCreativeConfig.width} / ${desktopCreativeConfig.height}`;
  const mobileAspectRatio = `${mobileCreativeConfig.width} / ${mobileCreativeConfig.height}`;

  const minCoverageDays = 1;
  const maxCoverageDays = 365;
  const stepCoverageDays = 1;

  const takeoverDefaults = useMemo(() => {
    if (!isTakeoverMode) {
      return {
        coveragePeriods: 1,
        fallbackValuationWei: ZERO_BIGINT,
        valuationInput: '',
      } as const;
    }

    const periodSeconds = Number(slot.taxPeriodInSeconds);
    const remainingSeconds = Number(slot.timeRemainingInSeconds);
    let coveragePeriods = 1;
    if (periodSeconds > 0 && remainingSeconds > 0) {
      coveragePeriods = Math.ceil(remainingSeconds / periodSeconds);
      coveragePeriods = Math.min(365, Math.max(1, coveragePeriods));
    }

    const fallbackValuationWei =
      slot.minTakeoverBidWei > ZERO_BIGINT
        ? slot.minTakeoverBidWei
        : slot.minValuationWei;

    return {
      coveragePeriods,
      fallbackValuationWei,
      valuationInput: formatNumberInputFromWei(fallbackValuationWei, 4),
    } as const;
  }, [
    isTakeoverMode,
    slot.minTakeoverBidWei,
    slot.minValuationWei,
    slot.taxPeriodInSeconds,
    slot.timeRemainingInSeconds,
  ]);

  const [selectedCoverageDays, setSelectedCoverageDays] = useState(
    takeoverDefaults.coveragePeriods,
  );
  const [valuationInput, setValuationInput] = useState(
    takeoverDefaults.valuationInput,
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [localCreativeError, setLocalCreativeError] = useState<string | null>(
    null,
  );
  const [creativeTitle, setCreativeTitle] = useState('');
  const [creativeLink, setCreativeLink] = useState('');
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [creativeUri, setCreativeUri] = useState(slot.currentAdURI ?? '');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setLocalError(null);
    setLocalCreativeError(null);

    if (isTakeoverMode) {
      setSelectedCoverageDays(takeoverDefaults.coveragePeriods);
      setValuationInput(takeoverDefaults.valuationInput);
    }
  }, [
    isOpen,
    slot.id,
    isTakeoverMode,
    takeoverDefaults.coveragePeriods,
    takeoverDefaults.valuationInput,
  ]);

  const applyCreativeSource = useCallback((source: string) => {
    const trimmed = source.trim();
    if (trimmed.length === 0) {
      setCreativeTitle('');
      setCreativeLink('');
      setFallbackImageUrl('');
      setDesktopImageUrl('');
      setMobileImageUrl('');
      setLocalCreativeError(null);
      return;
    }

    if (trimmed.startsWith('data:application/json')) {
      try {
        const [, payload = ''] = trimmed.split(',', 2);
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
    }

    setCreativeTitle('');
    setCreativeLink('');
    setFallbackImageUrl('');
    setDesktopImageUrl(trimmed);
    setMobileImageUrl('');
    setLocalCreativeError(null);
  }, []);

  useEffect(() => {
    const initialCreative = slot.currentAdURI ?? '';

    if (isTakeoverMode) {
      setCreativeUri('');
      setCreativeTitle('');
      setCreativeLink('');
      setFallbackImageUrl('');
      setDesktopImageUrl('');
      setMobileImageUrl('');
      setLocalCreativeError(null);
      return;
    }

    setCreativeUri(initialCreative.trim());
    applyCreativeSource(initialCreative);
  }, [applyCreativeSource, isTakeoverMode, slot]);

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
  }, [
    creativeLink,
    creativeTitle,
    desktopImageUrl,
    fallbackImageUrl,
    isCreativeReady,
    mobileImageUrl,
    requireCreativeReady,
  ]);

  useEffect(() => {
    if (requireCreativeReady && isCreativeReady) {
      setLocalCreativeError(null);
    }
  }, [isCreativeReady, requireCreativeReady]);

  const formattedCoverageLabel = `(${formatDaysLabel(selectedCoverageDays)})`;
  const coverageRangeStartLabel = formatRangeBoundary(minCoverageDays);
  const coverageRangeEndLabel = formatRangeBoundary(maxCoverageDays);

  const parsedValuationWei = useMemo(() => {
    if (!isTakeoverMode) {
      return null;
    }

    try {
      if (!valuationInput || valuationInput.trim().length === 0) {
        return null;
      }
      return parseEther(valuationInput.trim());
    } catch {
      return null;
    }
  }, [isTakeoverMode, valuationInput]);

  const isValuationValid =
    !isTakeoverMode ||
    (parsedValuationWei !== null &&
      parsedValuationWei >= slot.minTakeoverBidWei);

  const valuationBasis = isTakeoverMode
    ? parsedValuationWei && parsedValuationWei >= slot.minTakeoverBidWei
      ? parsedValuationWei
      : takeoverDefaults.fallbackValuationWei
    : slot.valuationWei > ZERO_BIGINT
      ? slot.valuationWei
      : slot.minValuationWei;

  const coverageBigInt = BigInt(Math.max(1, selectedCoverageDays));
  const coverageDuration = formatDuration(
    slot.taxPeriodInSeconds * coverageBigInt,
    {
      fallback: '0s',
    },
  );

  const bondRequired = calculateBond(valuationBasis, slot.bondRateBps);
  const taxRequired = calculateTaxForPeriods(
    valuationBasis,
    slot.taxRateBps,
    slot.taxPeriodInSeconds,
    coverageBigInt,
  );
  const totalValue = bondRequired + taxRequired;

  const minBidPlaceholder = formatEth(slot.minTakeoverBidWei, {
    withUnit: false,
    maximumFractionDigits: 4,
  });

  const minBidIncrementPercent = formatBps(slot.minBidIncrementBps);
  const minBidRequirementDesc = `Minimum bid must be at least ${formatEth(
    slot.minTakeoverBidWei,
  )} (${minBidIncrementPercent} higher than current valuation).`;
  const minBidRequirementHelper = `Minimum bid is ${formatEth(slot.minTakeoverBidWei)} (${minBidIncrementPercent} higher than current valuation).`;
  const shouldShowValuationError =
    isTakeoverMode &&
    Boolean(valuationInput && valuationInput.trim().length > 0) &&
    !isValuationValid;

  const valuation: ValuationConfig | undefined = isTakeoverMode
    ? {
        placeholder: minBidPlaceholder ? `≥ ${minBidPlaceholder}` : undefined,
        helper: slot.takeoverHelper ?? '',
        value: valuationInput,
        errorMessage: shouldShowValuationError
          ? minBidRequirementHelper
          : undefined,
        onChange: setValuationInput,
      }
    : undefined;

  const breakdown: BreakdownConfig | undefined = isTakeoverMode
    ? {
        bondRateLabel: `Bond Rate (${slot.bondRate})`,
        bondRateValue: formatEth(bondRequired),
        taxLabel: `Tax (${selectedCoverageDays} period${
          selectedCoverageDays > 1 ? 's' : ''
        })`,
        taxValue: formatEth(taxRequired),
        coverageLabel: 'Coverage',
        coverageValue: coverageDuration,
        totalLabel: 'Total',
        totalValue: formatEth(totalValue),
      }
    : undefined;

  const harbergerInfo = isTakeoverMode
    ? `You pay the current owner's declared price to the community treasury. Set your own valuation carefully - you'll pay continuous taxes on it, and others can buy from you at that price.`
    : undefined;

  const ctaLabel = isTakeoverMode
    ? (slot.takeoverCta ?? 'Submit Takeover')
    : 'Save Changes';
  const cancelLabel = 'Cancel';

  const showHarbergerInfo = Boolean(harbergerInfo);
  const showValuationSection = Boolean(valuation);
  const showCoverageSection = isTakeoverMode;
  const showBreakdownSection = Boolean(breakdown);
  const showCtaButton = Boolean(ctaLabel && onSubmit);

  const creativeDescription = allowCreativeEditing
    ? CREATIVE_GUIDANCE.combinedDescription(
        mobileCreativeConfig.ratioLabel,
        desktopCreativeConfig.label,
      )
    : CREATIVE_GUIDANCE.viewDescription;

  const desktopPlaceholderLabel = allowCreativeEditing
    ? 'Click to upload desktop asset'
    : 'Desktop creative asset';
  const mobilePlaceholderLabel = allowCreativeEditing
    ? 'Click to upload mobile asset'
    : 'Mobile creative asset';

  const creativeInputDisabled = !allowCreativeEditing || isSubmitting;
  const textInputDisabled = !allowCreativeEditing || isSubmitting;

  const combinedError =
    (allowCreativeEditing ? localCreativeError : null) ??
    localError ??
    errorMessage ??
    null;

  const statusLabelType = contextTone === 'danger' ? 'danger' : 'light';

  const handleCoverageSliderChange = useCallback(
    (value: number) => {
      const normalizedValue = snapToStep(
        value,
        minCoverageDays,
        maxCoverageDays,
        stepCoverageDays,
      );
      setSelectedCoverageDays(normalizedValue);
    },
    [minCoverageDays, maxCoverageDays, stepCoverageDays],
  );

  const handleCoverageSliderChangeEnd = useCallback(
    (value: number) => {
      const normalizedValue = snapToStep(
        value,
        minCoverageDays,
        maxCoverageDays,
        stepCoverageDays,
      );
      setSelectedCoverageDays(normalizedValue);
    },
    [minCoverageDays, maxCoverageDays, stepCoverageDays],
  );

  const handlePrimaryAction = useCallback(async () => {
    if (!onSubmit) {
      return;
    }

    if (requireCreativeReady && !isCreativeReady) {
      setLocalCreativeError(
        'Upload both desktop and mobile creatives before continuing.',
      );
      return;
    }

    setLocalCreativeError(null);
    setLocalError(null);

    try {
      if (isTakeoverMode) {
        if (
          !parsedValuationWei ||
          parsedValuationWei < slot.minTakeoverBidWei
        ) {
          setLocalError('Bid must meet the minimum increment.');
          return;
        }

        await onSubmit({
          valuationWei: parsedValuationWei,
          taxPeriods: BigInt(Math.max(1, selectedCoverageDays)),
          creativeUri: creativeUri || slot.currentAdURI || '',
        });
        return;
      }

      if (isEditMode) {
        const trimmedUri = creativeUri.trim();
        if (!trimmedUri) {
          setLocalCreativeError('Upload creative assets before saving.');
          return;
        }
        await onSubmit({ creativeUri: trimmedUri });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit action.';
      setLocalError(message);
    }
  }, [
    creativeUri,
    isCreativeReady,
    isEditMode,
    isTakeoverMode,
    onSubmit,
    parsedValuationWei,
    requireCreativeReady,
    selectedCoverageDays,
    slot.currentAdURI,
    slot.minTakeoverBidWei,
  ]);

  const displayName = slot.slotDisplayName ?? slot.slotName;
  const statusLabel = slot.statusLabel ?? (slot.isExpired ? 'Closed' : 'Owned');

  const minBidLabel = isTakeoverMode ? 'Minimum Bid Required' : 'Locked Bond';
  const minBidValue = isTakeoverMode
    ? (slot.minTakeoverBid ?? '—')
    : (slot.lockedBond ?? '—');
  const minBidHelper = isTakeoverMode
    ? slot.takeoverHelper
    : 'Bond currently locked for this slot.';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <div className="flex flex-wrap items-center gap-[10px]">
          <span className="text-[13px] font-semibold text-black/50">Slot:</span>
          <span className="text-[13px] font-semibold text-black">
            {displayName}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[8px] rounded-[10px] border border-black/10 bg-white p-[10px] md:grid-cols-3">
        <InfoStat label="Owner" value={slot.owner ?? '—'} labelType={'light'} />
        <InfoStat label="Tax Rate" value={slot.taxRate} labelType={'light'} />
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
              aria-label="Set new valuation"
            />
            {shouldShowValuationError ? (
              <div className="flex items-start text-[13px] text-[#E76F37]">
                <Warning size={20} className="shrink-0 text-[#D9470D]" />
                <span className="ml-[10px] mr-[5px] font-semibold">
                  Bid Too Low:
                </span>
                <span>{valuation.errorMessage ?? minBidRequirementHelper}</span>
              </div>
            ) : (
              <span className="font-inter text-[13px] font-[400] text-black/80">
                {minBidRequirementDesc}
              </span>
            )}
          </div>
        </div>
      ) : null}

      {showCoverageSection ? (
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[5px]">
            <LabelWithInfo label={`Tax Coverage ${formattedCoverageLabel}`} />
            <span className="text-[13px] text-black/80">
              Choose how many tax periods to prepay. Longer coverage means
              higher upfront cost but no need to pay taxes frequently. (1 tax
              period = 24 hours / 86400 seconds)
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
        <div className="flex flex-col gap-[8px] rounded-[10px] border border-black/10 bg-white p-[10px]">
          <div className="flex items-center gap-[8px] text-[14px] leading-[20px] text-black">
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
          {/* <span className="text-[12px] leading-[18px] text-black/50">
            {creativeDescription}
          </span> */}
        </div>

        <div className="flex flex-col gap-[12px]">
          <span className="text-[13px] font-semibold text-black/70">
            {`Desktop Creative (${desktopCreativeConfig.label})`}
          </span>
          <CreativePhotoUpload
            initialUrl={desktopImageUrl || undefined}
            onUploadSuccess={(url) => {
              setDesktopImageUrl(url);
              setLocalCreativeError(null);
            }}
            isDisabled={creativeInputDisabled}
            cropAspectRatio={desktopCreativeConfig.aspectRatio}
            cropMaxWidth={desktopCreativeConfig.width}
            cropMaxHeight={desktopCreativeConfig.height}
            className="mobile:w-[80vw] w-[429px] overflow-hidden rounded-[10px]"
          >
            <div
              className="w-[429px] overflow-hidden rounded-[10px] border border-dashed border-black/20 bg-[#F5F5F5]"
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
                  <span>{desktopPlaceholderLabel}</span>
                  {allowCreativeEditing ? (
                    <span className="text-[11px] text-black/40">
                      {desktopCreativeConfig.helperText}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </CreativePhotoUpload>
          {/* {allowCreativeEditing ? (
            <span className="text-[11px] text-black/50">
              Supports JPG, PNG, or GIF up to 10MB.
            </span>
          ) : null} */}
        </div>

        <div className="flex flex-col gap-[12px]">
          <span className="text-[13px] font-semibold text-black/70">
            {`Mobile Creative (${mobileCreativeConfig.label})`}
          </span>
          <CreativePhotoUpload
            initialUrl={mobileImageUrl || undefined}
            onUploadSuccess={(url) => {
              setMobileImageUrl(url);
              setLocalCreativeError(null);
            }}
            isDisabled={creativeInputDisabled}
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
                  <span>{mobilePlaceholderLabel}</span>
                  {allowCreativeEditing ? (
                    <span className="text-[11px] text-black/40">
                      {mobileCreativeConfig.helperText}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </CreativePhotoUpload>
          {/* {allowCreativeEditing ? (
            <span className="text-[11px] text-black/50">
              The mobile asset is cropped to a{' '}
              {mobileCreativeConfig.ratioLabel} ratio for responsive layouts.
            </span>
          ) : null} */}
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
        <div className="flex flex-col gap-[5px]">
          <span className="text-[14px] font-semibold text-black/80">
            How Harberger Tax Works:
          </span>
          <span className="text-[13px] leading-[18px] text-black/50">
            {harbergerInfo}
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-[10px]">
        <Button
          color="secondary"
          className="h-[40px] w-[90px] rounded-[5px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
          onPress={onCancel}
          isDisabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
        {showCtaButton ? (
          <Button
            color="primary"
            className="h-[40px] flex-1 rounded-[5px] bg-black text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            isDisabled={
              isSubmitting ||
              (isTakeoverMode && !isValuationValid) ||
              (requireCreativeReady && !isCreativeReady)
            }
            isLoading={Boolean(isSubmitting)}
            onPress={handlePrimaryAction}
          >
            {isTakeoverMode ? <CoinVertical size={24} /> : null}
            {ctaLabel}
          </Button>
        ) : null}
      </div>
    </>
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
