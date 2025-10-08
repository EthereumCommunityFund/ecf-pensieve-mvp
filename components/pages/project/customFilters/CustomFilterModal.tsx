import { useEffect, useMemo, useState, type Key } from 'react';

import { Button, ECFButton } from '@/components/base/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import {
  CircleXIcon,
  GearSixIcon,
  PlusSquareOutlineIcon,
} from '@/components/icons';

import {
  type AdvancedFilterCard,
  type AdvancedFilterCondition,
  type AdvancedFilterModalState,
  type AdvancedFilterOperator,
  type AdvancedSpecialFieldKey,
  type SelectFieldDefinition,
  type SpecialFieldDefinition,
} from './types';
import {
  cloneFilter,
  createEmptyCondition,
  createEmptyFilter,
  generateFilterId,
  getOperatorLabel,
  getSelectFieldByKey,
  getSelectFieldDefinitions,
  getSpecialFieldByKey,
  getSpecialFieldDefinitions,
} from './utils';

interface CustomFilterModalProps {
  isOpen: boolean;
  state: AdvancedFilterModalState | null;
  onClose: () => void;
  onSave: (filter: AdvancedFilterCard) => void;
  onDelete?: (id: string) => void;
}

type Selection = 'all' | Set<Key>;

const normalizeConnectors = (
  conditions: AdvancedFilterCondition[],
): AdvancedFilterCondition[] =>
  conditions.map((condition, index) => ({
    ...condition,
    connector:
      index === 0 ? undefined : (condition.connector ?? ('AND' as const)),
  }));

const isConditionComplete = (condition: AdvancedFilterCondition): boolean => {
  if (!condition.fieldType || !condition.fieldKey || !condition.operator) {
    return false;
  }

  if (condition.fieldType === 'select') {
    return Boolean(condition.value);
  }

  return true;
};

const getFirstSelectionValue = (keys: Selection): string | undefined => {
  if (keys === 'all') {
    return undefined;
  }

  const [first] = Array.from(keys);
  if (first === undefined || first === null) {
    return undefined;
  }

  return typeof first === 'string' ? first : String(first);
};

const isAdvancedFilterOperator = (
  value: string,
): value is AdvancedFilterOperator => {
  switch (value) {
    case 'is':
    case 'is_not':
    case 'is_empty':
    case 'is_not_empty':
    case 'pre_stage':
    case 'financial_complete':
    case 'has_contact':
      return true;
    default:
      return false;
  }
};

const getDefaultSelectOperator = (
  current?: AdvancedFilterOperator,
): AdvancedFilterOperator => (current === 'is_not' ? 'is_not' : 'is');

