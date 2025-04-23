'use client';

import { DatePicker, Select, SelectItem } from '@heroui/react';
import { DateValue, parseDate } from '@internationalized/date';
import dayjs from 'dayjs';
import React from 'react';
import { Controller } from 'react-hook-form';

import { datesFieldsConfig } from '@/components/pages/project/create/formData';

import { FormFieldContainer } from '../FormFieldContainer';
import { ProjectFormData, StepFormProps } from '../types';

const DatesStepForm: React.FC<Omit<StepFormProps, 'register'>> = ({
  control,
  errors,
  setValue,
  onAddReference,
  applicableStates,
  onChangeApplicableStates,
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
    <div className="flex flex-col gap-[40px]">
      <FormFieldContainer
        label={datesFieldsConfig.dateFounded.label}
        description={datesFieldsConfig.dateFounded.description}
        shortDescription={datesFieldsConfig.dateFounded.shortDescription}
        weight={datesFieldsConfig.dateFounded.weight}
        showReference={datesFieldsConfig.dateFounded.showReference}
        onAddReference={
          datesFieldsConfig.dateFounded.showReference
            ? () =>
                onAddReference(
                  datesFieldsConfig.dateFounded.key,
                  datesFieldsConfig.dateFounded.label,
                )
            : undefined
        }
      >
        <Controller
          name={datesFieldsConfig.dateFounded.key}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <DatePicker
                value={dateToDateValue(field.value)}
                onChange={(value: DateValue | null) => {
                  field.onChange(dateValueToDate(value));
                }}
                isInvalid={!!error}
                errorMessage={error?.message}
                isRequired
                className="w-full"
                aria-label={datesFieldsConfig.dateFounded.label}
              />
            );
          }}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={datesFieldsConfig.dateLaunch.label}
        description={datesFieldsConfig.dateLaunch.description}
        shortDescription={datesFieldsConfig.dateLaunch.shortDescription}
        weight={datesFieldsConfig.dateLaunch.weight}
        showReference={datesFieldsConfig.dateLaunch.showReference}
        showApplicable={true}
        isApplicable={applicableStates.dateLaunch}
        onApplicableChange={(val) =>
          onChangeApplicableStates('dateLaunch', val)
        }
        onAddReference={
          datesFieldsConfig.dateLaunch.showReference
            ? () =>
                onAddReference(
                  datesFieldsConfig.dateLaunch.key,
                  datesFieldsConfig.dateLaunch.label,
                )
            : undefined
        }
      >
        <Controller
          name={datesFieldsConfig.dateLaunch.key}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <DatePicker
                value={dateToDateValue(field.value)}
                onChange={(value: DateValue | null) => {
                  field.onChange(dateValueToDate(value));
                }}
                isInvalid={!!error}
                errorMessage={error?.message}
                isDisabled={!applicableStates.dateLaunch}
                className="w-full"
                aria-label={datesFieldsConfig.dateLaunch.label}
              />
            );
          }}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={datesFieldsConfig.devStatus.label}
        description={datesFieldsConfig.devStatus.description}
        shortDescription={datesFieldsConfig.devStatus.shortDescription}
        weight={datesFieldsConfig.devStatus.weight}
        showReference={datesFieldsConfig.devStatus.showReference}
        onAddReference={
          datesFieldsConfig.devStatus.showReference
            ? () =>
                onAddReference(
                  datesFieldsConfig.devStatus.key,
                  datesFieldsConfig.devStatus.label,
                )
            : undefined
        }
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
                const value = Array.from(keys)[0] ?? '';
                field.onChange(value as ProjectFormData['devStatus']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              items={devStatusOptions}
              className="w-full"
            >
              {(item) => (
                <SelectItem key={item.value} textValue={item.label}>
                  {item.label}
                </SelectItem>
              )}
            </Select>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={datesFieldsConfig.fundingStatus.label}
        description={datesFieldsConfig.fundingStatus.description}
        shortDescription={datesFieldsConfig.fundingStatus.shortDescription}
        weight={datesFieldsConfig.fundingStatus.weight}
        showReference={datesFieldsConfig.fundingStatus.showReference}
        showApplicable={true}
        isApplicable={applicableStates.fundingStatus}
        onApplicableChange={(val) =>
          onChangeApplicableStates('fundingStatus', val)
        }
        onAddReference={
          datesFieldsConfig.fundingStatus.showReference
            ? () =>
                onAddReference(
                  datesFieldsConfig.fundingStatus.key,
                  datesFieldsConfig.fundingStatus.label,
                )
            : undefined
        }
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
              items={fundingStatusOptions}
              isDisabled={!applicableStates.fundingStatus}
              className="w-full"
            >
              {(item) => (
                <SelectItem key={item.value} textValue={item.label}>
                  {item.label}
                </SelectItem>
              )}
            </Select>
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default DatesStepForm;
