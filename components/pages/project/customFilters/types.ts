export type AdvancedFilterConnector = 'AND' | 'OR';

export type AdvancedFilterFieldType = 'special' | 'select';

export type AdvancedSpecialFieldKey = 'presetCondition';

export type AdvancedFilterOperator = 'is' | 'is_not';

export interface AdvancedFilterCondition {
  id: string;
  connector?: AdvancedFilterConnector;
  fieldType?: AdvancedFilterFieldType;
  fieldKey?: string;
  operator?: AdvancedFilterOperator;
  value?: string;
}

export interface AdvancedFilterCard {
  id: string;
  conditions: AdvancedFilterCondition[];
}

export interface AdvancedFilterModalResult {
  id?: string;
  conditions: AdvancedFilterCondition[];
}

export interface SpecialFieldDefinition {
  key: AdvancedSpecialFieldKey;
  label: string;
  description?: string;
  options: SelectFieldOption[];
}

export interface SelectFieldDefinition {
  key: string;
  label: string;
  options: SelectFieldOption[];
}

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SerializedAdvancedFilterCondition {
  id: string;
  connector?: AdvancedFilterConnector;
  fieldType: AdvancedFilterFieldType;
  fieldKey: string;
  operator: AdvancedFilterOperator;
  value?: string;
}

export interface SerializedAdvancedFilterCard {
  id: string;
  conditions: SerializedAdvancedFilterCondition[];
}

export interface SerializedAdvancedFilterPayload {
  version: number;
  filters: SerializedAdvancedFilterCard[];
}

export interface AdvancedFilterSummaryItem {
  id: string;
  label: string;
  operatorLabel?: string;
  valueLabel?: string;
  connector?: AdvancedFilterConnector;
}

export interface AdvancedFilterSummary {
  id: string;
  items: AdvancedFilterSummaryItem[];
}

export interface AdvancedFilterModalState {
  mode: 'create' | 'edit';
  filter: AdvancedFilterModalResult;
}
