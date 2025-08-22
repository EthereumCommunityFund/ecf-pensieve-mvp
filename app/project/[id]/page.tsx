'use client';

import { Skeleton } from '@heroui/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMetricDetailModal } from '@/components/biz/modal/metricDetail/Context';
import BackHeader from '@/components/pages/project/BackHeader';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import Ecosystem from '@/components/pages/project/detail/Ecosystem';
import ProjectDetailMainModal from '@/components/pages/project/detail/modal';
import ReferenceModal from '@/components/pages/project/detail/modal/reference';
import SubmitterModal from '@/components/pages/project/detail/modal/Submitter';
import ProjectDetailCard from '@/components/pages/project/detail/ProjectDetailCard';
import ProjectTabs from '@/components/pages/project/detail/ProjectTabs';
import Review from '@/components/pages/project/detail/Review';
import ProjectDetailTable from '@/components/pages/project/detail/table/ProjectDetailTable';
import TransparentScore from '@/components/pages/project/detail/TransparentScore';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IPocItemKey } from '@/types/item';

const tabItems = [
  { key: 'profile', label: 'Profile' },
  { key: 'ecosystem', label: 'Ecosystem' },
  { key: 'reviews', label: 'Reviews' },
];

export type ITabKey = 'profile' | 'ecosystem' | 'reviews';
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
    // Allow all three tabs: profile, ecosystem, reviews
    if (
      currentTab === 'profile' ||
      currentTab === 'ecosystem' ||
      currentTab === 'reviews'
    ) {
      setActiveTab(currentTab as ITabKey);
    } else {
      // Default to profile tab if no valid tab specified
      router.replace(`/project/${projectId}?tab=profile`, {
        scroll: false,
      });
    }
  }, [searchParams, projectId, router]);

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
        handleOpenModal(itemKey, 'viewItemProposal');

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

      <div className="tablet:px-[10px] mobile:px-[10px] mt-[30px] px-[20px]">
        <div className="flex items-center justify-between">
          <ProjectTabs
            tabs={tabItems}
            activeTab={activeTab}
            onTabChange={(tabKey) => {
              router.push(`/project/${projectId}?tab=${tabKey}`, {
                scroll: false,
              });
            }}
          />
          <div className="flex items-center gap-[8px]">
            <TransparentScore
              isDataFetched={isProjectFetched}
              itemsTopWeight={project?.itemsTopWeight || {}}
            />
          </div>
        </div>
      </div>

      {activeTab === 'profile' && (
        <ProjectDetailTable
          projectId={Number(projectId)}
          isProposalsLoading={isProposalsLoading}
          isProposalsFetched={isProposalsFetched}
          onSubmitProposal={onSubmitProposal}
          onOpenModal={handleOpenModal}
          onMetricClick={handleMetricClick}
        />
      )}
      {activeTab === 'ecosystem' && <Ecosystem projectId={Number(projectId)} />}
      {activeTab === 'reviews' && <Review projectId={Number(projectId)} />}

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
