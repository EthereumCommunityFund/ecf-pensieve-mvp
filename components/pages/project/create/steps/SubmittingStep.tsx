import { cn, useDisclosure } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FC, ReactNode, useCallback, useMemo } from 'react';

import { Button } from '@/components/base';
import { ShareLinkIcon } from '@/components/icons';
import CheckedCircleIcon from '@/components/icons/CheckCircle';
import useShareLink from '@/hooks/useShareLink';
import { ESSENTIAL_ITEM_WEIGHT_SUM, REWARD_PERCENT } from '@/lib/constants';

import ShareModal from '../ShareModal';
import { IFormTypeEnum } from '../types';

type ApiStatus = 'idle' | 'pending' | 'success' | 'error';

interface ContentItem {
  id: number | string;
  children: ReactNode;
  className?: string;
}

interface ISubmittingStepProps {
  formType: IFormTypeEnum;
  entityId?: number;
  projectId?: number;
  apiStatus: ApiStatus;
  proposalId?: number;
}

const RewardWeight = ESSENTIAL_ITEM_WEIGHT_SUM * REWARD_PERCENT;

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

const SubmittingStep: FC<ISubmittingStepProps> = ({
  formType,
  entityId,
  projectId,
  apiStatus,
  proposalId,
}) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isProject = formType === IFormTypeEnum.Project;

  const viewButtonText = isProject ? 'View Your Project' : 'View Your Proposal';

  const viewButtonLink = useMemo(() => {
    if (apiStatus !== 'success' || !entityId) return '#';
    return isProject
      ? `/project/pending/${entityId}`
      : `/project/pending/${projectId!}/proposal/${entityId}`;
  }, [isProject, entityId, projectId, apiStatus]);

  // Always prefer the proposal route so recipients land on the detailed view
  const shareProjectId = useMemo(() => {
    if (apiStatus !== 'success') {
      return undefined;
    }
    return isProject ? entityId : projectId;
  }, [apiStatus, isProject, entityId, projectId]);

  const shareProposalId = useMemo(() => {
    if (apiStatus !== 'success') {
      return undefined;
    }
    return isProject ? proposalId : entityId;
  }, [apiStatus, isProject, proposalId, entityId]);

  const fallbackSharePath = useMemo(() => {
    if (!shareProjectId || !shareProposalId) {
      return '';
    }
    return `/project/pending/${shareProjectId}/proposal/${shareProposalId}`;
  }, [shareProjectId, shareProposalId]);

  const {
    shareUrl,
    shareImageUrl,
    loading: shareLinkLoading,
    error: shareLinkError,
    ensure: ensureShareLink,
  } = useShareLink({
    entityType: 'proposal',
    entityId: shareProposalId,
    fallbackUrl: fallbackSharePath,
    enabled: !!shareProposalId,
  });

  const handleBackToContribute = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenShare = useCallback(() => {
    onOpen();
    if (shareProposalId) {
      void ensureShareLink();
    }
    if (shareLinkError) {
      console.error('Failed to ensure share link:', shareLinkError);
    }
  }, [ensureShareLink, onOpen, shareProposalId, shareLinkError]);

  const handleViewEntity = useCallback(() => {
    if (apiStatus === 'success' && entityId) {
      router.replace(viewButtonLink);
    }
  }, [viewButtonLink, router, apiStatus, entityId]);

  const headerText = useMemo(() => {
    if (apiStatus === 'success')
      return `Your ${isProject ? 'Project' : 'Proposal'} Has Been Submitted`;
    return `Submitting ${isProject ? 'Project' : 'Proposal'}`;
  }, [apiStatus, isProject]);

  const subsequentSuccessContent: ContentItem[] = useMemo(() => {
    const items: ContentItem[] = [
      {
        id: 'pi1_weight_verification',
        children: (
          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span>
              Your Contribution Points (CP) and vote has been accounted for all
              items
            </span>
          </div>
        ),
      },
      {
        id: 'pi1_project_verification',
        children: (
          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span>
              Your proposal is now posted in the Pending Projects Page
            </span>
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
                <span>reward has been added to your CP</span>
              </p>
              <p className="text-[14px] font-[400] leading-[20px] text-black/80">
                You have gained{' '}
                <span className="font-[700]">
                  {isProject ? RewardWeight : '0'}
                </span>{' '}
                Contribution Points
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'description',
        children: (
          <p className="text-[16px] font-[400] leading-[1.6] text-black">
            This {isProject ? 'project' : 'proposal'} will now{' '}
            <span className="font-[600] text-black/80">
              proceed with community verification
            </span>
            . Once verified, this will be published as a project page.
          </p>
        ),
        className: '',
      },
      {
        id: 'buttons',
        children: (
          <div className="mobile:flex-col mobile:pt-0 flex flex-1 justify-between gap-[10px] pt-[20px]">
            <Button
              color="secondary"
              onClick={handleOpenShare}
              type="button"
              className="px-[20px]"
              disabled={!shareProjectId || !shareProposalId}
            >
              <ShareLinkIcon className="size-[20px]" />
              <span>Share Proposal</span>
            </Button>
            <div className="mobile:flex-col mobile:pt-0 flex flex-1 justify-end gap-[10px]">
              <Button
                color="secondary"
                onClick={handleBackToContribute}
                type="button"
                className="px-[20px]"
                disabled={!entityId}
              >
                Back to Contribute
              </Button>
              <Button
                color="primary"
                onClick={handleViewEntity}
                type="button"
                className="px-[30px]"
                disabled={
                  !entityId || !viewButtonLink || viewButtonLink === '#'
                }
              >
                {viewButtonText}
              </Button>
            </div>
          </div>
        ),
      },
    ];

    return items;
  }, [
    entityId,
    viewButtonLink,
    viewButtonText,
    handleBackToContribute,
    handleViewEntity,
    isProject,
    shareProjectId,
    shareProposalId,
  ]);

  if (apiStatus === 'idle' || apiStatus === 'error') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-[40px] mobile:mx-[10px] mobile:gap-[20px]',
      )}
    >
      <div className="flex items-center border-b border-black/10 bg-[rgba(245,245,245,0.8)] px-[10px] py-[8px] backdrop-blur-[5px]">
        <span className="font-mona text-[24px] font-[700] leading-[34px] text-black/80">
          {headerText}
        </span>
      </div>

      <div className="font-mona flex flex-col text-[18px] font-[500] leading-[1.6] text-black">
        <motion.div
          key="dynamic-first-line"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex items-start gap-[5px]"
        >
          <AnimatePresence mode="wait">
            {apiStatus === 'pending' ? (
              <motion.div
                key="pending-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-[10px]"
              >
                <Button
                  isIconOnly
                  isLoading={true}
                  className="size-[24px] p-0"
                />
                <span>
                  Your {isProject ? 'project' : 'proposal'} is being processed.
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {apiStatus === 'success' && (
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
          )}
        </AnimatePresence>
      </div>

      <ShareModal
        isOpen={isOpen}
        onClose={onClose}
        shareUrl={shareUrl}
        shareImageUrl={shareImageUrl}
        isLoading={shareLinkLoading}
      />
    </div>
  );
};

export default SubmittingStep;
