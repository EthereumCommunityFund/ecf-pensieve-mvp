'use client';

import { useState } from 'react';

import ECFTypography from '@/components/base/typography';
import { PlusIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';

import ListCard from './ListCard';
import CreateListModal from './modals/CreateListModal';

const MyLists = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        console.log('devLog - getUserFollowedLists response:', data);
        return data;
      },
    });

  return (
    <div className="flex w-full flex-col gap-10">
      {/* My Lists Section */}
      <div className="flex flex-col gap-2">
        <ECFTypography
          type="subtitle2"
          className="text-[18px] font-medium leading-[28.8px] opacity-50"
        >
          My Lists:
        </ECFTypography>

        <div className="flex flex-col gap-10">
          {/* User's Lists */}
          <div className="flex flex-col gap-10">
            {userListsLoading ? (
              <div className="flex flex-col gap-10">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[120px] w-full animate-pulse rounded-[10px] bg-[rgba(0,0,0,0.05)]"
                  />
                ))}
              </div>
            ) : userLists && userLists.length > 0 ? (
              userLists.map((list) => (
                <ListCard key={list.id} list={list} showManagement={true} />
              ))
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <ECFTypography type="body1" className="text-center opacity-50">
                  You haven't created any lists yet
                </ECFTypography>
              </div>
            )}
          </div>

          {/* Create New List Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-between rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.03)] p-[8px_14px] transition-all hover:bg-[rgba(0,0,0,0.05)]"
          >
            <ECFTypography
              type="body1"
              className="text-[14px] font-semibold leading-[19px]"
            >
              Create New List
            </ECFTypography>
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      {/* Following Lists Section */}
      <div className="flex flex-col gap-2">
        <ECFTypography
          type="subtitle2"
          className="text-[18px] font-medium leading-[28.8px] opacity-50"
        >
          Following Lists:
        </ECFTypography>

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
            followedLists.map((list) => (
              <ListCard key={list.id} list={list} showManagement={false} />
            ))
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <ECFTypography type="body1" className="text-center opacity-50">
                You're not following any lists yet
              </ECFTypography>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default MyLists;
