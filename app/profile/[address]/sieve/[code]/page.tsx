'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import DeleteSieveModal from '@/app/profile/[address]/components/sieve/modals/DeleteSieveModal';
import EditSieveModal from '@/app/profile/[address]/components/sieve/modals/EditSieveModal';
import ShareSieveModal from '@/app/profile/[address]/components/sieve/modals/ShareSieveModal';
import { Button, addToast } from '@/components/base';
import FilterConditionsDisplay from '@/components/pages/sieve/FilterConditionsDisplay';
import SieveInfoSection from '@/components/pages/sieve/SieveInfoSection';
import SievePageSkeleton from '@/components/pages/sieve/SievePageSkeleton';
import SieveProjectResults from '@/components/pages/sieve/SieveProjectResults';
import { parseTargetPathToConditions } from '@/lib/services/sieveFilterService';
import { trpc } from '@/lib/trpc/client';
import type { StoredSieveFilterConditions } from '@/types/sieve';

type ActiveModal = 'edit' | 'share' | 'delete' | null;

const ManagementSievePage = () => {
  const params = useParams<{ address: string; code: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const code = params?.code ? String(params.code) : '';
  const address = params?.address ? String(params.address) : '';

  const closeModals = useCallback(() => {
    setActiveModal(null);
  }, []);

  const sieveQuery = trpc.sieve.getSieveByCode.useQuery(
    { code },
    {
      enabled: Boolean(code),
      retry: false,
      onError: (error) => {
        const errorCode = error.data?.code;
        if (errorCode === 'FORBIDDEN') {
          router.replace(`/sieve/${code}`);
          return;
        }
        if (errorCode === 'NOT_FOUND') {
          addToast({
            title: 'Feed not found',
            color: 'danger',
          });
          router.push(`/profile/${address}?tab=sieve`);
        }
      },
    },
  );

  const sieve = sieveQuery.data;

  const filterConditions: StoredSieveFilterConditions | null = useMemo(() => {
    if (sieve?.filterConditions) {
      return sieve.filterConditions;
    }
    if (sieve?.targetPath) {
      return parseTargetPathToConditions(sieve.targetPath);
    }
    return null;
  }, [sieve]);

  const invalidate = useCallback(() => {
    utils.sieve.getSieveByCode.invalidate({ code });
    utils.sieve.getUserSieves.invalidate();
  }, [code, utils]);

  const handleDeleted = useCallback(() => {
    closeModals();
    invalidate();
    router.push(`/profile/${address}?tab=sieve`);
  }, [address, closeModals, invalidate, router]);

  if (sieveQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1080px] px-[16px] py-[32px]">
        <SievePageSkeleton />
      </div>
    );
  }

  if (!sieve || !filterConditions) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-[16px] py-[48px] text-center">
        <h1 className="text-[22px] font-semibold text-black">
          Feed unavailable
        </h1>
        <p className="text-[14px] text-black/50">
          This feed could not be loaded. It may have been deleted or you might
          not have access.
        </p>
        <Button
          color="primary"
          className="mx-auto mt-[8px]"
          onPress={() => router.push(`/profile/${address}?tab=sieve`)}
        >
          Back to My Sieve
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-[20px] px-[16px] py-[32px]">
      <SieveInfoSection
        sieve={sieve}
        mode="management"
        actions={
          <>
            <Button size="sm" onPress={() => setActiveModal('edit')}>
              Edit Sieve
            </Button>
            <Button
              size="sm"
              color="secondary"
              onPress={() => setActiveModal('share')}
            >
              Share
            </Button>
            {/* <Button
              size="sm"
              color="danger"
              onPress={() => setActiveModal('delete')}
            >
              Delete
            </Button> */}
          </>
        }
      />

      <FilterConditionsDisplay conditions={filterConditions} />

      <SieveProjectResults conditions={filterConditions} mode="management" />

      {activeModal === 'edit' && (
        <EditSieveModal
          mode="edit"
          isOpen
          sieve={sieve}
          onClose={closeModals}
          onUpdated={() => {
            closeModals();
            invalidate();
          }}
        />
      )}

      {activeModal === 'share' && (
        <ShareSieveModal isOpen sieve={sieve} onClose={closeModals} />
      )}

      {activeModal === 'delete' && (
        <DeleteSieveModal
          isOpen
          sieve={sieve}
          onClose={closeModals}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default ManagementSievePage;
