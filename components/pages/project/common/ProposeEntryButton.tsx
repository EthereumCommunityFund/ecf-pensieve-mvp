import { FC } from 'react';

import {
  isEmbedTableFormType,
  normalizeEmbedTableValue,
} from '@/components/biz/table/embedTable/embedTableUtils';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../context/projectDetailContext';

interface ProposeEntryButtonProps {
  itemKey: IPocItemKey;
  data: any;
  onOpenModal: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
  children?: React.ReactNode;
  className?: string;
}

export const ProposeEntryButton: FC<ProposeEntryButtonProps> = ({
  itemKey,
  data,
  onOpenModal,
  children,
  className = 'flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]',
}) => {
  const { setSubmitPrefill } = useProjectDetailContext();

  const handleClick = () => {
    const formType = AllItemConfig[itemKey]?.formDisplayType;
    if (formType && isEmbedTableFormType(formType)) {
      const normalized = normalizeEmbedTableValue(formType, data);
      setSubmitPrefill(itemKey, normalized);
    }
    onOpenModal(itemKey, 'submitPropose');
  };

  return (
    <button onClick={handleClick} className={className}>
      {children || 'Propose an Entry'}
    </button>
  );
};
