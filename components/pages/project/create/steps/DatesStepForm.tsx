'use client';

import { DateValue, parseDate } from '@internationalized/date';
import React from 'react';
import { Controller } from 'react-hook-form';

import { DatePicker, Select, SelectItem } from '@/components/base';
import { CalendarBlankIcon } from '@/components/icons';
import { datesFieldsConfig } from '@/components/pages/project/create/FormData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';
import dayjs from '@/lib/dayjs';

import { ProjectFormData, StepFormProps } from '../types';

const DatesStepForm: React.FC<
  Omit<StepFormProps, 'register' | 'hasFieldValue'>
> = ({
  control,
  errors,
  setValue,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}) => {
  const devStatusOptions = datesFieldsConfig.devStatus?.options || [];
  const fundingStatusOptions = datesFieldsConfig.fundingStatus?.options || [];

  const dateToDateValue = (date: Date | null | undefined): DateValue | null => {
    if (!date) return null;
    try {
      const dateString = dayjs(date).format('YYYY-MM-DD');
      return parseDate(dateString);
    } catch (e) {
      console.error('Error parsing date for DatePicker:', date, e);
      return null;
    }
  };

  const dateValueToDate = (dateValue: DateValue | null): Date | null => {
    if (!dateValue) return null;
    try {
      return dayjs(dateValue.toString()).toDate();
    } catch (e) {
      console.error('Error converting DateValue to Date:', dateValue, e);
      return null;
    }
  };

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {/* dateFounded */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: datesFieldsConfig.dateFounded,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={datesFieldsConfig.dateFounded.key}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <DatePicker
                showMonthAndYearPickers={true}
                value={dateToDateValue(field.value)}
                onChange={(value: DateValue | null) => {
                  field.onChange(dateValueToDate(value));
                }}
                isInvalid={!!error}
                errorMessage={error?.message}
                isRequired
                className="w-full"
                aria-label={datesFieldsConfig.dateFounded.label}
                radius="sm"
                selectorIcon={<CalendarBlankIcon size={20} />}
              />
            );
          }}
        />
      </FormFieldContainer>

      {/* dateLaunch */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: datesFieldsConfig.dateLaunch,
          showApplicable: true,
          isApplicable: fieldApplicability.dateLaunch,
          onChangeApplicability: (val) =>
            onChangeApplicability('dateLaunch', val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={datesFieldsConfig.dateLaunch.key}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <DatePicker
                showMonthAndYearPickers={true}
                value={dateToDateValue(field.value)}
                onChange={(value: DateValue | null) => {
                  field.onChange(dateValueToDate(value));
                }}
                isInvalid={!!error}
                errorMessage={error?.message}
                isDisabled={!fieldApplicability.dateLaunch}
                className="w-full"
                aria-label={datesFieldsConfig.dateLaunch.label}
                radius={'sm'}
                selectorIcon={<CalendarBlankIcon size={20} />}
              />
            );
          }}
        />
      </FormFieldContainer>

      {/* devStatus */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: datesFieldsConfig.devStatus,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={datesFieldsConfig.devStatus.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={datesFieldsConfig.devStatus.label}
              placeholder={datesFieldsConfig.devStatus.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                const valueAsString =
                  selectedKey !== undefined ? String(selectedKey) : '';
                field.onChange(valueAsString as ProjectFormData['devStatus']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              className="w-full"
            >
              {devStatusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  textValue={option.label}
                  aria-label={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </FormFieldContainer>

      {/* fundingStatus */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: datesFieldsConfig.fundingStatus,
          showApplicable: true,
          isApplicable: fieldApplicability.fundingStatus,
          onChangeApplicability: (val) =>
            onChangeApplicability('fundingStatus', val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={datesFieldsConfig.fundingStatus.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={datesFieldsConfig.fundingStatus.label}
              placeholder={datesFieldsConfig.fundingStatus.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? null;
                field.onChange(value as ProjectFormData['fundingStatus']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              isDisabled={!fieldApplicability.fundingStatus}
              className="w-full"
            >
              {fundingStatusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  textValue={option.label}
                  aria-label={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default DatesStepForm;
