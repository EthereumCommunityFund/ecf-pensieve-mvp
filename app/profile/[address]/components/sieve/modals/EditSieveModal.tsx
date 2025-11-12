'use client';

import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { useCallback, useEffect, useMemo, useState, type Key } from 'react';

import { Button, addToast } from '@/components/base';
import { CaretDownIcon } from '@/components/icons';
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
import {
  CATEGORY_MAP,
  SORT_OPTIONS,
  type SortOption,
} from '@/components/pages/project/filterAndSort/types';
import { AllCategories } from '@/constants/category';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

const ADVANCED_FILTER_KEY = getAdvancedFilterQueryKey();

interface EditSieveModalProps {
  isOpen: boolean;
  sieve: SieveRecord | null;
  mode: 'edit' | 'create';
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
    description: 'Anyone with the link can view and use this sieve.',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can access this sieve. Sharing is disabled.',
  },
];

const EditSieveModal = ({
  isOpen,
  sieve,
  mode,
  onClose,
  onUpdated,
}: EditSieveModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [sort, setSort] = useState<string | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilterCard[]>([]);
  const [filterModalState, setFilterModalState] =
    useState<AdvancedFilterModalState | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [basePath, setBasePath] = useState('/projects');
  const [rawParams, setRawParams] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    [],
  );

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setVisibility('public');
    setSort(null);
    setHasTriedSubmit(false);
    setFilters([]);
    setFilterModalState(null);
    setIsFilterModalOpen(false);
    setBasePath('/projects');
    setRawParams('');
    setSelectedSubCategories([]);
    setIsSortOpen(false);
  }, []);

  const updateMutation = trpc.sieve.updateSieve.useMutation({
    onSuccess: (data) => {
      addToast({
        title: 'Sieve updated',
        color: 'success',
      });
      onUpdated();
      onClose();
    },
    onError: (error) => {
      addToast({
        title: error.message || 'Failed to update sieve',
        color: 'danger',
      });
    },
  });

  const createMutation = trpc.sieve.createSieve.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Sieve created',
        color: 'success',
      });
      onUpdated();
      onClose();
    },
    onError: (error) => {
      addToast({
        title: error.message || 'Failed to create sieve',
        color: 'danger',
      });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'create') {
      resetForm();
      return;
    }

    if (!sieve) {
      return;
    }

    resetForm();
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
    const sortValue = params.get('sort');
    setSort(sortValue && sortValue.trim() ? sortValue : null);
    const categoriesValue = params.get('cats');
    setSelectedSubCategories(
      categoriesValue
        ? categoriesValue
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        : [],
    );
  }, [sieve, isOpen, mode, resetForm]);

  const groupedSortOptions = useMemo(
    () =>
      SORT_OPTIONS.reduce<Record<string, SortOption[]>>((acc, option) => {
        if (!acc[option.category]) {
          acc[option.category] = [];
        }
        acc[option.category]!.push(option);
        return acc;
      }, {}),
    [],
  );

  const sortLabel = useMemo(() => {
    if (!sort) {
      return 'none';
    }
    const option = SORT_OPTIONS.find((item) => item.value === sort);
    return option?.label ?? 'Custom sort';
  }, [sort]);

  const sortTextClass = sort
    ? 'text-[13px] font-semibold text-black'
    : 'text-[13px] font-normal text-black/45';
  const sortIconClass = sort ? 'text-black/45' : 'text-black/30';
  const hasSubCategorySelection = selectedSubCategories.length > 0;
  const subCategoryValueClass = hasSubCategorySelection
    ? 'text-[13px] font-semibold text-black'
    : 'text-[13px] font-normal text-black/45';
  const subCategorySelectorClass = hasSubCategorySelection
    ? 'text-black/45'
    : 'text-black/30';

  const handleSubCategorySelectionChange = (keys: 'all' | Set<Key>) => {
    if (keys === 'all') {
      setSelectedSubCategories(AllCategories.map((category) => category.value));
      return;
    }

    const values = Array.from(keys)
      .map((key) => (typeof key === 'string' ? key : String(key)))
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    setSelectedSubCategories(values);
  };

  if (mode === 'edit' && !sieve) {
    return null;
  }

  const nameError = !hasTriedSubmit
    ? ''
    : name.trim()
      ? ''
      : 'Sieve name is required';

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
    if (sort && sort.trim()) {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    if (selectedSubCategories.length > 0) {
      params.set('cats', selectedSubCategories.join(','));
    } else {
      params.delete('cats');
    }
    const nextSearch = params.toString();
    const nextTargetPath = `${basePath}${nextSearch ? `?${nextSearch}` : ''}`;

    if (mode === 'create') {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() ? description.trim() : undefined,
        visibility,
        targetPath: nextTargetPath,
      });
      return;
    }

    if (!sieve) {
      return;
    }

    updateMutation.mutate({
      id: sieve.id,
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      visibility,
      targetPath:
        nextTargetPath !== sieve.targetPath ? nextTargetPath : undefined,
    });
  };

  // const handleOpenFeed = () => {
  //   const target = sieve.share.targetUrl ?? sieve.targetPath;
  //   const url = target.startsWith('http')
  //     ? target
  //     : `${window.location.origin}${target.startsWith('/') ? '' : '/'}${target}`;
  //   window.open(url, '_blank');
  // };

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

  const handleSortToggle = (value: string) => {
    setSort((prev) => (prev === value ? null : value));
    setIsSortOpen(false);
  };

  const clearSort = () => {
    setSort(null);
    setIsSortOpen(false);
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
            {mode === 'edit' ? 'Edit Sieve' : 'Create Sieve'}
          </span>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-[16px] p-5">
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-semibold text-black/80">
              Sieve Name
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
            <div className="text-[14px] font-semibold text-black/80">
              Sort Order
            </div>
            <Popover
              isOpen={isSortOpen}
              onOpenChange={setIsSortOpen}
              placement="bottom-start"
              showArrow={false}
              offset={8}
              classNames={{
                trigger:
                  'w-full transition-none data-[pressed=true]:scale-100 data-[open=true]:scale-100',
                content:
                  'p-0 border border-black/10 rounded-[10px] shadow-[0_8px_24px_rgba(15,23,42,0.12)]',
              }}
            >
              <div className="relative">
                <PopoverTrigger>
                  <button
                    type="button"
                    className="relative flex h-[40px] w-full items-center rounded-[8px] border border-black/10 bg-[rgba(0,0,0,0.05)] pl-[12px] pr-[36px]"
                  >
                    <span className={sortTextClass}>{sortLabel}</span>
                    <CaretDownIcon
                      size={16}
                      className={`pointer-events-none absolute right-[12px] transition-transform ${
                        isSortOpen ? 'rotate-180' : ''
                      } ${sortIconClass}`}
                    />
                  </button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-[260px] bg-white">
                <div className="flex h-[300px] w-full flex-col gap-[16px] overflow-y-auto py-[12px]">
                  {Object.entries(groupedSortOptions).map(
                    ([category, options]) => (
                      <div
                        key={category}
                        className="flex flex-col gap-[6px] px-[12px]"
                      >
                        <span className="text-[12px] font-semibold text-black/35">
                          {CATEGORY_MAP[category] ?? `${category}:`}
                        </span>
                        <div className="flex flex-col gap-[4px]">
                          {options.map((option) => {
                            const isSelected = sort === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSortToggle(option.value)}
                                className={`flex h-[30px] items-center rounded-[6px] px-[8px] text-left text-[13px] transition-colors ${
                                  isSelected
                                    ? 'bg-black/10 font-semibold text-black'
                                    : 'text-black/70 hover:bg-black/5'
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-[12px] flex items-center justify-between text-[11px] text-black/45">
                  {sort && (
                    <button
                      type="button"
                      onClick={clearSort}
                      className="font-semibold text-black/60 hover:text-black"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-semibold text-black/80">
              Sub-category Filter
            </span>
            <div className="relative">
              <Select
                selectionMode="multiple"
                selectedKeys={new Set(selectedSubCategories)}
                onSelectionChange={handleSubCategorySelectionChange}
                placeholder="none"
                classNames={{
                  trigger:
                    'min-h-[40px] border border-black/10 bg-[rgba(0,0,0,0.05)] pl-[12px] pr-[36px] rounded-[8px]',
                  value: subCategoryValueClass,
                  // placeholder: 'text-[13px] font-normal text-black/45',
                  listbox:
                    'border border-black/10 rounded-[10px] bg-white p-[6px] max-h-[260px] overflow-auto',
                  popoverContent: 'p-0',
                  selectorIcon: `pointer-events-none right-[12px] ${subCategorySelectorClass}`,
                }}
              >
                {AllCategories.map((category) => (
                  <SelectItem
                    key={category.value}
                    textValue={category.label}
                    className="rounded-[8px] px-[10px] py-[6px]"
                  >
                    <span className="text-[13px] font-semibold text-black">
                      {category.label}
                    </span>
                  </SelectItem>
                ))}
              </Select>
            </div>
            {selectedSubCategories.length > 0 ? (
              <span className="text-[11px] text-black/50">
                {selectedSubCategories.length}{' '}
                {selectedSubCategories.length === 1
                  ? 'sub-category selected.'
                  : 'sub-categories selected.'}
              </span>
            ) : (
              <span className="text-[11px] text-black/50">
                Leave empty to include all sub-categories.
              </span>
            )}
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
                      <div className="flex flex-wrap items-center gap-[10px]">
                        {summary.items.map((item, itemIndex) => {
                          const parts = [item.label];
                          if (item.operatorLabel) {
                            parts.push(item.operatorLabel.toLowerCase());
                          }
                          if (item.valueLabel) {
                            parts.push(item.valueLabel);
                          }
                          const connectorLabel =
                            item.connector?.toLowerCase() ?? 'and';
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-[6px]"
                            >
                              {itemIndex > 0 && (
                                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/45">
                                  {connectorLabel}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded-[6px] bg-white px-[8px] py-[4px] text-[12px] text-black/70">
                                {parts.join(' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-[12px] text-black/50">
                No custom filters are attached to this sieve yet.
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
            <Select
              selectedKeys={new Set([visibility])}
              onSelectionChange={(keys) => {
                const [value] = Array.from(keys);
                if (value === 'public' || value === 'private') {
                  setVisibility(value);
                }
              }}
              disallowEmptySelection
              classNames={{
                trigger:
                  'h-[40px] border border-black/10 bg-[rgba(0,0,0,0.05)] px-[12px] rounded-[8px]',
                value: 'text-[13px] font-semibold text-black',
                listbox:
                  'border border-black/10 rounded-[10px] bg-white p-[6px]',
                popoverContent: 'p-0',
              }}
            >
              {visibilityOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  textValue={option.label}
                  className="rounded-[8px] px-[10px] py-[6px]"
                >
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[13px] font-semibold text-black">
                      {option.label}
                    </span>
                    <span className="text-[11px] text-black/60">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>
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
          <Button
            onPress={onClose}
            isDisabled={
              mode === 'edit'
                ? updateMutation.isPending
                : createMutation.isPending
            }
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={
              mode === 'edit'
                ? updateMutation.isPending
                : createMutation.isPending
            }
          >
            {mode === 'edit' ? 'Save Changes' : 'Create Sieve'}
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
