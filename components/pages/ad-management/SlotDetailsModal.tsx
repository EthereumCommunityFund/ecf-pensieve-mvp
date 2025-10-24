'use client';

import { useMemo } from 'react';

import { Button } from '@/components/base/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';
import ECFTypography from '@/components/base/typography';
import { XIcon } from '@/components/icons';
import type { ActiveSlotData } from '@/hooks/useHarbergerSlots';
import { formatEth } from '@/utils/harberger';

interface SlotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ActiveSlotData | null;
  onForfeit?: () => void;
  isForfeitLoading?: boolean;
}

export default function SlotDetailsModal({
  isOpen,
  onClose,
  slot,
  onForfeit,
  isForfeitLoading = false,
}: SlotDetailsModalProps) {
  const info = useMemo(() => {
    if (!slot) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'Slot Type', value: slot.slotTypeLabel },
      { label: 'Owner', value: slot.owner },
      { label: 'Valuation', value: slot.valuation },
      { label: 'Locked Bond', value: slot.lockedBond },
      { label: 'Tax Rate', value: slot.taxRate },
      { label: 'Remaining Coverage', value: slot.remainingUnits },
      { label: 'Min Takeover Bid', value: slot.minTakeoverBid },
      {
        label: 'Prepaid Tax',
        value: formatEth(slot.prepaidTaxBalanceWei),
      },
    ];
  }, [slot]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'w-[520px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px]',
      }}
      placement="center"
    >
      <ModalContent>
        {() => (
          <>
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
              <ECFTypography type="subtitle2" className="text-[18px]">
                Slot Details
              </ECFTypography>
              <Button
                isIconOnly
                radius="sm"
                className="size-[32px] rounded-[8px] bg-black/5 p-0 text-black/50 hover:bg-black/10"
                onPress={onClose}
              >
                <XIcon size={16} />
              </Button>
            </div>

            <ModalBody className="flex flex-col gap-[18px] px-5 pb-0 pt-4">
              <div className="flex flex-col gap-[8px]">
                <span className="text-[13px] font-semibold text-black/50">
                  Slot
                </span>
                <span className="text-[16px] font-semibold text-black">
                  {slot?.slotName ?? '—'}
                </span>
                <span className="text-[12px] text-black/45">
                  {slot?.statusLabel ?? '—'}
                </span>
              </div>

              <div className="flex flex-col gap-[12px] rounded-[12px] border border-black/10 bg-[#FCFCFC] p-[16px]">
                {info.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="text-black/60">{item.label}</span>
                    <span className="font-semibold text-black">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {slot?.currentAdURI ? (
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] font-semibold text-black/60">
                    Current Creative URI
                  </span>
                  <span className="break-all text-[12px] text-black/70">
                    {slot.currentAdURI}
                  </span>
                </div>
              ) : null}
            </ModalBody>

            <ModalFooter className="flex items-center gap-[12px] p-5">
              <Button
                color="secondary"
                className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                onPress={onClose}
              >
                Close
              </Button>
              {onForfeit ? (
                <Button
                  color="primary"
                  className="h-[40px] flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white hover:bg-black/90"
                  onPress={onForfeit}
                  isLoading={isForfeitLoading}
                  isDisabled={isForfeitLoading}
                >
                  Forfeit Slot
                </Button>
              ) : null}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
