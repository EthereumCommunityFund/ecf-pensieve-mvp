import { useParams } from 'next/navigation';
import { FC, useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { AllItemConfig } from '@/constants/itemConfig';
import { trpc } from '@/lib/trpc/client';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

export interface ISubmitItemProposalProps {
  itemKey: string;
}

const SubmitItemProposal: FC<ISubmitItemProposalProps> = ({ itemKey }) => {
  const { id: projectId } = useParams();

  const [inputValue, setInputValue] = useState('fake value');
  const [editReason, setEditReason] = useState('fake reason');
  const itemConfig = AllItemConfig[itemKey as IPocItemKey]!;

  const createItemProposalMutation =
    trpc.itemProposal.createItemProposal.useMutation();

  const onSubmit = () => {
    const payload = {
      projectId: Number(projectId),
      key: itemKey,
      value: inputValue,
      ref: '',
    };
    devLog('createItemProposal payload', payload);
    createItemProposalMutation.mutate(payload, {
      onSuccess: (data) => {
        devLog('createItemProposal success', data);
      },
      onError: (error: any) => {
        console.error('createItemProposal error', error);
      },
    });
  };

  return (
    <div className="flex flex-col gap-[20px] p-[20px]">
      <p>{itemConfig.label}</p>
      <div>weight: {itemConfig.weight}</div>
      <Input
        value={inputValue}
        onValueChange={setInputValue}
        placeholder={itemConfig.placeholder}
      />
      <div>
        <p>Edit reason</p>
        <Input
          value={editReason}
          onValueChange={setEditReason}
          placeholder="Edit reason"
        />
      </div>
      <div>
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={createItemProposalMutation.isPending}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default SubmitItemProposal;
