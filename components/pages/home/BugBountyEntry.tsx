'use client';
import { Leaf, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';

import { useAuth } from '@/context/AuthContext';

const DISMISS_STORAGE_KEY = 'bugBountyModalDismissed';

type BugBountyCardProps = {
  className: string;
  style?: CSSProperties;
  onClose: () => void;
  onRead: () => void;
  onPropose: () => void;
  onFilteredTransparent: () => void;
  onFilteredAccountable: () => void;
  onDismiss?: () => void;
  ctaVariant?: 'modal' | 'dock';
};

const BugBountyCard = ({
  className,
  style,
  onClose,
  onRead,
  onPropose,
  onFilteredTransparent,
  onFilteredAccountable,
  onDismiss,
  ctaVariant = 'modal',
}: BugBountyCardProps) => {
  const filteredTransparentLabel =
    ctaVariant === 'modal'
      ? 'Transparent Rank for Perennial Grant'
      : 'Transparent Rank for Perennial Grant';

  const filteredAccountableLabel =
    ctaVariant === 'modal'
      ? 'Accountable Rank for Perennial Grant'
      : 'Accountable Rank for Perennial Grant';

  return (
    <div className={className} style={style}>
      <div className="relative z-[1] flex flex-col gap-[10px]">
        <div className="mobile:flex absolute right-[-8px] top-[-8px] hidden items-center justify-end gap-[10px]">
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="font-mona rounded-[6px] border border-black/10 bg-white/60 px-[10px] py-[6px] text-[12px] font-[600] leading-[1.2] text-black/70 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
              title="Don't show again"
            >
              Don’t show again
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex size-[36px] items-center justify-center rounded-[6px] border border-black/10 bg-white/45 text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
            title="Close"
            aria-label="Close announcement"
          >
            <X size={18} weight="bold" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-[10px]">
          <div className="flex items-center gap-[10px]">
            <div className="relative flex size-[36px] items-center justify-center">
              <Leaf
                className="relative text-[#A0D7BF]"
                size={34}
                weight="fill"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col ">
              <div>
                <span className="font-mona h-[22px] rounded-[4px] bg-[#AAE1C9] px-[6px] py-[2px]  text-[11px] font-[700] leading-[1.6] text-black/80">
                  Epoch 1
                </span>
              </div>
              <span className="font-mona text-[14px] font-[600] leading-[1.6] text-black/80">
                Perennial Grant Experiment
              </span>
            </div>
          </div>
          <div className="mobile:hidden flex items-center justify-end gap-[10px]">
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="font-mona rounded-[6px] border border-black/10 bg-white/60 px-[10px] py-[6px] text-[12px] font-[600] leading-[1.2] text-black/70 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
                title="Don't show again"
              >
                Don’t show again
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex size-[36px] items-center justify-center rounded-[6px] border border-black/10 bg-white/45 text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
              title="Close"
              aria-label="Close announcement"
            >
              <X size={18} weight="bold" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        <p className="font-mona text-[14px] leading-[1.6] text-black">
          {`Rewarding Integrity, Not Noise.`}
          <br />
          {`The `}
          <span className="font-bold">Perennial Grant Experiment</span>
          {` is an open, evolving grant campaign, designed to make funding transparent, accountable, and community-owned from the ground up.`}
        </p>

        <div className="font-mona rounded-[8px] border-t border-black/10 pt-[12px] text-[13px] leading-[1.6] text-black">
          <span className="font-bold">Campaign Pool:</span>
          {` $800 USD per week, `}
          <span className="font-bold">for 10 weeks</span>
          <br />
          <span className="font-bold">Starts:</span>
          {` 12 PM CET, October 14th`}
          <br />
          <span className="font-bold">Ends:</span>
          {` 12 PM CET, December 23rd`}
        </div>

        <p className="font-mona text-[10px] font-[500] leading-normal tracking-[0.14em] text-black/35">
          Weekly 5 Awards-{' '}
          <span className="font-bold">Top Transparent Projects</span>: $400
          <br />
          <span className="font-bold">Top Accountable Projects</span>: $400
        </p>

        <div className="flex-gcol flex gap-[10px]">
          <button
            type="button"
            onClick={onRead}
            className="font-mona flex h-[44px] w-full items-center justify-center rounded-[6px] border border-black/10 bg-white/45 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-[rgba(170,225,201,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Read the Full Breakdown
          </button>
          <button
            type="button"
            onClick={onPropose}
            className="font-mona flex h-[44px] w-full items-center justify-center rounded-[6px] border border-black/10 bg-white/45 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-[rgba(170,225,201,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Propose a Project
          </button>
          <button
            type="button"
            onClick={onFilteredTransparent}
            className="font-mona flex h-[44px] w-full items-center justify-center rounded-[6px] border border-black/10 bg-white/45 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-[rgba(170,225,201,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {filteredTransparentLabel}
          </button>
          <button
            type="button"
            onClick={onFilteredAccountable}
            className="font-mona flex h-[44px] w-full items-center justify-center rounded-[6px] border border-black/10 bg-white/45 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-[rgba(170,225,201,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {filteredAccountableLabel}
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-[160px] right-[-220px] size-[420px] rounded-full bg-[radial-gradient(circle,_rgba(132,255,205,0.35)_0%,_rgba(255,255,255,0)_65%)]" />
      <div className="pointer-events-none absolute -left-[120px] top-[-200px] size-[360px] rounded-full bg-[radial-gradient(circle,_rgba(236,250,213,0.35)_0%,_rgba(255,255,255,0)_70%)]" />
    </div>
  );
};

const BugBountyEntry = () => {
  const [showDockCard, setShowDockCard] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { profile, showAuthPrompt } = useAuth();

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
    if (!profile) {
      showAuthPrompt();
      return;
    }

    closeDockCard();
    closeModal();
    router.push('/project/create');
  }, [closeDockCard, closeModal, profile, router, showAuthPrompt]);

  const handleViewFilteredTransparentProjects = useCallback(() => {
    closeDockCard();
    closeModal();
    router.push(
      '/projects?sort=top-transparent&advancedFilter=%257B%2522v%2522%253A1%252C%2522flt%2522%253A%255B%257B%2522id%2522%253A%25223b7e2a08-cdee-464b-9711-9792a76b74ce%2522%252C%2522cond%2522%253A%255B%257B%2522id%2522%253A%25227fb99c8f-36b4-485f-8ba1-49e5564f0c10%2522%252C%2522type%2522%253A%2522sp%2522%252C%2522field%2522%253A%2522hasToken%2522%252C%2522op%2522%253A%2522eq%2522%252C%2522val%2522%253A%2522false%2522%257D%252C%257B%2522id%2522%253A%2522b70ab5b8-cfde-4345-bf55-01b3c7063bf1%2522%252C%2522type%2522%253A%2522sel%2522%252C%2522field%2522%253A%2522investment_stage%2522%252C%2522op%2522%253A%2522eq%2522%252C%2522join%2522%253A%2522and%2522%252C%2522val%2522%253A%2522No%2520Investment%2522%257D%252C%257B%2522id%2522%253A%25222a344678-2cc6-4568-b940-bca69bbdc67d%2522%252C%2522type%2522%253A%2522sel%2522%252C%2522field%2522%253A%2522publicGoods%2522%252C%2522op%2522%253A%2522eq%2522%252C%2522join%2522%253A%2522and%2522%252C%2522val%2522%253A%2522Yes%2522%257D%255D%257D%255D%257D',
    );
  }, [closeDockCard, closeModal, router]);

  const handleViewFilteredAccountableProjects = useCallback(() => {
    closeDockCard();
    closeModal();
    router.push(
      '/projects?sort=top-accountable&advancedFilter=%257B%2522v%2522%253A1%252C%2522flt%2522%253A%255B%257B%2522id%2522%253A%25223b7e2a08-cdee-464b-9711-9792a76b74ce%2522%252C%2522cond%2522%253A%255B%257B%2522id%2522%253A%25227fb99c8f-36b4-485f-8ba1-49e5564f0c10%2522%252C%2522type%2522%253A%2522sp%2522%252C%2522field%2522%253A%2522hasToken%2522%252C%2522op%2522%253A%2522eq%2522%252C%2522val%2522%253A%2522false%2522%257D%252C%257B%2522id%2522%253A%2522b70ab5b8-cfde-4345-bf55-01b3c7063bf1%2522%252C%2522type%2522%253A%2522sel%2522%252C%2522field%2522%253A%2522investment_stage%2522%252C%2522op%2522%253A%2522eq%2522%252C%2522join%2522%253A%2522and%2522%252C%2522val%2522%253A%2522No%2520Investment%2522%257D%252C%257B%2522id%2522%253A%25222a344678-2cc6-4568-b940-bca69bbdc67d%2522%252C%2522type%2522%253A%2522sel%2522%252C%2522field%2522%253A%2522publicGoods%2522%252C%2522op%2522%253A%2522eq%2522%252C%2522join%2522%253A%2522and%2522%252C%2522val%2522%253A%2522Yes%2522%257D%255D%257D%255D%257D',
    );
  }, [closeDockCard, closeModal, router]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-[16px] backdrop-blur-sm">
          <BugBountyCard
            className="relative w-full max-w-[460px] overflow-hidden rounded-[12px] border border-black/10 bg-white/70 p-[18px] text-black shadow-[0_24px_48px_rgba(22,19,1,0.12)] backdrop-blur-md"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 100%), linear-gradient(90deg, rgba(236, 250, 213, 0.4) 0%, rgba(132, 255, 205, 0.4) 100%)',
            }}
            onClose={closeModal}
            onRead={handleOpenGrantAnnouncement}
            onPropose={handleNavigateToCreateProject}
            onFilteredTransparent={handleViewFilteredTransparentProjects}
            onFilteredAccountable={handleViewFilteredAccountableProjects}
            onDismiss={dismissModal}
            ctaVariant="modal"
          />
        </div>
      )}

      <div className="mobile:right-[12px] fixed bottom-[100px] right-[24px] z-[60]">
        <div className="mobile:w-[calc(100vw-24px)] relative w-[360px]">
          {showDockCard ? (
            <BugBountyCard
              className="mobile:w-[calc(100vw-24px)] relative z-[5] w-full overflow-hidden rounded-[12px] border border-black/10 bg-white/70 p-[16px] text-black shadow-[0_24px_48px_rgba(22,19,1,0.12)] backdrop-blur-md"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 100%), linear-gradient(90deg, rgba(236, 250, 213, 0.4) 0%, rgba(132, 255, 205, 0.4) 100%)',
              }}
              onClose={closeDockCard}
              onRead={handleOpenGrantAnnouncement}
              onPropose={handleNavigateToCreateProject}
              onFilteredTransparent={handleViewFilteredTransparentProjects}
              onFilteredAccountable={handleViewFilteredAccountableProjects}
              ctaVariant="dock"
            />
          ) : (
            <button
              type="button"
              onClick={openDockCard}
              className="mobile:w-full flex w-full items-center justify-between gap-[12px] rounded-[12px] border border-black/10 bg-white/65 px-[16px] py-[12px] text-left text-black shadow-[0_20px_40px_rgba(22,19,1,0.08)] backdrop-blur-md transition-colors hover:bg-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 100%), linear-gradient(90deg, rgba(236, 250, 213, 0.35) 0%, rgba(132, 255, 205, 0.35) 100%)',
              }}
            >
              <div className="flex items-center gap-[10px]">
                <div className="relative flex size-[36px] items-center justify-center">
                  <Leaf
                    className="relative text-[#A0D7BF]"
                    size={34}
                    weight="fill"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col">
                  <div>
                    <span className="font-mona h-[22px] rounded-[4px] bg-[#AAE1C9] px-[6px] py-[2px]  text-[11px] font-[700] leading-[1.6] text-black/80">
                      Epoch 1
                    </span>
                  </div>
                  <span className="font-mona text-[14px] font-[600] leading-[1.6] text-black/80">
                    Perennial Grant Experiment
                  </span>
                </div>
              </div>
              <span className="font-mona rounded-[6px] border border-black/10 bg-[rgba(170,225,201,0.40)] px-[12px] py-[6px] text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-[rgba(170,225,201,0.10)]">
                View
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BugBountyEntry;
