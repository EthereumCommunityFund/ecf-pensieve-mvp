'use client';

import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useState } from 'react';

import { Button } from '@/components/base';
import { Select, SelectItem } from '@/components/base/select';
import ECFTypography from '@/components/base/typography';
import {
  GlobeHemisphereWestIcon,
  InfoIcon,
  LinkIcon,
  LockKeyIcon,
  XIcon,
} from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const privacyOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can view',
    icon: GlobeHemisphereWestIcon,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can view',
    icon: LockKeyIcon,
  },
  {
    value: 'share-only',
    label: 'Share-only',
    description: 'Anyone with link can view',
    icon: LinkIcon,
    disabled: true,
  },
];

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
      classNames={{
        base: 'max-w-[400px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-5 py-[10px]">
          <ECFTypography
            type="subtitle2"
            className="text-[16px] font-semibold leading-[21.82px] text-black opacity-80"
          >
            Create a List
          </ECFTypography>
          <button
            onClick={handleClose}
            className="rounded p-[5px] transition-opacity hover:bg-[rgba(0,0,0,0.05)]"
          >
            <XIcon size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="p-5">
          <div className="flex flex-col gap-[10px] pb-5">
            {/* List Name */}
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <ECFTypography
                  type="body1"
                  className="text-[16px] font-semibold leading-[25.6px]"
                >
                  List Name
                </ECFTypography>
              </div>
              <div className="relative">
                <Input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="type a name for this list"
                  classNames={{
                    inputWrapper:
                      'border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] h-[40px] rounded-[8px] px-[10px]',
                    input: 'text-[14px] leading-[20px] placeholder:opacity-50',
                  }}
                  maxLength={150}
                />
              </div>
              <ECFTypography
                type="caption"
                className="text-right text-[11px] leading-[15px] text-black opacity-80"
              >
                {listName.length} / 150
              </ECFTypography>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[5px]">
                  <ECFTypography
                    type="body1"
                    className="text-[16px] font-semibold leading-[25.6px]"
                  >
                    List Description
                  </ECFTypography>
                  <ECFTypography
                    type="body1"
                    className="text-[16px] font-semibold leading-[25.6px]"
                  >
                    (optional)
                  </ECFTypography>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="type a description"
                  classNames={{
                    inputWrapper:
                      'border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] min-h-[80px] rounded-[8px] px-[10px] py-[10px]',
                    input: 'text-[14px] leading-[20px] placeholder:opacity-50',
                  }}
                  maxRows={5}
                  maxLength={5000}
                />
              </div>
              <ECFTypography
                type="caption"
                className="text-right text-[11px] leading-[15px] text-black opacity-80"
              >
                {description.length} / 5000
              </ECFTypography>
            </div>

            {/* Privacy Settings */}
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[5px]">
                  <ECFTypography
                    type="body1"
                    className="text-[16px] font-semibold leading-[25.6px]"
                  >
                    List Privacy
                  </ECFTypography>
                  <InfoIcon size={20} className="opacity-50" />
                </div>
              </div>
              <Select
                selectedKeys={[privacy]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected && selected !== 'share-only') {
                    setPrivacy(selected as 'public' | 'private');
                  }
                }}
                placeholder="Select privacy"
                classNames={{
                  trigger:
                    'h-[40px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] rounded-[8px] px-[10px]',
                  value: 'text-[14px] leading-[20px]',
                  listbox:
                    'border border-[rgba(0,0,0,0.1)] rounded-[10px] p-[10px]',
                  popoverContent: 'p-0',
                }}
                renderValue={(items) => {
                  return items.map((item) => (
                    <div key={item.key} className="flex items-center">
                      <span className="text-[14px]">{item.textValue}</span>
                    </div>
                  ));
                }}
              >
                {privacyOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    textValue={option.label}
                    isDisabled={option.disabled}
                    className={`rounded-[5px] px-[10px] py-[4px] ${
                      option.disabled ? 'opacity-20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-[10px]">
                      <div className="flex flex-col gap-[5px]">
                        <ECFTypography
                          type="body1"
                          className="text-[16px] font-semibold leading-[25.6px]"
                        >
                          {option.label}
                        </ECFTypography>
                        <ECFTypography
                          type="caption"
                          className="text-[13px] leading-[17.7px] tracking-[0.282px] opacity-80"
                        >
                          {option.description}
                        </ECFTypography>
                      </div>
                      <option.icon size={26} />
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-3 px-5 pb-5 pt-0">
          {!isAuthenticated && (
            <ECFTypography
              type="caption"
              className="text-center text-orange-600"
            >
              Please make sure you are logged in to create a list.
            </ECFTypography>
          )}
          <div className="flex gap-[10px]">
            <Button
              variant="light"
              onPress={handleClose}
              className="h-[39px] flex-1 rounded-[5px] px-[30px] text-[14px] font-semibold leading-[19.12px]"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!listName.trim() || isSubmitting || !isAuthenticated}
              className={`h-[39px] flex-1 rounded-[5px] px-[30px] text-[14px] font-semibold leading-[19.12px] text-white ${
                !listName.trim() || isSubmitting
                  ? 'opacity-20'
                  : 'hover:bg-[#2C2C2C]'
              }`}
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