const CustomFilterModal = ({
  isOpen,
  state,
  onClose,
  onSave,
  onDelete,
}: CustomFilterModalProps) => {
  type FieldOption = {
    key: string;
    label: string;
    isLabel?: boolean;
  };
  const [draft, setDraft] = useState<AdvancedFilterCard | null>(null);
  const [selectFields] = useState<SelectFieldDefinition[]>(() =>
    getSelectFieldDefinitions(),
  );
  const [specialFields] = useState<SpecialFieldDefinition[]>(() =>
    getSpecialFieldDefinitions(),
  );

  const fieldOptions = useMemo<FieldOption[]>(() => {
    const options: FieldOption[] = [
      {
        key: 'label:special',
        label: 'Special Conditions',
        isLabel: true,
      },
      ...specialFields.map((field) => ({
        key: `special:${field.key}`,
        label: field.label,
      })),
      {
        key: 'label:select',
        label: 'Select Fields',
        isLabel: true,
      },
      ...selectFields.map((field) => ({
        key: `select:${field.key}`,
        label: field.label,
      })),
    ];

    return options;
  }, [selectFields, specialFields]);

  useEffect(() => {
    if (!isOpen) {
      setDraft(null);
      return;
    }

    if (state?.mode === 'edit' && state.filter.id) {
      setDraft(
        cloneFilter({
          id: state.filter.id,
          conditions: normalizeConnectors(state.filter.conditions),
        }),
      );
    } else {
      const baseFilter = state?.filter?.conditions?.length
        ? {
            id: state.filter.id ?? generateFilterId(),
            conditions: normalizeConnectors(state.filter.conditions),
          }
        : createEmptyFilter();
      setDraft(baseFilter);
    }
  }, [isOpen, state]);

  const handleConnectorChange = (
    conditionId: string,
    connector: 'AND' | 'OR',
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const conditions = prev.conditions.map((condition) =>
        condition.id === conditionId
          ? {
              ...condition,
              connector,
            }
          : condition,
      );
      return {
        ...prev,
        conditions: normalizeConnectors(conditions),
      };
    });
  };

  const handleFieldChange = (
    conditionId: string,
    type: 'special' | 'select',
    key: string,
  ) => {
    setDraft((prev): AdvancedFilterCard | null => {
      if (!prev) return prev;
      const conditions = prev.conditions.map<AdvancedFilterCondition>(
        (condition) => {
          if (condition.id !== conditionId) {
            return condition;
          }

          if (type === 'special') {
            const definition = getSpecialFieldByKey(
              key as AdvancedSpecialFieldKey,
            );
            const defaultOperator = definition?.operators[0]?.value;
            return {
              ...condition,
              fieldType: 'special',
              fieldKey: key,
              operator: defaultOperator ?? condition.operator,
              value: undefined,
            };
          }

          const definition = getSelectFieldByKey(key);
          const defaultOption = definition?.options?.[0];
          return {
            ...condition,
            fieldType: 'select',
            fieldKey: key,
            operator: getDefaultSelectOperator(condition.operator),
            value: defaultOption?.value ?? '',
          };
        },
      );

      return {
        ...prev,
        conditions,
      };
    });
  };

  const handleOperatorChange = (
    conditionId: string,
    operator: AdvancedFilterOperator,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const conditions = prev.conditions.map((condition) =>
        condition.id === conditionId
          ? {
              ...condition,
              operator,
            }
          : condition,
      );
      return { ...prev, conditions };
    });
  };

  const handleValueChange = (conditionId: string, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const conditions = prev.conditions.map((condition) =>
        condition.id === conditionId
          ? {
              ...condition,
              value,
            }
          : condition,
      );
      return { ...prev, conditions };
    });
  };

  const handleAddCondition = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextConditions = [...prev.conditions, createEmptyCondition('AND')];
      return {
        ...prev,
        conditions: normalizeConnectors(nextConditions),
      };
    });
  };

  const handleRemoveCondition = (conditionId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextConditions = prev.conditions.filter(
        (condition) => condition.id !== conditionId,
      );

      if (nextConditions.length === 0) {
        return {
          ...prev,
          conditions: [createEmptyCondition(undefined)],
        };
      }

      return {
        ...prev,
        conditions: normalizeConnectors(nextConditions),
      };
    });
  };

  const isValid = useMemo(() => {
    if (!draft) {
      return false;
    }
    return (
      draft.conditions.length > 0 &&
      draft.conditions.every((condition) => isConditionComplete(condition))
    );
  }, [draft]);

  const handleSave = () => {
    if (!draft || !isValid) {
      return;
    }

    const normalizedFilter: AdvancedFilterCard = {
      id: draft.id ?? generateFilterId(),
      conditions: normalizeConnectors(draft.conditions).map(
        (condition, index) => ({
          ...condition,
          connector: index === 0 ? undefined : condition.connector,
        }),
      ),
    };

    onSave(normalizedFilter);
  };

  const handleDeleteFilter = () => {
    if (!draft?.id || !onDelete) {
      return;
    }
    onDelete(draft.id);
  };

  const renderConnectorCell = (
    condition: AdvancedFilterCondition,
    index: number,
  ) => {
    if (index === 0) {
      return (
        <span className="rounded-[4px] bg-black/80 px-[10px] py-[6px] text-[12px] font-semibold uppercase tracking-[0.04em] text-white">
          Where
        </span>
      );
    }

    const selectedConnector = condition.connector ?? 'AND';

    return (
      <Select
        selectedKeys={new Set([selectedConnector])}
        onSelectionChange={(keys) => {
          const selected = getFirstSelectionValue(keys);
          if (selected !== 'AND' && selected !== 'OR') {
            return;
          }
          handleConnectorChange(condition.id, selected);
        }}
        aria-label="Condition connector"
        classNames={{
          base: 'text-[13px]',
          trigger:
            'h-[38px] rounded-[6px] border border-black/10 bg-white px-[8px]',
          value: 'text-[13px] font-semibold text-black/70',
          listboxWrapper: 'rounded-[8px] border border-black/10 bg-white',
        }}
      >
        <SelectItem key="AND">AND</SelectItem>
        <SelectItem key="OR">OR</SelectItem>
      </Select>
    );
  };

  const renderFieldSelector = (condition: AdvancedFilterCondition) => {
    const currentValue = condition.fieldType
      ? `${condition.fieldType}:${condition.fieldKey}`
      : '';

    return (
      <Select
        selectedKeys={
          currentValue ? new Set([currentValue]) : new Set<string>()
        }
        onSelectionChange={(keys) => {
          const selected = getFirstSelectionValue(keys);
          if (!selected || selected.startsWith('label:')) {
            return;
          }
          const [type, key] = selected.split(':');
          if (!type || !key) {
            return;
          }
          handleFieldChange(condition.id, type as 'special' | 'select', key);
        }}
        placeholder="Select field"
        aria-label="Filter field"
        classNames={{
          base: 'text-[13px]',
          trigger:
            'h-[38px] rounded-[6px] border border-black/10 bg-white px-[8px]',
          value: 'text-[13px] font-semibold text-black/70',
          listboxWrapper: 'rounded-[8px] border border-black/10 bg-white',
        }}
      >
        {fieldOptions.map((item) => (
          <SelectItem
            key={item.key}
            isDisabled={Boolean(item.isLabel)}
            className={
              item.isLabel
                ? 'cursor-default px-[8px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.08em] text-black/40'
                : undefined
            }
            textValue={item.label}
          >
            {item.label}
          </SelectItem>
        ))}
      </Select>
    );
  };

  const renderOperatorSelector = (condition: AdvancedFilterCondition) => {
    if (!condition.fieldType || !condition.fieldKey) {
      return (
        <div className="flex h-[38px] items-center rounded-[6px] border border-dashed border-black/10 px-[8px] text-[13px] text-black/40">
          Select field first
        </div>
      );
    }

    if (condition.fieldType === 'special') {
      const field = getSpecialFieldByKey(
        condition.fieldKey as AdvancedSpecialFieldKey,
      );
      const options = field?.operators ?? [];
      const selectedOperator = condition.operator ?? options[0]?.value ?? '';

      return (
        <Select
          selectedKeys={
            selectedOperator ? new Set([selectedOperator]) : new Set<string>()
          }
          onSelectionChange={(keys) => {
            const selected = getFirstSelectionValue(keys);
            if (!selected || !isAdvancedFilterOperator(selected)) {
              return;
            }
            handleOperatorChange(condition.id, selected);
          }}
          aria-label="Condition operator"
          classNames={{
            base: 'text-[13px]',
            trigger:
              'h-[38px] rounded-[6px] border border-black/10 bg-white px-[8px]',
            value: 'text-[13px] font-semibold text-black/70',
            listboxWrapper: 'rounded-[8px] border border-black/10 bg-white',
          }}
        >
          {options.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
      );
    }

    const selectedOperator = condition.operator ?? 'is';

    return (
      <Select
        selectedKeys={new Set([selectedOperator])}
        onSelectionChange={(keys) => {
          const selected = getFirstSelectionValue(keys);
          if (!selected || !isAdvancedFilterOperator(selected)) {
            return;
          }
          handleOperatorChange(condition.id, selected);
        }}
        aria-label="Select operator"
        classNames={{
          base: 'text-[13px]',
          trigger:
            'h-[38px] rounded-[6px] border border-black/10 bg-white px-[8px]',
          value: 'text-[13px] font-semibold text-black/70',
          listboxWrapper: 'rounded-[8px] border border-black/10 bg-white',
        }}
      >
        <SelectItem key="is">is</SelectItem>
        <SelectItem key="is_not">is not</SelectItem>
      </Select>
    );
  };

  const renderValueSelector = (condition: AdvancedFilterCondition) => {
    if (condition.fieldType === 'select') {
      const field = condition.fieldKey
        ? getSelectFieldByKey(condition.fieldKey)
        : null;
      const options = field?.options ?? [];
      return (
        <Select
          selectedKeys={
            condition.value ? new Set([condition.value]) : new Set<string>()
          }
          onSelectionChange={(keys) => {
            const selected = getFirstSelectionValue(keys);
            if (!selected) {
              return;
            }
            handleValueChange(condition.id, selected);
          }}
          aria-label="Condition value"
          placeholder="Select value"
          classNames={{
            base: 'text-[13px]',
            trigger:
              'h-[38px] rounded-[6px] border border-black/10 bg-white px-[8px]',
            value: 'text-[13px] font-semibold text-black/70',
            listboxWrapper: 'rounded-[8px] border border-black/10 bg-white',
          }}
        >
          {options.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
      );
    }

    if (condition.fieldType === 'special') {
      const operatorLabel = condition.operator
        ? getOperatorLabel(condition.operator)
        : 'Select operator';
      return (
        <div className="flex h-[38px] items-center rounded-[6px] border border-dashed border-black/10 px-[8px] text-[13px] text-black/50">
          {operatorLabel}
        </div>
      );
    }

    return (
      <div className="flex h-[38px] items-center rounded-[6px] border border-dashed border-black/10 px-[8px] text-[13px] text-black/40">
        Select field first
      </div>
    );
  };

  const renderConditionRow = (
    condition: AdvancedFilterCondition,
    index: number,
  ) => {
    return (
      <div
        key={condition.id}
        className="grid w-full grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] items-center gap-[10px] rounded-[8px] border border-black/10 bg-white px-[10px] py-[8px]"
      >
        <div className="flex items-center justify-start">
          {renderConnectorCell(condition, index)}
        </div>
        <div>{renderFieldSelector(condition)}</div>
        <div>{renderOperatorSelector(condition)}</div>
        <div>{renderValueSelector(condition)}</div>
        <div className="flex items-center justify-center">
          <Button
            isIconOnly
            size="sm"
            onPress={() => handleRemoveCondition(condition.id)}
            aria-label="Remove condition"
            className="min-w-0 rounded-full border border-black/10 bg-white text-black/40 hover:bg-[#F5F5F5] hover:text-black"
          >
            <CircleXIcon width={16} height={16} />
          </Button>
        </div>
      </div>
    );
  };

  if (!draft) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'w-[720px] max-w-[720px] mobile:w-[calc(100vw-40px)]',
        body: 'p-0',
        header: 'px-[20px] pb-[10px]',
        footer: 'px-[20px] pt-[20px] pb-[10px]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-black/10 pb-[12px]">
          <div className="flex items-center gap-[8px]">
            <GearSixIcon width={20} height={20} className="text-black" />
            <h2 className="text-[18px] font-semibold text-black">
              Custom Filter
            </h2>
          </div>
          <Button
            size="sm"
            onPress={onClose}
            className="h-auto border-none bg-transparent p-0 text-[13px] font-semibold text-black/60 hover:text-black"
          >
            Close
          </Button>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-[12px] p-[20px]">
          <div className="flex flex-col gap-[10px]">
            {draft.conditions.map((condition, index) =>
              renderConditionRow(condition, index),
            )}
          </div>

          <Button
            size="sm"
            onPress={handleAddCondition}
            className="mt-[10px] flex h-[36px] items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-black/20 bg-white text-[13px] font-semibold text-black/60 hover:bg-[#F8F8F8]"
          >
            <PlusSquareOutlineIcon size={18} className="text-black/50" />
            Add Condition
          </Button>
        </ModalBody>

        <ModalFooter className="flex items-center justify-between gap-[10px] border-t border-black/10 pt-[16px]">
          {state?.mode === 'edit' && onDelete ? (
            <Button
              size="sm"
              onPress={handleDeleteFilter}
              className="h-auto border-none bg-transparent p-0 text-[13px] font-semibold text-[#D14343] hover:underline"
            >
              Delete Filter
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-[10px]">
            <Button
              size="sm"
              onPress={onClose}
              className="h-[36px] rounded-[6px] border border-black/10 bg-white px-[14px] text-[13px] font-semibold text-black/60 hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <ECFButton isDisabled={!isValid} onPress={handleSave} $size="small">
              {state?.mode === 'edit' ? 'Save Changes' : 'Create Filter'}
            </ECFButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomFilterModal;
