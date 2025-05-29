'use client';

import { cn, Skeleton, Tab, Tabs } from '@heroui/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import BackHeader from '@/components/pages/project/BackHeader';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import ContributeButton from '@/components/pages/project/detail/ContributeButton';
import Ecosystem from '@/components/pages/project/detail/Ecosystem';
import ProjectDetailMainModal from '@/components/pages/project/detail/modal';
import ReferenceModal from '@/components/pages/project/detail/modal/reference';
import Profile from '@/components/pages/project/detail/Profile';
import ProjectDetailCard from '@/components/pages/project/detail/ProjectDetailCard';
import Review from '@/components/pages/project/detail/Review';
import ProjectDetailTable from '@/components/pages/project/detail/table/ProjectDetailTable';
import { IPocItemKey } from '@/types/item';

const tabItems = [
  { key: 'project-data', label: 'Project Data' },
  { key: 'ecosystem', label: 'Ecosystem' },
  { key: 'profile', label: 'Profile' },
  { key: 'review', label: 'Review' },
];

export type ITabKey = 'project-data' | 'ecosystem' | 'profile' | 'review';
export type IModalContentType = 'viewItemProposal' | 'submitPropose';

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  // 使用 Context 获取项目数据
  const {
    project,
    isProjectFetched,
    isProposalsLoading,
    isProposalsFetched,
    closeReferenceModal,
    currentRefKey,
    currentRefValue,
    openReferenceModal,
  } = useProjectDetailContext();

  const [modalContentType, setModalContentType] =
    useState<IModalContentType>('viewItemProposal');

  const [activeTab, setActiveTab] = useState<ITabKey>(
    initialTab === 'ecosystem' ||
      initialTab === 'profile' ||
      initialTab === 'review'
      ? initialTab
      : 'project-data',
  );

  // SwitchVoteModal 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemKey, setSelectedItemKey] = useState<IPocItemKey | null>(
    null,
  );

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (
      currentTab &&
      (currentTab === 'project-data' ||
        currentTab === 'ecosystem' ||
        currentTab === 'profile' ||
        currentTab === 'review')
    ) {
      setActiveTab(currentTab as ITabKey);
    } else if (!currentTab) {
      router.push(`/project/${projectId}?tab=project-data`, { scroll: false });
    }
  }, [searchParams, projectId, router]);

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/create`);
  }, [router, projectId]);

  const handleContribute = useCallback(() => {
    // 处理贡献按钮点击事件
    console.log('Contribute button clicked');
  }, []);

  // 处理 SwitchVoteModal 打开
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

  // 处理 SwitchVoteModal 关闭
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemKey(null);
    setContentType('viewItemProposal');
  }, []);

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

      <div className="tablet:px-[10px] mobile:px-[10px]  mt-[20px] px-[20px]">
        <div className="flex items-center justify-between">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => {
              const newTab = key as ITabKey;
              setActiveTab(newTab);
              router.push(`/project/${projectId}?tab=${newTab}`, {
                scroll: false,
              });
            }}
            variant="underlined"
            // className="w-full"
            classNames={{
              tabList: 'w-full border-b border-[rgba(0,0,0,0.1)] gap-[20px]',
              tab: 'w-fit flex justify-start items-center',
              cursor:
                'bg-black w-[102%] bottom-[-4px] left-[-4px] right-[-4px]',
              tabContent: 'font-semibold',
            }}
          >
            {tabItems.map(({ key, label }) => (
              <Tab
                key={key}
                title={
                  <ECFTypography
                    type="body1"
                    className={cn(
                      'font-semibold',
                      activeTab === key ? 'opacity-100' : 'opacity-60',
                    )}
                  >
                    {label}
                  </ECFTypography>
                }
              />
            ))}
          </Tabs>
          <ContributeButton onClick={handleContribute} />
        </div>
      </div>

      {activeTab === 'project-data' && (
        <ProjectDetailTable
          projectId={Number(projectId)}
          isProposalsLoading={isProposalsLoading}
          isProposalsFetched={isProposalsFetched}
          onSubmitProposal={onSubmitProposal}
          onOpenModal={handleOpenModal}
        />
      )}
      {activeTab === 'ecosystem' && <Ecosystem projectId={Number(projectId)} />}
      {activeTab === 'profile' && <Profile projectId={Number(projectId)} />}
      {activeTab === 'review' && <Review projectId={Number(projectId)} />}

      <ProjectDetailMainModal
        isOpen={isModalOpen && !!selectedItemKey}
        onClose={handleCloseModal}
        contentType={modalContentType}
        onSubmitEntry={() => {
          console.log('Submit entry for item:', selectedItemKey);
          setModalContentType('submitPropose');
        }}
        itemKey={selectedItemKey as IPocItemKey}
        setModalContentType={setModalContentType}
      />

      <ReferenceModal
        fieldKey={currentRefKey as IPocItemKey}
        isOpen={openReferenceModal}
        onClose={closeReferenceModal}
        ref={currentRefValue || ''}
      />
    </div>
  );
};

export default ProjectPage;
