import { cn } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FC, ReactNode, useMemo } from 'react';

import CheckedCircleIcon from '@/components/icons/CheckCircle';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

type ApiStatus = 'idle' | 'pending' | 'success' | 'error';

interface ContentItem {
  id: number | string;
  children: ReactNode;
  className?: string;
}

interface ISubmittingStepProps {
  itemKey: IPocItemKey;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: 'easeOut' },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

const subsequentItemsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 1,
      delayChildren: 1,
    },
  },
};

const AnimationSection: FC<ISubmittingStepProps> = ({ itemKey }) => {
  const router = useRouter();

  const rewardWeight = useMemo(() => {
    return AllItemConfig[itemKey]?.weight;
  }, [itemKey]);

  const subsequentSuccessContent: ContentItem[] = useMemo(() => {
    const items: ContentItem[] = [
      {
        id: 'pi1_project_verification',
        children: (
          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span>Your proposal is Submitted</span>
          </div>
        ),
      },
      {
        id: 'pi3_reward',
        children: (
          <div className="flex items-start gap-[5px] ">
            <CheckedCircleIcon />
            <div className="flex flex-col gap-[5px]">
              <p>
                <span className="font-open-sans mr-[5px] font-[800] italic text-[#64C0A5]">
                  ZERO-TO-ONE
                </span>
                <span>reward has been added to your User Weight</span>
              </p>
              <p className="text-[14px] font-[400] leading-[20px] text-black/80">
                You have gained{' '}
                <span className="font-[700]">{rewardWeight}</span> to your User
                Weight
              </p>
            </div>
          </div>
        ),
      },
      // {
      //   id: 'buttons',
      //   children: (
      //     <div className="mobile:flex-col mobile:pt-0 flex flex-1 justify-end gap-[10px] pt-[20px]">
      //       <Button
      //         color="secondary"
      //         onClick={handleBackToContribute}
      //         type="button"
      //         className="px-[20px]"
      //         disabled={!entityId}
      //       >
      //         Back to Contribute
      //       </Button>
      //       <Button
      //         color="primary"
      //         onClick={handleViewEntity}
      //         type="button"
      //         className="px-[30px]"
      //         disabled={!entityId || !viewButtonLink || viewButtonLink === '#'}
      //       >
      //         {viewButtonText}
      //       </Button>
      //     </div>
      //   ),
      // },
    ];

    return items;
  }, [rewardWeight]);
  return (
    <div
      className={cn(
        'flex flex-col gap-[40px] mobile:mx-[10px] mobile:gap-[20px]',
      )}
    >
      <div className="font-mona flex flex-col text-[18px] font-[500] leading-[1.6] text-black">
        <AnimatePresence>
          <motion.div
            key="subsequent-items-container"
            variants={subsequentItemsContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="flex flex-col gap-[20px]"
          >
            {subsequentSuccessContent.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={cn('flex items-center gap-[5px]', item.className)}
              >
                {item.children}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimationSection;
