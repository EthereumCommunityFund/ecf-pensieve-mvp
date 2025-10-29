'use client';

import {
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
import { useEffect, useState } from 'react';

import { Button, addToast } from '@/components/base';
import { LinkIcon } from '@/components/icons';
import CustomFilterModal from '@/components/pages/project/customFilters/CustomFilterModal';
import {
  type AdvancedFilterCard,
  type AdvancedFilterModalState,
} from '@/components/pages/project/customFilters/types';
import {
  buildFilterSummary,
  createEmptyFilter,
  getAdvancedFilterQueryKey,
  parseAdvancedFilters,
  serializeAdvancedFilters,
} from '@/components/pages/project/customFilters/utils';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

const ADVANCED_FILTER_KEY = getAdvancedFilterQueryKey();

interface EditSieveModalProps {
  isOpen: boolean;
  sieve: SieveRecord | null;
  onClose: () => void;
  onUpdated: () => void;
}

const visibilityOptions: Array<{
  value: 'public' | 'private';
  label: string;
  description: string;
}> = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone with the link can view and use this feed.',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can access this feed. Sharing is disabled.',
  },
];

const EditSieveModal = ({
  isOpen,
  sieve,
  onClose,
  onUpdated,
}: EditSieveModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilterCard[]>([]);
  const [filterModalState, setFilterModalState] =
    useState<AdvancedFilterModalState | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [basePath, setBasePath] = useState('/projects');
  const [rawParams, setRawParams] = useState('');

  const updateMutation = trpc.sieve.updateSieve.useMutation({
    onSuccess: (data) => {
      addToast({
        title: 'Feed updated',
        color: 'success',
      });
      onUpdated();
      onClose();
    },
    onError: (error) => {
      addToast({
        title: error.message || 'Failed to update feed',
        color: 'danger',
      });
    },
  });

  useEffect(() => {
    if (!sieve || !isOpen) {
      return;
    }
    setName(sieve.name ?? '');
    setDescription(sieve.description ?? '');
    setVisibility(sieve.visibility);
    setHasTriedSubmit(false);

    const [pathPart, searchPart = ''] = sieve.targetPath.split('?');
    setBasePath(pathPart || '/projects');
    setRawParams(searchPart);
    const params = new URLSearchParams(searchPart);
    const serialized = params.get(ADVANCED_FILTER_KEY);
    setFilters(parseAdvancedFilters(serialized));
  }, [sieve, isOpen]);

  if (!sieve) {
    return null;
  }

  const nameError = !hasTriedSubmit
    ? ''
    : name.trim()
      ? ''
      : 'Feed name is required';

  const handleSave = () => {
    setHasTriedSubmit(true);

    if (!name.trim()) {
      return;
    }

    const params = new URLSearchParams(rawParams);
    const serialized = serializeAdvancedFilters(filters);
    if (serialized) {
      params.set(ADVANCED_FILTER_KEY, serialized);
    } else {
      params.delete(ADVANCED_FILTER_KEY);
    }
    const nextSearch = params.toString();
    const nextTargetPath = `${basePath}${nextSearch ? `?${nextSearch}` : ''}`;

    updateMutation.mutate({
      id: sieve.id,
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      visibility,
      targetPath:
        nextTargetPath !== sieve.targetPath ? nextTargetPath : undefined,
    });
  };

  const handleOpenFeed = () => {
    const target = sieve.share.targetUrl ?? sieve.targetPath;
    const url = target.startsWith('http')
      ? target
      : `${window.location.origin}${target.startsWith('/') ? '' : '/'}${target}`;
    window.open(url, '_blank');
  };

  const handleCreateFilter = () => {
    setFilterModalState({
      mode: 'create',
      filter: createEmptyFilter(),
    });
    setIsFilterModalOpen(true);
  };

  const handleEditFilter = (id: string) => {
    const target = filters.find((filter) => filter.id === id);
    if (!target) {
      return;
    }
    setFilterModalState({
      mode: 'edit',
      filter: target,
    });
    setIsFilterModalOpen(true);
  };

  const handleDeleteFilter = (id: string) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const handleFilterModalClose = () => {
    setIsFilterModalOpen(false);
    setFilterModalState(null);
  };

  const handleFilterModalSave = (filter: AdvancedFilterCard) => {
    setFilters((prev) => {
      const exists = prev.some((item) => item.id === filter.id);
      if (exists) {
        return prev.map((item) => (item.id === filter.id ? filter : item));
      }
      return [...prev, filter];
    });
    handleFilterModalClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'max-w-[520px]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-black/10 px-5 py-[12px]">
          <span className="text-[16px] font-semibold text-black">
            Edit Feed
          </span>
          <Button
            size="sm"
            variant="light"
            onPress={handleOpenFeed}
            className="text-[13px]"
          >
            <LinkIcon size={16} /> View in Projects
          </Button>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-[16px] p-5">
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-semibold text-black/80">
              Feed Name
            </span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              isInvalid={Boolean(nameError)}
              errorMessage={nameError}
              classNames={{
                inputWrapper:
                  'border border-black/10 bg-[rgba(0,0,0,0.05)] h-[40px] rounded-[8px] px-[10px]',
                input: 'text-[14px] leading-[20px] placeholder:opacity-50',
              }}
              maxLength={150}
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[6px]">
              <span className="text-[14px] font-semibold text-black/80">
                Description
              </span>
              <span className="text-[12px] text-black/40">(optional)</span>
            </div>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              classNames={{
                inputWrapper:
                  'border border-black/10 bg-[rgba(0,0,0,0.05)] min-h-[80px] rounded-[8px] px-[10px] py-[10px]',
                input: 'text-[14px] leading-[20px] placeholder:opacity-50',
              }}
              maxLength={1000}
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-semibold text-black/80">
              Saved Conditions
            </span>
            {filters.length > 0 ? (
              <div className="flex flex-col gap-[8px]">
                {filters.map((filter, index) => {
                  const summary = buildFilterSummary(filter);
                  return (
                    <div
                      key={filter.id}
                      className="flex flex-col gap-[6px] rounded-[10px] border border-black/10 bg-[rgba(0,0,0,0.02)] px-[12px] py-[10px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-black/70">
                          Filter {index + 1}
                        </span>
                        <div className="flex items-center gap-[6px]">
                          <Button
                            size="sm"
                            onPress={() => handleEditFilter(filter.id)}
                            className="h-[28px] px-[10px] text-[12px]"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onPress={() => handleDeleteFilter(filter.id)}
                            className="h-[28px] px-[10px] text-[12px]"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-[6px]">
                        {summary.items.map((item) => {
                          const parts = [item.label];
                          if (item.operatorLabel) {
                            parts.push(item.operatorLabel.toLowerCase());
                          }
                          if (item.valueLabel) {
                            parts.push(item.valueLabel);
                          }
                          return (
                            <span
                              key={item.id}
                              className="inline-flex items-center rounded-[6px] bg-white px-[8px] py-[4px] text-[12px] text-black/70"
                            >
                              {parts.join(' ')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-[12px] text-black/50">
                No custom filters are attached to this feed yet.
              </span>
            )}
            <Button
              size="sm"
              onPress={handleCreateFilter}
              className="w-fit px-[12px] text-[12px]"
            >
              Add Filter
            </Button>
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-semibold text-black/80">
              Visibility
            </span>
            <RadioGroup
              value={visibility}
              onValueChange={(value) => {
                if (value === 'public' || value === 'private') {
                  setVisibility(value);
                }
              }}
              classNames={{
                wrapper: 'flex flex-col gap-[10px]',
              }}
            >
              {visibilityOptions.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  classNames={{
                    base: 'flex items-start gap-[10px] rounded-[10px] border border-black/10 bg-[rgba(0,0,0,0.03)] px-4 py-3',
                    label: 'text-left',
                  }}
                >
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[14px] font-semibold text-black">
                      {option.label}
                    </span>
                    <span className="text-[12px] text-black/60">
                      {option.description}
                    </span>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
            {visibility === 'private' ? (
              <span className="text-[11px] text-[#D14343]">
                Private feeds cannot be shared until you switch them back to
                Public.
              </span>
            ) : (
              <span className="text-[11px] text-black/50">
                Changing to Public will make the short link accessible to
                anyone.
              </span>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex items-center justify-end gap-[10px] border-t border-black/10 px-5 py-[12px]">
          <Button onPress={onClose} isDisabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
      <CustomFilterModal
        isOpen={isFilterModalOpen}
        state={filterModalState}
        onClose={handleFilterModalClose}
        onSave={handleFilterModalSave}
        onDelete={(id) => handleDeleteFilter(id)}
      />
    </Modal>
  );
};

export default EditSieveModal;
