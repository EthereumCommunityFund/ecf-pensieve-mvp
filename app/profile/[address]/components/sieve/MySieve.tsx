'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/base';
import { PlusIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

import SieveCard from './SieveCard';
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

  const {
    data: sieves,
    isLoading,
    isFetching,
  } = trpc.sieve.getUserSieves.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const hasSieve = useMemo(() => (sieves?.length ?? 0) > 0, [sieves]);

  const closeModals = () => {
    setActiveModal(null);
    setSelected(null);
  };

  const invalidate = () => {
    utils.sieve.getUserSieves.invalidate();
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
              <div
                key={index}
                className="flex flex-col gap-[8px] rounded-[10px] border border-black/10 bg-white p-[14px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
              >
                <div className="h-[14px] w-[140px] animate-pulse rounded bg-[#E4E4E4]" />
                <div className="h-[12px] w-[220px] animate-pulse rounded bg-[#EEEEEE]" />
                <div className="flex gap-[6px]">
                  <div className="h-[20px] w-[80px] animate-pulse rounded-full bg-[#EDEDED]" />
                  <div className="h-[20px] w-[70px] animate-pulse rounded-full bg-[#EDEDED]" />
                </div>
              </div>
            ))}
          </div>
        ) : hasSieve ? (
          <div className="flex flex-col gap-[10px]">
            {sieves?.map((sieve) => (
              <SieveCard
                key={sieve.id}
                sieve={sieve}
                onEdit={() => {
                  setSelected(sieve);
                  setActiveModal('edit');
                }}
                onShare={() => {
                  setSelected(sieve);
                  setActiveModal('share');
                }}
                onDelete={() => {
                  setSelected(sieve);
                  setActiveModal('delete');
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
              feed to see them listed here.
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

      {selected && (
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
