'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { X } from '@phosphor-icons/react';
import React, { useEffect, useMemo } from 'react';
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
import SablierEntry from '@/components/sablier/SablierEntry';
import { devLog } from '@/utils/devLog';
import { isSablierDomain } from '@/utils/sablierDetector';
import { normalizeUrl } from '@/utils/url';

import InputPrefix from './form/InputPrefix';
import { IReferenceData } from './types';

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReference: (reference: IReferenceData) => void;
  onRemoveReference?: (fieldKey: string) => void;
  fieldKey: string;
  fieldLabel?: string;
  existingReference?: IReferenceData | null;
}

interface ReferenceFormData {
  url: string;
}

const referenceSchema = yup.object().shape({
  url: yup
    .string()
    .test('is-valid-url', 'Please enter a valid URL', (value) => {
      if (!value) return false;

      // only validate, not modify the original value
      const normalizedForValidation = normalizeUrl(value);
      try {
        const url = new URL(normalizedForValidation || '');
        const hostname = url.hostname;
        return hostname.includes('.') && hostname.length > 3;
      } catch (e) {
        return false;
      }
    })
    .required('Please enter a valid URL'),
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
    watch,
    formState: { errors },
  } = useForm<ReferenceFormData>({
    resolver: yupResolver(referenceSchema),
    defaultValues: {
      url: '',
    },
  });

  const urlValue = watch('url');

  const isMatchSablier = useMemo(() => {
    if (!urlValue) {
      return false;
    }
    return isSablierDomain(normalizeUrl(urlValue));
  }, [urlValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        url: existingReference?.value || '',
      });
    }
  }, [isOpen, existingReference, reset]);

  const onSubmit = (data: ReferenceFormData) => {
    const trimmedUrl = data.url.trim();

    devLog('Reference Form Data', {
      original: data,
      trimmed: trimmedUrl,
    });

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
          description={`References are documented sources that verify the accuracy and credibility of an item’s input, aiding community validation.`}
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

            {isMatchSablier && (
              <div className="mt-[10px] flex items-center justify-between">
                <p className="text-[14px] font-[600] leading-[20px] text-[#207CB2]">
                  A reference via Sablier.com has been detected.{' '}
                </p>
                <SablierEntry />
              </div>
            )}

            {/* <p className="mt-3 text-[13px] leading-[1.2] text-black/80">
              References serve as documented sources that substantiate the
              accuracy and credibility of the input associated with an item.
              This will help with community validation.
            </p> */}

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

        <div className="bg-[#F5F5F5] p-[10px]">
          <div className="text-[13px] font-[400] text-black/80">
            Backed and partnered with ECF, using these on-chain tools
            significantly enhances the legitimacy and trust behind your claim:
          </div>
          <div className="mt-[10px] flex items-center justify-between gap-[10px]">
            <div className="flex flex-1 items-center justify-start gap-[10px]">
              <SablierEntry />
              <span className="text-[13px] font-[400] text-black/30">
                More Coming Soon
              </span>
            </div>
            <a
              href="https://discord.gg/F7Xgd3NsDT"
              target="_blank"
              className="text-[11px] font-[600] text-black/60 hover:text-black/80 hover:underline"
              rel="noreferrer"
            >
              Looking to partner with ECF?
            </a>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default AddReferenceModal;
