'use client';

import { Skeleton } from '@heroui/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useMetricDetailModal } from '@/components/biz/modal/metricDetail/Context';
import BackHeader from '@/components/pages/project/BackHeader';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import Ecosystem from '@/components/pages/project/detail/Ecosystem';
import ProjectDetailMainModal from '@/components/pages/project/detail/modal';
import ReferenceModal from '@/components/pages/project/detail/modal/reference';
import SubmitterModal from '@/components/pages/project/detail/modal/Submitter';
import Profile from '@/components/pages/project/detail/Profile';
import ProjectDetailCard from '@/components/pages/project/detail/ProjectDetailCard';
import Review from '@/components/pages/project/detail/Review';
import ProjectDetailTable from '@/components/pages/project/detail/table/ProjectDetailTable';
import { useAuth } from '@/context/AuthContext';
import { IPocItemKey } from '@/types/item';

const tabItems = [
  { key: 'project-data', label: 'Profile' },
  // { key: 'ecosystem', label: 'Ecosystem' },
  // { key: 'profile', label: 'Profile' },
  // { key: 'review', label: 'Review' },
];

export type ITabKey = 'project-data' | 'ecosystem' | 'profile' | 'review';
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
  } = useProjectDetailContext();

  const [modalContentType, setModalContentType] =
    useState<IModalContentType>('viewItemProposal');

  const [activeTab, setActiveTab] = useState<ITabKey>('project-data');

  // SwitchVoteModal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemKey, setSelectedItemKey] = useState<IPocItemKey | null>(
    null,
  );

  // MerrticDetailModal state management - use Context
  const { openMetricModal } = useMetricDetailModal();

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    // Only allow project-data tab, redirect disabled tabs to project-data
    if (currentTab === 'project-data') {
      setActiveTab(currentTab as ITabKey);
    } else {
      // Redirect any other tab (including disabled ones) to project-data
      router.replace(`/project/${projectId}?tab=project-data`, {
        scroll: false,
      });
    }
  }, [searchParams, projectId, router]);

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/create`);
  }, [router, projectId]);

  // Handle SwitchVoteModal open
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

  // Handle SwitchVoteModal close
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
            <span>{project?.name}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      <ProjectDetailCard project={project} />

      {activeTab === 'project-data' && (
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
      {activeTab === 'profile' && <Profile projectId={Number(projectId)} />}
      {activeTab === 'review' && <Review projectId={Number(projectId)} />}

      <ProjectDetailMainModal
        isOpen={isModalOpen && !!selectedItemKey}
        onClose={handleCloseModal}
        contentType={modalContentType}
        onSubmitEntry={onSubmitEntry}
        itemKey={selectedItemKey as IPocItemKey}
        setModalContentType={setModalContentType}
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
