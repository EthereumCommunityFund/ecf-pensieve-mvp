'use client';

import { useState } from 'react';

import { PlusIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';
import { devLog } from '@/utils/devLog';

import CommonListCard from './CommonListCard';
import FollowListCard from './FollowListCard';
import CreateListModal from './modals/CreateListModal';
import DeleteListModal from './modals/DeleteListModal';
import EditListModal from './modals/EditListModal';
import ShareListModal from './modals/ShareListModal';

const MyLists = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedList, setSelectedList] = useState<
    RouterOutputs['list']['getUserLists'][0] | null
  >(null);

  // Fetch user's own lists
  const { data: userLists, isLoading: userListsLoading } =
    trpc.list.getUserLists.useQuery(undefined, {
      select: (data) => {
        console.log('devLog - getUserLists response:', data);
        return data;
      },
    });

  // Fetch user's followed lists
  const { data: followedLists, isLoading: followedListsLoading } =
    trpc.list.getUserFollowedLists.useQuery(undefined, {
      select: (data) => {
        devLog('devLog - getUserFollowedLists response:', data);
        return data;
      },
    });

  return (
    <div className="flex w-full flex-col gap-10">
      {/* My Lists Section */}
      <div className="flex flex-col gap-[10px]">
        <p className="font-mona text-[18px] font-[500] leading-[1.6] text-black/50">
          My Lists:
        </p>

        <div className="flex flex-col gap-[10px]">
          {/* User's Lists */}
          <div className="flex flex-col gap-[10px]">
            {userListsLoading ? (
              <div className="flex flex-col gap-[10px]">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[120px] w-full animate-pulse rounded-[10px] bg-[rgba(0,0,0,0.05)]"
                  />
                ))}
              </div>
            ) : userLists && userLists.length > 0 ? (
              userLists.map((list, index) => (
                <CommonListCard
                  key={list.id}
                  list={list}
                  showBorderBottom={index < userLists.length - 1}
                  onEdit={() => {
                    setSelectedList(list);
                    setShowEditModal(true);
                  }}
                  onShare={() => {
                    setSelectedList(list);
                    setShowShareModal(true);
                  }}
                  onDelete={() => {
                    setSelectedList(list);
                    setShowDeleteModal(true);
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-center opacity-50">
                  You haven't created any lists yet
                </p>
              </div>
            )}
          </div>

          {/* Create New List Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-between rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.03)] p-[8px_14px] transition-all hover:bg-[rgba(0,0,0,0.05)]"
          >
            <p className="text-[14px] font-semibold leading-[19px]">
              Create New List
            </p>
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      {/* Following Lists Section */}
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-medium leading-[28.8px] opacity-50">
          Following Lists:
        </p>

        <div className="flex flex-col gap-10">
          {followedListsLoading ? (
            <div className="flex flex-col gap-10">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[120px] w-full animate-pulse rounded-[10px] bg-[rgba(0,0,0,0.05)]"
                />
              ))}
            </div>
          ) : followedLists && followedLists.length > 0 ? (
            followedLists.map((list, index) => (
              <FollowListCard
                key={list.id}
                list={list}
                showBorderBottom={index < followedLists.length - 1}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-center opacity-50">
                You're not following any lists yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {selectedList && (
        <>
          <EditListModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedList(null);
            }}
            list={selectedList}
          />

          <DeleteListModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedList(null);
            }}
            list={selectedList}
          />

          <ShareListModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setSelectedList(null);
            }}
            list={selectedList}
          />
        </>
      )}
    </div>
  );
};

export default MyLists;
