import { useParams } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { IModalContentType } from '@/app/project/[id]/page';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';
import {
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import { trpc } from '@/lib/trpc/client';
import { IItemConfig, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

import { useProjectDetailContext } from '../../context/projectDetailContext';
import AddReferenceModal from '../../create/AddReferenceModal';
import { DefaultFieldApplicabilityMap } from '../../create/form/FormData';
import { IProjectTableRowData } from '../types';

export interface ISubmitItemProposalProps {
  itemKey: IPocItemKey;
  displayProposalDataOfKey?: IProjectTableRowData;
  setModalContentType: (contentType: IModalContentType) => void;
}

interface IFormData extends IProjectFormData {
  [key: string]: any;
}

const SubmitItemProposal: FC<ISubmitItemProposalProps> = ({
  itemKey,
  displayProposalDataOfKey,
  setModalContentType,
}) => {
  const { id: projectId } = useParams();

  const { refetchProposalsByKey } = useProjectDetailContext();

  const [fieldApplicability, setFieldApplicability] = useState<
    Record<string, boolean>
  >(DefaultFieldApplicabilityMap);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  const [references, setReferences] = useState<IReferenceData[]>([]);
  const [currentReferenceField, setCurrentReferenceField] = useState({
    key: '',
    label: '',
    existingReference: null as IReferenceData | null,
  });

  const itemConfig = useMemo(
    () => AllItemConfig[itemKey as IPocItemKey]!,
    [itemKey],
  );

  const methods = useForm<IFormData>({
    defaultValues: {
      [itemConfig.key]: '',
    } as IFormData,
  });
  const { control, handleSubmit, setValue, clearErrors } = methods;

  const [editReason, setEditReason] = useState('fake reason');

  const createItemProposalMutation =
    trpc.itemProposal.createItemProposal.useMutation();

  const handleApplicabilityChange = useCallback(
    (field: string, value: boolean) => {
      setFieldApplicability((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (!value) {
        clearErrors(field as keyof IProjectFormData);
      }
    },
    [clearErrors],
  );

  const getFieldReference = useCallback(
    (fieldKey: string): IReferenceData | null => {
      return references.find((ref) => ref.key === fieldKey) || null;
    },
    [references],
  );

  const handleAddReference = useCallback(
    (key: string, label?: string) => {
      const existingReference = getFieldReference(key);
      setCurrentReferenceField({
        key,
        label: label || key,
        existingReference,
      });
      setIsReferenceModalOpen(true);
    },
    [getFieldReference],
  );

  const handleSaveReference = useCallback((reference: IReferenceData) => {
    setReferences((prev) => {
      const existingIndex = prev.findIndex((ref) => ref.key === reference.key);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = reference;
        return updated;
      }
      return [...prev, reference];
    });
  }, []);

  const handleRemoveReference = useCallback((fieldKey: string) => {
    setReferences((prev) => prev.filter((ref) => ref.key !== fieldKey));
  }, []);

  const hasFieldReference = useCallback(
    (fieldKey: string): boolean => {
      return references.some((ref) => ref.key === fieldKey);
    },
    [references],
  );

  const actualSubmitLogic = useCallback(
    (formData: IFormData) => {
      const formValue = formData[itemConfig.key];
      const isApplicableFalse =
        itemConfig.showApplicable && !fieldApplicability[itemConfig.key];

      const payload = {
        projectId: Number(projectId),
        key: itemKey,
        value: isApplicableFalse ? '' : formValue,
        ref: getFieldReference(itemConfig.key)?.value || '',
        reason: editReason,
      };
      devLog('createItemProposal payload', payload);
      createItemProposalMutation.mutate(payload, {
        onSuccess: (data) => {
          devLog('createItemProposal success', data);
          refetchProposalsByKey();
        },
        onError: (error: any) => {
          console.error('createItemProposal error', error);
        },
      });
    },
    [
      createItemProposalMutation,
      getFieldReference,
      itemConfig.key,
      itemKey,
      projectId,
      editReason,
      fieldApplicability,
      refetchProposalsByKey,
      itemConfig.showApplicable,
    ],
  );

  useEffect(() => {
    if (displayProposalDataOfKey) {
      devLog('displayProposalDataOfKey', displayProposalDataOfKey);
      setValue(itemConfig.key, displayProposalDataOfKey.input);
      const reference = getFieldReference(itemConfig.key);
      if (reference) {
        setReferences([reference]);
      }
    }
  }, [displayProposalDataOfKey, itemConfig.key, setValue, getFieldReference]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(actualSubmitLogic)}>
        <div className="flex flex-col gap-[20px] p-[20px]">
          <FormItemManager
            itemConfig={itemConfig as IItemConfig<keyof IProjectFormData>}
            control={control}
            fieldApplicability={fieldApplicability}
            onChangeApplicability={handleApplicabilityChange}
            onAddReference={handleAddReference}
            hasFieldReference={hasFieldReference}
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
              type="submit"
              isLoading={createItemProposalMutation.isPending}
            >
              Submit
            </Button>
          </div>
        </div>
      </form>

      <AddReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        onAddReference={handleSaveReference}
        onRemoveReference={handleRemoveReference}
        fieldKey={currentReferenceField.key}
        fieldLabel={currentReferenceField.label}
        existingReference={currentReferenceField.existingReference}
      />
    </FormProvider>
  );
};

export default SubmitItemProposal;
