'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, addToast } from '@/components/base';
import { PlusIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

import SieveCard from './SieveCard';
import SieveCardSkeleton from './SieveCardSkeleton';
import DeleteSieveModal from './modals/DeleteSieveModal';
import EditSieveModal from './modals/EditSieveModal';
import ShareSieveModal from './modals/ShareSieveModal';

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

interface MySieveProps {
  profileAddress: string;
}

const MySieve = ({ profileAddress }: MySieveProps) => {
  const [selected, setSelected] = useState<SieveRecord | null>(null);
  const [activeModal, setActiveModal] = useState<
    'edit' | 'share' | 'delete' | 'create' | null
  >(null);
  const [pendingUnfollowId, setPendingUnfollowId] = useState<number | null>(
    null,
  );

  const router = useRouter();

  const utils = trpc.useUtils();
  const ownerQuery = trpc.sieve.getUserSieves.useQuery(undefined, {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const followedQuery = trpc.sieve.getUserFollowedSieves.useQuery(undefined, {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const unfollowMutation = trpc.sieve.unfollowSieve.useMutation({
    onMutate: (variables) => {
      setPendingUnfollowId(variables.sieveId);
    },
    onSuccess: () => {
      utils.sieve.getUserFollowedSieves.invalidate();
    },
    onError: (error) => {
      addToast({
        title: error.message || 'Failed to unfollow sieve',
        color: 'danger',
      });
    },
    onSettled: () => {
      setPendingUnfollowId(null);
    },
  });

  const sieves = ownerQuery.data ?? [];
  const isLoading = ownerQuery.isLoading;
  const isFetching = ownerQuery.isFetching;

  const hasSieve = sieves.length > 0;

  const closeModals = () => {
    setActiveModal(null);
    setSelected(null);
  };

  const handleView = (sieve: SieveRecord) => {
    const shareCode = sieve.share?.code;

    if (!shareCode) {
      addToast({ title: 'Sieve link unavailable', color: 'warning' });
      return;
    }

    router.push(`/profile/${profileAddress}/sieve/${shareCode}`);
  };

  const handleViewPublic = (sieve: SieveRecord) => {
    const shareCode = sieve.share?.code;

    if (!shareCode) {
      addToast({ title: 'Sieve target unavailable', color: 'warning' });
      return;
    }

    const publicUrl = `/sieve/${shareCode}`;
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
  };

  const handleManage = (
    modal: 'edit' | 'share' | 'delete',
    sieve: SieveRecord,
  ) => {
    setSelected(sieve);
    setActiveModal(modal);
  };

  const handleCreate = () => {
    setSelected(null);
    setActiveModal('create');
  };

  const invalidate = () => {
    utils.sieve.getUserSieves.invalidate();
    utils.sieve.getUserFollowedSieves.invalidate();
  };

  const followedSieves = followedQuery.data ?? [];
  const isFollowedLoading = followedQuery.isLoading || followedQuery.isFetching;

  const handleUnfollow = (sieveId: number) => {
    unfollowMutation.mutate({ sieveId });
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex flex-col gap-[10px]">
        <p className="font-mona text-[18px] font-[500] leading-[1.6] text-black/50">
          My Sieve:
        </p>

        {isLoading || isFetching ? (
          <div className="flex flex-col gap-[12px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <SieveCardSkeleton key={index} />
            ))}
          </div>
        ) : hasSieve ? (
          <div className="flex flex-col gap-[10px]">
            {sieves?.map((sieve) => (
              <SieveCard
                key={sieve.id}
                canManage
                sieve={sieve}
                onView={handleView}
                onEdit={() => {
                  handleManage('edit', sieve);
                }}
                onShare={() => {
                  handleManage('share', sieve);
                }}
                onDelete={() => {
                  handleManage('delete', sieve);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[10px] border border-dashed border-black/10 bg-white p-8 text-center">
            <p className="text-[16px] font-semibold text-black/70">
              You haven&apos;t saved any feeds yet
            </p>
            <p className="text-[13px] text-black/50">
              Head over to the Projects page, apply filters, and save them as a
              sieve to see them listed here.
            </p>
            <Button
              color="primary"
              onPress={() => {
                window.open('/projects', '_blank');
              }}
              className="flex items-center gap-[6px]"
            >
              <PlusIcon size={16} />
              Explore Projects
            </Button>
          </div>
        )}
      </div>

      {!isLoading && !isFetching ? (
        <div className="flex w-full justify-start">
          <Button
            color="primary"
            onPress={handleCreate}
            className="flex items-center gap-[6px]"
          >
            New Sieve
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-[10px]">
        <p className="font-mona text-[18px] font-[500] leading-[1.6] text-black/50">
          Following Sieves:
        </p>

        {isFollowedLoading ? (
          <div className="flex flex-col gap-[12px]">
            {Array.from({ length: 2 }).map((_, index) => (
              <SieveCardSkeleton key={`followed-skeleton-${index}`} />
            ))}
          </div>
        ) : followedSieves.length > 0 ? (
          <div className="flex flex-col gap-[12px]">
            {followedSieves.map((sieve) => (
              <SieveCard
                key={`followed-${sieve.id}`}
                canManage={false}
                sieve={sieve}
                onView={() => handleViewPublic(sieve)}
                extraActions={
                  <Button
                    size="sm"
                    color="primary"
                    onPress={() => handleUnfollow(sieve.id)}
                    isDisabled={
                      unfollowMutation.isPending &&
                      pendingUnfollowId !== sieve.id
                    }
                    isLoading={
                      unfollowMutation.isPending &&
                      pendingUnfollowId === sieve.id
                    }
                  >
                    Unfollow
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[10px] border border-dashed border-black/10 bg-white p-8 text-center">
            <p className="text-[16px] font-semibold text-black/70">
              You haven&apos;t followed any feeds yet
            </p>
            <p className="text-[13px] text-black/50">
              Discover community feeds on the Projects page and follow the ones
              you find useful.
            </p>
            <Button
              color="primary"
              onPress={() => {
                window.open('/projects', '_blank');
              }}
              className="flex items-center gap-[6px]"
            >
              <PlusIcon size={16} />
              Explore Projects
            </Button>
          </div>
        )}
      </div>

      {(activeModal === 'edit' || activeModal === 'create') && (
        <EditSieveModal
          mode={activeModal === 'create' ? 'create' : 'edit'}
          isOpen={activeModal === 'edit' || activeModal === 'create'}
          sieve={activeModal === 'edit' ? selected : null}
          onClose={closeModals}
          onUpdated={invalidate}
        />
      )}

      {selected ? (
        <>
          <ShareSieveModal
            isOpen={activeModal === 'share'}
            sieve={selected}
            onClose={closeModals}
          />
          <DeleteSieveModal
            isOpen={activeModal === 'delete'}
            sieve={selected}
            onClose={closeModals}
            onDeleted={invalidate}
          />
        </>
      ) : null}
    </div>
  );
};

export default MySieve;
