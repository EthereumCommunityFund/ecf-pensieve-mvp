'use client';

import { X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';

import {
  Button,
  CommonModalHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';

import InputPrefix from './InputPrefix';
import { ReferenceData } from './types';

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReference: (reference: ReferenceData) => void;
  onRemoveReference?: (fieldKey: string) => void;
  fieldKey: string;
  fieldLabel?: string;
  existingReference?: ReferenceData | null;
}

const AddReferenceModal: React.FC<AddReferenceModalProps> = ({
  isOpen,
  onClose,
  onAddReference,
  onRemoveReference,
  fieldKey,
  fieldLabel,
  existingReference,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && existingReference?.value) {
      setUrl(existingReference.value);
    } else if (isOpen && !existingReference) {
      setUrl('');
    }
  }, [isOpen, existingReference]);

  const handleSubmit = () => {
    if (!url || !url.trim()) {
      setError('请输入有效的引用 URL');
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      setError('请输入有效的 URL 格式');
      return;
    }

    const trimmedUrl = url.trim();
    onAddReference({
      key: fieldKey,
      ref: trimmedUrl,
      value: trimmedUrl,
    });

    setError('');
    onClose();
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  const handleRemove = () => {
    if (onRemoveReference && fieldKey) {
      onRemoveReference(fieldKey);
    }
    setError('');
    onClose();
  };

  const isEditing = !!existingReference;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      classNames={{
        base: 'w-[600px] max-w-[600px] m-0 p-0',
        header: 'p-[20px]',
      }}
    >
      <ModalContent>
        <CommonModalHeader
          title={isEditing ? 'Edit Reference' : 'Add Reference'}
          onClose={onClose}
          classNames={{
            base: 'pb-[20px] border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
          closeIcon={<X size={20} />}
        />
        <ModalBody className="flex-col gap-[20px] p-[20px]">
          <p className="border-b border-dashed border-[rgba(0,0,0,0.1)] pb-[20px] text-[14px] text-black">
            <span>item:</span>
            <span className="ml-[10px] font-semibold">
              {fieldLabel || fieldKey}
            </span>{' '}
          </p>

          <Input
            label="Reference Link"
            labelPlacement="outside"
            placeholder="Type in URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            isInvalid={!!error}
            errorMessage={error}
            classNames={{
              inputWrapper: 'pl-0 pr-[10px]',
              label: 'text-[16px] font-[600]',
            }}
            startContent={<InputPrefix prefix="https://" />}
          />

          <p className="text-[13px] leading-[1.2] text-black/80">
            References serve as documented sources that substantiate the
            accuracy and credibility of the input associated with an item. This
            will help with community validation.
          </p>

          <div className="flex items-center justify-end gap-[10px]">
            <Button
              color="secondary"
              size="md"
              onPress={isEditing ? handleRemove : handleCancel}
              className="px-[20px]"
            >
              {isEditing ? 'Remove' : 'Discard'}
            </Button>
            <Button
              color="primary"
              size="md"
              onPress={handleSubmit}
              className="px-[30px]"
            >
              {isEditing ? 'Save' : 'Confirm'}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddReferenceModal;
