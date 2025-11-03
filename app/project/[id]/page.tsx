'use client';

import { Skeleton } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ProjectTabs from '@/components/base/ProjectTabs';
import { useMetricDetailModal } from '@/components/biz/modal/metricDetail/Context';
import BackHeader from '@/components/pages/project/BackHeader';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import ContributingFunds from '@/components/pages/project/contributingFunds';
import ProjectDetailMainModal from '@/components/pages/project/detail/modal';
import ReferenceModal from '@/components/pages/project/detail/modal/reference';
import SubmitterModal from '@/components/pages/project/detail/modal/Submitter';
import ProjectDetailCard from '@/components/pages/project/detail/ProjectDetailCard';
import ProjectTopBannerAd from '@/components/pages/project/detail/ProjectTopBannerAd';
import ProjectDetailTable from '@/components/pages/project/detail/table/ProjectDetailTable';
import TransparentScore from '@/components/pages/project/detail/TransparentScore';
import Ecosystem from '@/components/pages/project/ecosystem';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IPocItemKey } from '@/types/item';

const tabItems = [
  { key: 'profile', label: 'Profile' },
  { key: 'contributing-funds', label: 'Fund Contributions' },
  { key: 'ecosystem', label: 'Ecosystem' },
];

// Animation variants for tab content
const tabContentVariants = {
  enter: {
    opacity: 0,
    x: 20,
  },
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

export type ITabKey = 'profile' | 'ecosystem' | 'contributing-funds';
export type IModalContentType = 'viewItemProposal' | 'submitPropose';

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use Context to get project data
  const {
    project,
    isProjectFetched,
    isProposalsLoading,
    isProposalsFetched,
    closeReferenceModal,
    currentRefKey,
    currentRefValue,
    currentItemReason,
    openReferenceModal,
    isSubmitterModalOpen,
    selectedSubmitter,
    selectedValidatedAt,
    showSubmitterModal: handleOpenSubmitterModal,
    closeSubmitterModal: handleCloseSubmitterModal,
    getLeadingProjectName,
    getLeadingTagline,
    getLeadingCategories,
    getLeadingLogoUrl,
  } = useProjectDetailContext();

  const displayedCount = useMemo(() => {
    return Object.keys(project?.itemsTopWeight || {}).length;
  }, [project]);

  const [modalContentType, setModalContentType] =
    useState<IModalContentType>('viewItemProposal');

  const [activeTab, setActiveTab] = useState<ITabKey>('profile');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemKey, setSelectedItemKey] = useState<IPocItemKey | null>(
    null,
  );

  // MerrticDetailModal state management - use Context
  const { openMetricModal } = useMetricDetailModal();

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    // Allow profile, ecosystem, and contributing-funds tabs
    if (
      currentTab === 'profile' ||
      currentTab === 'ecosystem' ||
      currentTab === 'contributing-funds'
    ) {
      setActiveTab(currentTab as ITabKey);
    } else {
      // Redirect any other tab to profile
      router.replace(`/project/${projectId}?tab=profile`, {
        scroll: false,
      });
    }
  }, [searchParams, projectId, router]);

  const handleTabChange = useCallback(
    (tabKey: string) => {
      router.push(`/project/${projectId}?tab=${tabKey}`, {
        scroll: false,
      });
    },
    [router, projectId],
  );

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/create`);
  }, [router, projectId]);

  const handleOpenModal = useCallback(
    (
      itemKey: IPocItemKey,
      contentType?: 'viewItemProposal' | 'submitPropose',
    ) => {
      setSelectedItemKey(itemKey);
      setModalContentType(contentType || 'viewItemProposal');
      requestAnimationFrame(() => {
        setIsModalOpen(true);
      });
    },
    [],
  );

  useEffect(() => {
    const notificationType = searchParams.get('notificationType');
    const itemName = searchParams.get('itemName');

    if (
      notificationType === 'viewSubmission' &&
      itemName &&
      isProposalsFetched
    ) {
      // itemName = notification.itemProposal?.key
      const itemKey = itemName as IPocItemKey;

      if (itemKey in AllItemConfig) {
        setTimeout(() => {
          handleOpenModal(itemKey, 'viewItemProposal');
        }, 0);

        //  clear url params to avoid duplicate trigger
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('notificationType');
        newParams.delete('itemName');

        router.replace(`/project/${projectId}?${newParams.toString()}`, {
          scroll: false,
        });
      }
    }
  }, [searchParams, projectId, router, isProposalsFetched, handleOpenModal]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemKey(null);
    setModalContentType('viewItemProposal');
  }, []);

  const onSubmitEntry = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    setModalContentType('submitPropose');
  }, [profile, showAuthPrompt]);

  // Handle Metric click
  const handleMetricClick = useCallback(
    (metric: string) => {
      openMetricModal(metric);
    },
    [openMetricModal],
  );

  return (
    <div className="pb-[20px]">
      <BackHeader>
        <div className="flex justify-start gap-[10px]">
          <span>Projects</span>
          <span className="font-[600]">/</span>
          {isProjectFetched ? (
            <span>{getLeadingProjectName()}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      <ProjectDetailCard
        project={project}
        getLeadingProjectName={getLeadingProjectName}
        getLeadingTagline={getLeadingTagline}
        getLeadingCategories={getLeadingCategories}
        getLeadingLogoUrl={getLeadingLogoUrl}
      />

      <ProjectTopBannerAd />

      <div className="mobile:mx-[10px] mx-[20px] mt-[20px] flex flex-wrap items-center justify-between gap-[10px]">
        <ProjectTabs
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <TransparentScore
          isDataFetched={isProjectFetched}
          itemsTopWeight={project?.itemsTopWeight || {}}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ProjectDetailTable
              projectId={Number(projectId)}
              isProposalsLoading={isProposalsLoading}
              isProposalsFetched={isProposalsFetched}
              onSubmitProposal={onSubmitProposal}
              onOpenModal={handleOpenModal}
              onMetricClick={handleMetricClick}
            />
          </motion.div>
        )}
        {activeTab === 'contributing-funds' && (
          <motion.div
            key="contributing-funds"
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ContributingFunds
              projectId={Number(projectId)}
              onOpenModal={handleOpenModal}
            />
          </motion.div>
        )}
        {activeTab === 'ecosystem' && (
          <motion.div
            key="ecosystem"
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Ecosystem
              projectId={Number(projectId)}
              onOpenModal={handleOpenModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectDetailMainModal
        isOpen={isModalOpen && !!selectedItemKey}
        onClose={handleCloseModal}
        contentType={modalContentType}
        onSubmitEntry={onSubmitEntry}
        itemKey={selectedItemKey as IPocItemKey}
        setModalContentType={setModalContentType}
        initialTab="submission-queue"
      />

      <ReferenceModal
        fieldKey={currentRefKey as IPocItemKey}
        isOpen={openReferenceModal}
        onClose={closeReferenceModal}
        ref={currentRefValue || ''}
        reason={currentItemReason}
      />

      <SubmitterModal
        isOpen={isSubmitterModalOpen}
        onClose={handleCloseSubmitterModal}
        submitter={selectedSubmitter}
        validatedAt={selectedValidatedAt}
      />
    </div>
  );
};

export default ProjectPage;
