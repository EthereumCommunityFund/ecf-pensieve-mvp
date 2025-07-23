'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from '@heroui/react';
import {
  ArrowLeft,
  DotsSixVertical,
  DotsThreeVertical,
  Globe,
  Lock,
  PencilSimple,
  Plus,
  ShareNetwork,
  Trash,
} from '@phosphor-icons/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import ECFTypography from '@/components/base/typography';
import { trpc } from '@/lib/trpc/client';

import DeleteListModal from '../../components/modals/DeleteListModal';
import EditListModal from '../../components/modals/EditListModal';
import ShareListModal from '../../components/modals/ShareListModal';

const ListDetailPage = () => {
  const { address, slug } = useParams();
  const router = useRouter();
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch list details
  const {
    data: list,
    isLoading,
    error,
  } = trpc.list.getListBySlug.useQuery(
    {
      slug: slug as string,
    },
    {
      retry: false, // Don't retry on 403
      select: (data) => {
        console.log('devLog - getListBySlug response:', data);
        return data;
      },
    },
  );

  // Fetch list items (projects)
  const { data: listData, isLoading: itemsLoading } =
    trpc.list.getListProjects.useQuery(
      {
        slug: slug as string,
      },
      {
        enabled: !!list?.id && !error,
        select: (data) => {
          console.log('devLog - getListProjects response:', data);
          return data;
        },
      },
    );

  const listItems = listData?.items;

  const handleBack = () => {
    router.push(`/profile/${address}?tab=lists`);
  };

  const getPrivacyIcon = () => {
    if (!list) return null;
    return list.privacy === 'private' ? (
      <Lock size={20} className="opacity-60" />
    ) : (
      <Globe size={20} className="opacity-60" />
    );
  };

  const getPrivacyText = () => {
    if (!list) return '';
    return list.privacy === 'private' ? 'Private' : 'Public';
  };

  // Check if current user is the owner
  const isOwner = true; // TODO: Implement actual ownership check

  if (isLoading) {
    return (
      <div className="mobile:px-[10px] px-[40px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16 pt-8">
          <Skeleton className="h-[40px] w-[200px] rounded-[8px]" />
          <Skeleton className="h-[100px] w-full rounded-[10px]" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[80px] w-full rounded-[10px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !list) {
    const isForbidden = error?.data?.code === 'FORBIDDEN';

    return (
      <div className="mobile:px-[10px] px-[40px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 pb-16 pt-8">
          <ECFTypography type="subtitle1">
            {isForbidden ? 'Access Denied' : 'List not found'}
          </ECFTypography>
          <ECFTypography type="body1" className="text-center opacity-60">
            {isForbidden
              ? "This is a private list and you don't have permission to view it."
              : 'This list may not exist or has been deleted.'}
          </ECFTypography>
          <Button
            onPress={handleBack}
            variant="light"
            startContent={<ArrowLeft size={20} />}
          >
            Back to Lists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile:px-[10px] px-[40px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onPress={handleBack}
            variant="light"
            startContent={<ArrowLeft size={20} />}
            className="text-black hover:bg-[rgba(0,0,0,0.05)]"
          >
            Back to Lists
          </Button>

          {isOwner && (
            <div className="flex items-center gap-3">
              {/* Management Mode Toggle */}
              <Button
                onPress={() => setIsManagementMode(!isManagementMode)}
                variant={isManagementMode ? 'solid' : 'light'}
                className={
                  isManagementMode
                    ? 'bg-black text-white'
                    : 'bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.1)]'
                }
              >
                {isManagementMode ? 'Exit Management' : 'Manage Projects'}
              </Button>

              {/* List Actions Dropdown */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="light"
                    className="bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)]"
                  >
                    <DotsThreeVertical size={20} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="List actions">
                  <DropdownItem
                    key="edit"
                    onPress={() => setShowEditModal(true)}
                    startContent={<PencilSimple size={18} />}
                  >
                    Edit List
                  </DropdownItem>
                  <DropdownItem
                    key="share"
                    onPress={() => setShowShareModal(true)}
                    startContent={<ShareNetwork size={18} />}
                  >
                    Share List
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    onPress={() => setShowDeleteModal(true)}
                    startContent={<Trash size={18} />}
                    className="text-danger"
                    color="danger"
                  >
                    Delete List
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </div>

        {/* List Info */}
        <div className="flex flex-col gap-4 rounded-[10px] bg-[rgba(0,0,0,0.03)] p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <ECFTypography type="subtitle1" className="font-semibold">
                {list.name}
              </ECFTypography>
              {list.description && (
                <ECFTypography type="body1" className="opacity-80">
                  {list.description}
                </ECFTypography>
              )}
            </div>
          </div>

          {/* Privacy Status and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPrivacyIcon()}
              <ECFTypography type="body2" className="font-semibold opacity-60">
                {getPrivacyText()}
              </ECFTypography>
            </div>
            <div className="flex items-center gap-4">
              <ECFTypography type="body2" className="opacity-60">
                {listItems?.length || 0} projects
              </ECFTypography>
              <ECFTypography type="body2" className="opacity-60">
                Created {new Date(list.createdAt).toLocaleDateString()}
              </ECFTypography>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <ECFTypography type="subtitle2" className="opacity-60">
              Projects in this list:
            </ECFTypography>
            {isOwner && !isManagementMode && (
              <Button
                startContent={<Plus size={20} />}
                className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.1)]"
                variant="light"
              >
                Add Project
              </Button>
            )}
          </div>

          {/* Projects List */}
          <div className="flex flex-col gap-3">
            {itemsLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[80px] w-full rounded-[10px]"
                  />
                ))}
              </div>
            ) : listItems && listItems.length > 0 ? (
              listItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-4 rounded-[10px] bg-[rgba(0,0,0,0.05)] p-4 transition-all hover:bg-[rgba(0,0,0,0.08)]"
                >
                  {/* Drag Handle - Only visible in management mode */}
                  {isManagementMode && (
                    <div className="cursor-grab opacity-40 hover:opacity-60">
                      <DotsSixVertical size={20} />
                    </div>
                  )}

                  {/* Project Info */}
                  <div className="flex flex-1 flex-col gap-1">
                    <ECFTypography type="body1" className="font-semibold">
                      {item.project.name}
                    </ECFTypography>
                    <ECFTypography type="body2" className="opacity-60">
                      {item.project.tagline || 'No description available'}
                    </ECFTypography>
                  </div>

                  {/* Order Number */}
                  <div className="flex items-center gap-2">
                    <ECFTypography type="caption" className="opacity-40">
                      #{index + 1}
                    </ECFTypography>
                  </div>

                  {/* Remove Button - Only visible in management mode */}
                  {isManagementMode && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="opacity-40 hover:bg-red-100 hover:text-red-600 hover:opacity-100"
                      onPress={() => {
                        // TODO: Implement remove project from list
                        console.log(
                          'Remove project from list:',
                          item.projectId,
                        );
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-4 py-12">
                <ECFTypography type="body1" className="text-center opacity-50">
                  No projects in this list yet
                </ECFTypography>
                {isOwner && (
                  <Button
                    startContent={<Plus size={20} />}
                    className="bg-black text-white hover:bg-[rgba(0,0,0,0.8)]"
                  >
                    Add Your First Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <EditListModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          list={list}
        />

        <DeleteListModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          list={list}
        />

        <ShareListModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          list={list}
        />
      </div>
    </div>
  );
};

export default ListDetailPage;
