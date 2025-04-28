'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { X } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  Button,
  CommonModalHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';
import { normalizeUrl } from '@/components/pages/project/create/utils/form';

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

interface ReferenceFormData {
  url: string;
}

const referenceSchema = yup.object().shape({
  url: yup
    .string()
    .test('is-valid-url', 'Please enter a valid URL format', (value) => {
      if (!value) return false;

      // only validate, not modify the original value
      const normalizedForValidation = normalizeUrl(value);
      try {
        new URL(normalizedForValidation || '');
        return true;
      } catch (e) {
        return false;
      }
    })
    .required('Please enter a reference URL'),
});

const AddReferenceModal: React.FC<AddReferenceModalProps> = ({
  isOpen,
  onClose,
  onAddReference,
  onRemoveReference,
  fieldKey,
  fieldLabel,
  existingReference,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReferenceFormData>({
    resolver: yupResolver(referenceSchema),
    defaultValues: {
      url: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        url: existingReference?.value || '',
      });
    }
  }, [isOpen, existingReference, reset]);

  const onSubmit = (data: ReferenceFormData) => {
    const trimmedUrl = data.url.trim();

    onAddReference({
      key: fieldKey,
      ref: trimmedUrl,
      value: trimmedUrl,
    });

    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleRemove = () => {
    if (onRemoveReference && fieldKey) {
      onRemoveReference(fieldKey);
    }
    reset();
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  label="Reference Link"
                  labelPlacement="outside"
                  placeholder="Type in URL"
                  {...field}
                  isInvalid={!!errors.url}
                  errorMessage={errors.url?.message}
                  classNames={{
                    inputWrapper: 'pl-0 pr-[10px]',
                    label: 'text-[16px] font-[600]',
                  }}
                  startContent={<InputPrefix prefix="https://" />}
                />
              )}
            />

            <p className="mt-3 text-[13px] leading-[1.2] text-black/80">
              References serve as documented sources that substantiate the
              accuracy and credibility of the input associated with an item.
              This will help with community validation.
            </p>

            <div className="mt-5 flex items-center justify-end gap-[10px]">
              <Button
                color="secondary"
                size="md"
                onPress={isEditing ? handleRemove : handleCancel}
                className="px-[20px]"
                type="button"
              >
                {isEditing ? 'Remove' : 'Discard'}
              </Button>
              <Button
                color="primary"
                size="md"
                className="px-[30px]"
                type="submit"
              >
                {isEditing ? 'Save' : 'Confirm'}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddReferenceModal;
