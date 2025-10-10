import { ScrollShadow } from '@heroui/react';
import { useEffect, useMemo, useState, type Key } from 'react';

import { Button } from '@/components/base/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import { GearSixIcon, PlusIcon, XCircleIcon, XIcon } from '@/components/icons';

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

  if (condition.fieldType === 'select' || condition.fieldType === 'special') {
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
      // {
      //   key: 'label:special',
      //   label: 'Preset Conditions',
      //   isLabel: true,
      // },
      // ...specialFields.map((field) => ({
      //   key: `special:${field.key}`,
      //   label: field.label,
      // })),
      {
        key: 'label:select',
        label: 'Select Fields',
        isLabel: true,
      },
      ...specialFields.map((field) => ({
        key: `special:${field.key}`,
        label: field.label,
      })),
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
            const defaultOperator: AdvancedFilterOperator = 'is';
            const defaultValue = definition?.defaultValue ?? 'true';
            return {
              ...condition,
              fieldType: 'special',
              fieldKey: key,
              operator: defaultOperator,
              value: defaultValue,
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

  const baseSelectClassNames = {
    base: 'w-full',
    value: 'text-[14px] text-black',
    placeholder: 'text-[14px] text-black/40',
    selectorIcon: 'text-black/30',
    trigger:
      'w-full h-auto bg-transparent border-none shadow-none rounded-[8px] px-[10px] flex justify-between',
    inputWrapper: 'flex-1 w-full',
    listboxWrapper: 'rounded-[4px] bg-white !max-h-[500px]',
    listbox: 'border border-[rgba(0,0,0,0.1)] rounded-[4px] p-[4px]',
    popoverContent: 'p-0 min-w-max w-auto',
  };

  const connectorSelectClassNames = {
    ...baseSelectClassNames,
    trigger: `${baseSelectClassNames.trigger} min-w-[60px] min-h-[14px] gap-0 px-0`,
  };

  const readOnlyCellClass =
    'flex w-full items-center px-[4px] text-[12px] text-black/50';

  const renderConnectorCell = (
    condition: AdvancedFilterCondition,
    index: number,
  ) => {
    if (index === 0) {
      return (
        <span className="w-[60px] text-[14px] font-semibold tracking-[0.04em] text-black/60">
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
        classNames={connectorSelectClassNames}
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
        classNames={baseSelectClassNames}
      >
        {fieldOptions.map((item) => (
          <SelectItem
            key={item.key}
            isDisabled={Boolean(item.isLabel)}
            className={
              item.isLabel
                ? 'cursor-default px-[8px] py-[6px] text-[11px] font-semibold tracking-[0.08em] text-black/40'
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
      return <div className={readOnlyCellClass}>operator</div>;
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
        classNames={baseSelectClassNames}
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
          classNames={baseSelectClassNames}
        >
          {options.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
      );
    }

    if (condition.fieldType === 'special') {
      const field = getSpecialFieldByKey(
        condition.fieldKey as AdvancedSpecialFieldKey,
      );
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
          classNames={baseSelectClassNames}
        >
          {options.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
      );
    }

    return <div className={readOnlyCellClass}>Select field first</div>;
  };

  const renderConditionRow = (
    condition: AdvancedFilterCondition,
    index: number,
  ) => {
    return (
      <div
        key={condition.id}
        className="flex min-w-[720px] items-stretch overflow-hidden rounded-[5px] border border-black/10"
      >
        <div className="flex w-[80px] items-center justify-center border-r border-black/10 bg-black/[0.02] p-[10px]">
          {renderConnectorCell(condition, index)}
        </div>
        <div className="flex w-[180px]  items-center border-r border-black/10">
          {renderFieldSelector(condition)}
        </div>
        <div className="flex w-[100px] items-center border-r border-black/10">
          {renderOperatorSelector(condition)}
        </div>
        <div className="flex w-[180px] flex-1 items-center border-r border-black/10">
          {renderValueSelector(condition)}
        </div>
        <div className="flex w-[40px]  items-center justify-center px-[4px]">
          <Button
            isIconOnly
            onPress={() => handleRemoveCondition(condition.id)}
            aria-label="Remove condition"
            className="size-[30px] min-w-[24px] p-[3px]"
          >
            <XCircleIcon size={24} />
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
        base: 'w-[720px] max-w-[720px] mobile:w-[calc(90vw)] tablet:w-[calc(80vw)] bg-white mobile:p-[10px]',
        header: 'mb-[20px]',
        body: 'p-0',
        footer: '',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <GearSixIcon width={20} height={20} className="opacity-80" />
            <h2 className="text-[14px] font-semibold text-black/60">
              Custom Filter
            </h2>
          </div>
          <Button
            isIconOnly
            onPress={onClose}
            aria-label="Close"
            size="sm"
            radius="sm"
          >
            <XIcon width={18} height={18} className="opacity-60" />
          </Button>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-[10px]">
          <ScrollShadow orientation="horizontal" className="w-full max-w-full">
            <div className="flex min-w-[720px] flex-col gap-[10px] pr-[6px]">
              {draft.conditions.map((condition, index) =>
                renderConditionRow(condition, index),
              )}
            </div>
          </ScrollShadow>
          <div className="flex justify-start">
            <Button
              size="sm"
              onPress={handleAddCondition}
              className="flex  items-center justify-center gap-[8px] border-none bg-transparent text-[14px] font-semibold text-black/60"
            >
              <PlusIcon className="opacity-50" size={18} />
              Add Condition
            </Button>
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-[16px]">
          <Button
            color="primary"
            radius="sm"
            className="h-[44px] w-full rounded-[6px] text-[15px] font-semibold"
            isDisabled={!isValid}
            onPress={handleSave}
          >
            {state?.mode === 'edit' ? 'Save Changes' : 'Save Filter'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomFilterModal;
