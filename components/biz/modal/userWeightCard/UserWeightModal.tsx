import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import { FC, memo } from 'react';

import { Modal, ModalContent } from '@/components/base';

interface IUserWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 用户权重说明模态框组件
 * 显示关于用户权重的详细说明信息
 *
 * @param isOpen - 模态框是否打开
 * @param onClose - 关闭模态框的回调函数
 */
const UserWeightModal: FC<IUserWeightModalProps> = memo(
  ({ isOpen, onClose }) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          base: 'w-[480px] m-0 p-0 rounded-[10px] border border-black/10 bg-white',
          header: 'p-0',
        }}
        closeButton={<></>} // 使用自定义关闭按钮
      >
        <ModalContent className="flex flex-col items-center overflow-hidden rounded-[10px] bg-white">
          {/* Header */}
          <div className="flex items-center justify-between gap-[5px] self-stretch border-b border-black/10 px-[20px] py-[10px]">
            <h2
              className="text-[16px] font-semibold leading-[1.36181640625] text-black/80"
              style={{ fontFamily: 'Open Sans' }}
            >
              About: Your Contribution Points
            </h2>
            <div className="flex items-center gap-[10px] rounded-[4px] p-[5px]">
              <div className="size-[20px]">
                <button
                  onClick={onClose}
                  className="flex size-full items-center justify-center transition-opacity hover:opacity-70"
                  aria-label="Close modal"
                >
                  <X
                    size={11.25}
                    weight="bold"
                    className="stroke-[1.5px] text-black"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-[20px] self-stretch p-[20px]">
            <div className="flex flex-col gap-[10px] self-stretch">
              <p
                className="self-stretch text-left text-[14px] font-normal leading-[1.4285714285714286] text-black/80"
                style={{ fontFamily: 'Open Sans' }}
              >
                Contribution points are a form of merit-based metric used to
                track and reward users' involvement and contributions to the
                ecosystem.
                <br />
                <br />
                Your CP increase based on the contributions.
                <br />
                <br />
                Your CP grants you influence in the knowledge base in voting and
                proposing information
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-[10px] self-stretch bg-[#F5F5F5] px-[20px] pb-[20px] pt-[10px]">
            <p
              className="flex-1 text-center text-[13px] font-normal leading-[1.36181640625] text-black/50"
              style={{ fontFamily: 'Open Sans' }}
            >
              You can learn more about ECF mechanisms{' '}
              <Link
                href="/"
                className="font-normal text-black/50 underline transition-colors hover:text-black/70"
              >
                here
              </Link>
            </p>
          </div>
        </ModalContent>
      </Modal>
    );
  },
);

UserWeightModal.displayName = 'UserWeightModal';

export default UserWeightModal;
