'use client';

import { useEffect, useMemo, useState } from 'react';

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

interface BreakdownProps {
  bondRateLabel: string;
  bondRateValue: string;
  taxLabel: string;
  taxValue: string;
  coverageLabel: string;
  coverageValue: string;
  totalLabel: string;
  totalValue: string;
}

export interface ClaimSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotName: string;
  statusLabel?: string;
  breakdown: BreakdownProps;
  valuationDefault: string;
  valuationMinimum: string;
  coverageDescription: string;
}

type ClaimStep = 1 | 2;

const CONTENT_TYPE_OPTIONS = [
  { key: 'image', label: 'Image' },
  { key: 'html', label: 'HTML Embed' },
  { key: 'video', label: 'Video' },
];

const COVERAGE_OPTIONS = [
  { key: '1d', label: '1 day' },
  { key: '7d', label: '7 days' },
  { key: '14d', label: '14 days' },
];

export default function ClaimSlotModal({
  isOpen,
  onClose,
  slotName,
  statusLabel = 'Open',
  breakdown,
  valuationDefault,
  valuationMinimum,
  coverageDescription,
}: ClaimSlotModalProps) {
  const [step, setStep] = useState<ClaimStep>(1);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const stepTitle = useMemo(() => {
    return step === 1 ? 'Make Claim Step 1' : 'Make Claim Step 2';
  }, [step]);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    handleClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

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
                  {slotName}
                </span>
              </div>

              {step === 1 ? (
                <StepOneContent
                  breakdown={breakdown}
                  valuationDefault={valuationDefault}
                  valuationMinimum={valuationMinimum}
                  coverageDescription={coverageDescription}
                />
              ) : (
                <StepTwoContent />
              )}
            </ModalBody>

            <ModalFooter className="flex items-center gap-[12px] p-5">
              <Button
                color="secondary"
                className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                onPress={step === 1 ? handleClose : handleBack}
              >
                {step === 1 ? 'Close' : 'Back'}
              </Button>
              <Button
                color="primary"
                className="h-[40px] flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white hover:bg-black/90"
                onPress={handleNext}
              >
                {step === 1 ? 'Next (1)' : 'Next (2)'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function StepOneContent({
  breakdown,
  valuationDefault,
  valuationMinimum,
  coverageDescription,
}: {
  breakdown: BreakdownProps;
  valuationDefault: string;
  valuationMinimum: string;
  coverageDescription: string;
}) {
  return (
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
          label={breakdown.bondRateLabel}
          value={breakdown.bondRateValue}
        />
        <BreakdownRow label={breakdown.taxLabel} value={breakdown.taxValue} />
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

      <div className="flex flex-col gap-[12px]">
        <LabelWithInfo label="Set Valuation (ETH)" />
        <Input
          defaultValue={valuationDefault}
          aria-label="Set valuation"
          className="text-[16px] font-semibold"
        />
        <span className="text-[12px] text-black/50">
          Min: {valuationMinimum}
        </span>
      </div>

      <div className="flex flex-col gap-[12px]">
        <LabelWithInfo label="Tax Coverage" />
        <span className="text-[12px] leading-[18px] text-black/60">
          {coverageDescription}
        </span>
        <Select
          defaultSelectedKeys={[COVERAGE_OPTIONS[1].key]}
          className="w-full"
          aria-label="Select tax coverage"
        >
          {COVERAGE_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

function StepTwoContent() {
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[12px]">
        <LabelWithInfo label="Content Type" />
        <Select
          defaultSelectedKeys={[CONTENT_TYPE_OPTIONS[0].key]}
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
        <Input placeholder="type here" aria-label="Slot title" />
      </div>

      <div className="flex flex-col gap-[12px]">
        <LabelWithInfo label="Link URL" />
        <Input placeholder="https://" aria-label="Link URL" />
      </div>

      <div className="flex flex-col gap-[12px]">
        <LabelWithInfo label="Image" />
        <Input placeholder="type here" aria-label="Image reference" />
      </div>
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
