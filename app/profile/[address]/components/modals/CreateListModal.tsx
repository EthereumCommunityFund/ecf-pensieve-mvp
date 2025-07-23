'use client';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Textarea,
} from '@heroui/react';
import { useState } from 'react';

import ECFTypography from '@/components/base/typography';
import {
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  XIcon,
} from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateListModal = ({ isOpen, onClose }: CreateListModalProps) => {
  const { isAuthenticated, session } = useAuth();
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('private');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  const createListMutation = trpc.list.createList.useMutation({
    onSuccess: (data) => {
      console.log('devLog - createList success:', data);
      utils.list.getUserLists.invalidate();
      handleClose();
    },
    onError: (error) => {
      console.log('devLog - createList error:', error);
      console.error('Failed to create list:', error);
      console.error('Error details:', {
        code: error.data?.code,
        message: error.message,
      });
    },
  });

  const handleClose = () => {
    setListName('');
    setDescription('');
    setPrivacy('private');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!listName.trim()) return;

    // Check authentication status
    if (!isAuthenticated || !session) {
      console.error('User not authenticated');
      alert('Please make sure you are logged in before creating a list.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createListMutation.mutateAsync({
        name: listName.trim(),
        description: description.trim() || undefined,
        privacy,
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'max-w-[400px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between p-6 pb-4">
          <ECFTypography
            type="subtitle2"
            className="text-[20px] font-semibold leading-[32px]"
          >
            Create a List
          </ECFTypography>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-[5px] opacity-60 transition-opacity hover:opacity-100"
          >
            <XIcon size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="px-6 py-0">
          <div className="flex flex-col gap-4">
            {/* List Name */}
            <div className="flex flex-col gap-2">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[25.6px]"
              >
                List Name
              </ECFTypography>
              <div className="relative">
                <Input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name"
                  classNames={{
                    inputWrapper:
                      'border border-[rgba(0,0,0,0.1)] bg-white h-[48px]',
                    input: 'text-[16px] leading-[25.6px]',
                  }}
                  maxLength={150}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ECFTypography
                    type="caption"
                    className="text-[12px] leading-[19.2px] opacity-50"
                  >
                    {listName.length}/150
                  </ECFTypography>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[25.6px]"
              >
                Description (Optional)
              </ECFTypography>
              <div className="relative">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your list..."
                  classNames={{
                    inputWrapper:
                      'border border-[rgba(0,0,0,0.1)] bg-white min-h-[120px]',
                    input: 'text-[16px] leading-[25.6px]',
                  }}
                  maxRows={5}
                  maxLength={5000}
                />
                <div className="absolute bottom-3 right-3">
                  <ECFTypography
                    type="caption"
                    className="text-[12px] leading-[19.2px] opacity-50"
                  >
                    {description.length}/5000
                  </ECFTypography>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="flex flex-col gap-2">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[25.6px]"
              >
                Privacy
              </ECFTypography>
              <RadioGroup
                value={privacy}
                onValueChange={(value) =>
                  setPrivacy(value as 'public' | 'private')
                }
                orientation="vertical"
                classNames={{
                  wrapper: 'gap-3',
                }}
              >
                <Radio
                  value="private"
                  classNames={{
                    base: 'flex items-center gap-3 p-0 m-0',
                    wrapper: 'm-0',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <LockKeyIcon size={20} className="opacity-60" />
                    <div className="flex flex-col gap-1">
                      <ECFTypography
                        type="body2"
                        className="text-[14px] font-semibold leading-[22.4px]"
                      >
                        Private
                      </ECFTypography>
                      <ECFTypography
                        type="caption"
                        className="text-[12px] leading-[19.2px] opacity-60"
                      >
                        Only you can see this list
                      </ECFTypography>
                    </div>
                  </div>
                </Radio>
                <Radio
                  value="public"
                  classNames={{
                    base: 'flex items-center gap-3 p-0 m-0',
                    wrapper: 'm-0',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <GlobeHemisphereWestIcon size={20} className="opacity-60" />
                    <div className="flex flex-col gap-1">
                      <ECFTypography
                        type="body2"
                        className="text-[14px] font-semibold leading-[22.4px]"
                      >
                        Public
                      </ECFTypography>
                      <ECFTypography
                        type="caption"
                        className="text-[12px] leading-[19.2px] opacity-60"
                      >
                        Anyone can view this list
                      </ECFTypography>
                    </div>
                  </div>
                </Radio>
              </RadioGroup>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-3 p-6 pt-4">
          {!isAuthenticated && (
            <ECFTypography
              type="caption"
              className="text-center text-orange-600"
            >
              Please make sure you are logged in to create a list.
            </ECFTypography>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="light"
              onPress={handleClose}
              className="h-[48px] rounded-[8px] bg-[rgba(0,0,0,0.05)] px-6 text-[16px] font-semibold leading-[25.6px] text-black hover:bg-[rgba(0,0,0,0.1)]"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!listName.trim() || isSubmitting || !isAuthenticated}
              className="h-[48px] rounded-[8px] bg-black px-6 text-[16px] font-semibold leading-[25.6px] text-white hover:bg-[rgba(0,0,0,0.8)]"
            >
              Create
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateListModal;
