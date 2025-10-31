'use client';

import { useMemo, useState } from 'react';

import { Button, addToast } from '@/components/base';
import { PlusIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
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

const MySieve = ({ profileAddress: _profileAddress }: MySieveProps) => {
  const [selected, setSelected] = useState<SieveRecord | null>(null);
  const [activeModal, setActiveModal] = useState<
    'edit' | 'share' | 'delete' | null
  >(null);

  const utils = trpc.useUtils();
  const { profile: authProfile } = useAuth();

  const normalizedProfileAddress = useMemo(
    () => _profileAddress.toLowerCase(),
    [_profileAddress],
  );

  const isOwner = useMemo(() => {
    const authAddress = authProfile?.address?.toLowerCase();
    if (!authAddress) {
      return false;
    }
    return authAddress === normalizedProfileAddress;
  }, [authProfile?.address, normalizedProfileAddress]);

  const ownerQuery = trpc.sieve.getUserSieves.useQuery(undefined, {
    enabled: isOwner,
    refetchOnWindowFocus: false,
  });

  const publicQuery = trpc.sieve.getPublicSievesByAddress.useQuery(
    { address: _profileAddress },
    {
      enabled: !isOwner,
      refetchOnWindowFocus: false,
    },
  );

  const sieves = isOwner ? ownerQuery.data : publicQuery.data;
  const isLoading = isOwner ? ownerQuery.isLoading : publicQuery.isLoading;
  const isFetching = isOwner ? ownerQuery.isFetching : publicQuery.isFetching;

  const hasSieve = useMemo(() => (sieves?.length ?? 0) > 0, [sieves]);

  const closeModals = () => {
    setActiveModal(null);
    setSelected(null);
  };

  const handleView = (sieve: SieveRecord) => {
    const targetUrl =
      sieve.share?.url ?? sieve.share?.targetUrl ?? sieve.targetPath;

    if (!targetUrl) {
      addToast({ title: 'Feed target unavailable', color: 'warning' });
      return;
    }

    const isAbsolute = /^https?:\/\//i.test(targetUrl);
    const resolvedUrl = isAbsolute
      ? targetUrl
      : `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;

    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleManage = (
    modal: 'edit' | 'share' | 'delete',
    sieve: SieveRecord,
  ) => {
    if (!isOwner) {
      return;
    }
    setSelected(sieve);
    setActiveModal(modal);
  };

  const invalidate = () => {
    utils.sieve.getUserSieves.invalidate();
    utils.sieve.getPublicSievesByAddress.invalidate({
      address: _profileAddress,
    });
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
                canManage={isOwner}
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
              {isOwner
                ? 'You haven&apos;t saved any feeds yet'
                : 'No public feeds available'}
            </p>
            <p className="text-[13px] text-black/50">
              {isOwner
                ? 'Head over to the Projects page, apply filters, and save them as a feed to see them listed here.'
                : 'This contributor has not shared any feeds publicly yet.'}
            </p>
            {isOwner ? (
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
            ) : null}
          </div>
        )}
      </div>

      {isOwner && selected && (
        <>
          <EditSieveModal
            isOpen={activeModal === 'edit'}
            sieve={selected}
            onClose={closeModals}
            onUpdated={invalidate}
          />
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
      )}
    </div>
  );
};

export default MySieve;
