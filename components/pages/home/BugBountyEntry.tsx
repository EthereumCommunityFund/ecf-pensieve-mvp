'use client';
import { X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CoinVerticalIcon } from '@/components/icons';

const DISMISS_STORAGE_KEY = 'bugBountyModalDismissed';

type BugBountyCardProps = {
  className: string;
  onClose: () => void;
  onRead: () => void;
  onPropose: () => void;
  onOverview: () => void;
  onDismiss?: () => void;
};

const BugBountyCard = ({
  className,
  onClose,
  onRead,
  onPropose,
  onOverview,
  onDismiss,
}: BugBountyCardProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex size-[32px] items-center justify-center rounded-full bg-black/5">
            <CoinVerticalIcon className="text-black/80" />
          </div>
          <span className="font-mona max-w-[200px] text-[16px] font-[600] leading-[1.4] text-black/80">
            Perennial Grant Experiment Epoch 1
          </span>
        </div>
        <div className="-mr-[6px] flex items-center gap-[8px]">
          <button
            type="button"
            onClick={onClose}
            className="font-mona -ml-[8px] flex items-center gap-[6px] rounded-[5px] border border-black/10 bg-white px-[12px] py-[6px] text-[12px] font-[600] text-black/80 transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
            title="Close"
            aria-label="Close announcement"
          >
            <X size={18} weight="bold" />
            <span>Close</span>
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="font-mona flex max-w-[110px] items-start gap-[4px] rounded-[5px] border border-black/10 bg-white/60 px-[10px] py-[6px] text-left text-[12px] font-[600] leading-tight text-black/80 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
              title="Don't show again"
              aria-label="Don't show this announcement again"
            >
              <X size={18} weight="bold" />
              <span className="flex flex-col leading-[1.1]">
                <span>Don’t show again</span>
              </span>
            </button>
          )}
        </div>
      </div>

      <p className="font-mona mt-[10px] text-[14px] leading-normal text-black">
        {`Rewarding Integrity, Not Noise.`}
        <br />
        {`The `}
        <span className="font-bold">Perennial Grant Experiment</span>
        {` is an open, evolving grant campaign, designed to make funding transparent, accountable, and community-owned from the ground up.`}
      </p>

      <div className="font-mona mt-[10px] border-t border-black/10 pt-[10px] text-[14px] leading-normal text-black">
        Campaign Pool: $800 USD per week,{' '}
        <span className="font-bold">for 10 weeks</span>
        <br />
        Starts: 12 PM CET, October 14th
        <br />
        Ends: 12 PM CET, December 23rd
      </div>

      <p className="font-mona mt-[10px] text-[10px] font-[500] leading-[1.4] tracking-[0.08em] text-black/30">
        Weekly 1 Awards-{' '}
        <span className="font-bold">Top Transparent Projects</span>: $400
        <br />
        <span className="font-bold">Top Accountable Projects</span>: $400
      </p>

      <button
        type="button"
        onClick={onRead}
        className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Read the Full Breakdown
      </button>
      <button
        type="button"
        onClick={onPropose}
        className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Propose a Project
      </button>
      <button
        type="button"
        onClick={onOverview}
        className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        What is Pensieve?
      </button>
    </div>
  );
};

const BugBountyEntry = () => {
  const [showDockCard, setShowDockCard] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const closeDockCard = useCallback(() => {
    setShowDockCard(false);
  }, []);

  const openDockCard = useCallback(() => {
    setShowDockCard(true);
  }, []);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const hasDismissed = window.localStorage.getItem(DISMISS_STORAGE_KEY);

    if (!hasDismissed) {
      setShowModal(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const dismissModal = useCallback(() => {
    setShowModal(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        DISMISS_STORAGE_KEY,
        new Date().toISOString(),
      );
    }
  }, []);

  const handleOpenGrantAnnouncement = useCallback(() => {
    closeDockCard();
    closeModal();
    const url = `https://medium.com/@EthereumECF/official-announcement-perennial-grant-experiment-epoch-1-8383dc15b0dd`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [closeDockCard, closeModal]);

  const handleNavigateToCreateProject = useCallback(() => {
    closeDockCard();
    closeModal();
    router.push('/project/create');
  }, [closeDockCard, closeModal, router]);

  const handleOpenPensieveOverview = useCallback(() => {
    closeDockCard();
    closeModal();
    const url = `https://ecf.wiki/s/ae77a12f-106c-429e-a7ed-8cca218bf20b`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [closeDockCard, closeModal]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-[16px] backdrop-blur-sm">
          <BugBountyCard
            className="relative w-full max-w-[460px] rounded-[10px] border border-black/10 bg-white/80 p-[14px] text-black shadow-[0_24px_48px_rgba(22,19,1,0.1)] backdrop-blur-[10px]"
            onClose={closeModal}
            onRead={handleOpenGrantAnnouncement}
            onPropose={handleNavigateToCreateProject}
            onOverview={handleOpenPensieveOverview}
            onDismiss={dismissModal}
          />
        </div>
      )}

      <div className="mobile:bottom-[100px] mobile:right-[12px] fixed bottom-[100px] right-[24px] z-[60]">
        {showDockCard ? (
          <BugBountyCard
            className="mobile:w-[calc(100vw-48px)] w-[360px] max-w-[360px] rounded-[10px] border border-black/10 bg-white/60 p-[14px] text-black shadow-[0_24px_48px_rgba(22,19,1,0.1)] backdrop-blur-[10px]"
            onClose={closeDockCard}
            onRead={handleOpenGrantAnnouncement}
            onPropose={handleNavigateToCreateProject}
            onOverview={handleOpenPensieveOverview}
          />
        ) : (
          <button
            type="button"
            onClick={openDockCard}
            className="mobile:w-full flex w-[320px] items-center justify-between gap-[10px] rounded-[10px] border border-black/10 bg-white/60 px-[14px] py-[12px] text-left text-black shadow-[0_20px_40px_rgba(22,19,1,0.08)] backdrop-blur-[10px] transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
          >
            <div className="flex items-center gap-[10px]">
              <div className="flex size-[32px] items-center justify-center rounded-full bg-black/5">
                <CoinVerticalIcon className="text-black/80" />
              </div>
              <span className="font-mona text-[16px] font-[600] leading-[1.6] text-black/80">
                Perennial Grant Experiment Epoch 1
              </span>
            </div>
            <span className="font-mona rounded-[5px] border border-black/10 bg-white/40 px-[10px] py-[6px] text-[14px] font-[600] leading-[1.6] text-black transition-colors">
              View
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default BugBountyEntry;
