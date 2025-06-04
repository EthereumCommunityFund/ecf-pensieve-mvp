import { useEffect, useState } from 'react';

import { StorageKey_DoNotShowCancelModal } from '@/constants/storage';
import { IProposal } from '@/types';
import { safeGetLocalStorage, safeSetLocalStorage } from '@/utils/localStorage';

import { ITableProposalItem } from '../ProposalDetails';

export const useProposalModalState = () => {
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [currentReferenceKey, setCurrentReferenceKey] = useState('');

  const [currentVoteItem, setCurrentVoteItem] =
    useState<ITableProposalItem | null>(null);
  const [sourceProposal, setSourceProposal] = useState<IProposal | null>(null);

  const [doNotShowCancelModal, setDoNotShowCancelModal] =
    useState<boolean>(false);

  useEffect(() => {
    const savedValue = safeGetLocalStorage(StorageKey_DoNotShowCancelModal);
    setDoNotShowCancelModal(savedValue === 'true');
  }, []);

  useEffect(() => {
    if (doNotShowCancelModal) {
      safeSetLocalStorage(StorageKey_DoNotShowCancelModal, 'true');
    }
  }, [doNotShowCancelModal]);

  return {
    isSwitchModalOpen,
    isCancelModalOpen,
    isReferenceModalOpen,
    currentReferenceKey,
    currentVoteItem,
    sourceProposal,
    doNotShowCancelModal,

    setIsSwitchModalOpen,
    setIsCancelModalOpen,
    setIsReferenceModalOpen,
    setCurrentReferenceKey,
    setCurrentVoteItem,
    setSourceProposal,
    setDoNotShowCancelModal,
  };
};
