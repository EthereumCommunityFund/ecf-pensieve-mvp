import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import { FC, useCallback, useState } from 'react';

import { InfoIcon } from '@/components/icons';
import {
  Button,
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';

interface IProps {
  weight?: string | number;
}

const UserWeightCard: FC<IProps> = ({ weight = '00' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <div className="mobile:p-[20px] flex w-full items-center justify-between rounded-[10px] border border-black/10 bg-white p-[14px]">
        <div className="flex items-center justify-start gap-[5px]">
          <p className="font-mona text-[18px] font-[600] leading-[25px] text-black ">
            Your Weight
          </p>
          <Button
            isIconOnly
            size="sm"
            onPress={() => setIsOpen(true)}
            className="size-[20px] min-w-0 hover:bg-transparent"
          >
            <InfoIcon size={20} />
          </Button>
        </div>

        <div className="font-mona text-[18px] font-[600] leading-[25px] text-black ">
          {weight}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          base: 'w-[480px] m-0 p-0',
          header: 'p-[20px]',
        }}
      >
        <ModalContent>
          <CommonModalHeader
            title={'About: Your Weight'}
            onClose={onClose}
            classNames={{
              base: 'pb-[20px] border-b border-[rgba(0,0,0,0.1)]',
              title: 'text-black/80 text-[16px]',
            }}
            closeIcon={<X size={20} />}
          />
          <ModalBody className="flex-col gap-[20px] p-[20px]">
            <p className="text-[14px] leading-[20px] text-black/80">
              Your weight essentially reflects your influence in projects on the
              voting and proposing of information. Your weight can increase
              based on contributions.
            </p>

            <p className="mt-[10px] text-[13px] leading-[1.2] text-black/50">
              You can learn more about ECF mechanisms{' '}
              <span className="font-[700]">
                {/* TODO add ECF mechanism link */}
                <Link href="/">Here</Link>
              </span>
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserWeightCard;
