import * as yup from 'yup';

import { IItemKey } from '@/types/item';

import { CreateProjectStepFields } from '../components/pages/project/create/form/FormData';
import { AllItemConfig } from '../constants/itemConfig';
import { itemValidationSchemas } from '../constants/itemSchemas';

export function createDynamicProjectSchema(
  fieldApplicability?: Record<string, boolean>,
): yup.ObjectSchema<any> {
  const schemaShape: Record<string, yup.Schema<any>> = {};

  const allStepFieldKeys: string[] = [];
  Object.values(CreateProjectStepFields).forEach((stepFields) => {
    Object.keys(stepFields).forEach((fieldKey) => {
      if (!allStepFieldKeys.includes(fieldKey)) {
        allStepFieldKeys.push(fieldKey);
      }
    });
  });

  allStepFieldKeys.forEach((itemKey) => {
    const itemConfig = AllItemConfig[itemKey as IItemKey];
    if (!itemConfig) return;

    const isApplicable = fieldApplicability
      ? fieldApplicability[itemKey] !== false
      : true;

    if (!isApplicable) return;

    const validationSchema =
      itemValidationSchemas[itemKey as keyof typeof itemValidationSchemas];

    if (validationSchema) {
      schemaShape[itemKey] = validationSchema;
    }
  });

  return yup.object().shape(schemaShape);
}

export function createItemValidationSchema(
  itemKey: string,
  fieldApplicability?: Record<string, boolean>,
): yup.ObjectSchema<any> {
  const validationSchema =
    itemValidationSchemas[itemKey as keyof typeof itemValidationSchemas];

  const schemaShape: Record<string, yup.Schema<any>> = {};

  const isApplicable = fieldApplicability
    ? fieldApplicability[itemKey] !== false
    : true;

  if (!isApplicable) {
    schemaShape[itemKey] = yup.mixed().optional();
  } else if (validationSchema) {
    schemaShape[itemKey] = validationSchema;
  } else {
    schemaShape[itemKey] = yup.string().required(`${itemKey} is required`);
  }

  return yup.object().shape(schemaShape);
}

export function createValidationSchemaForItems(
  itemKeys: string[],
): yup.ObjectSchema<any> {
  const schemaShape: Record<string, yup.Schema<any>> = {};

  itemKeys.forEach((itemKey) => {
    const validationSchema =
      itemValidationSchemas[itemKey as keyof typeof itemValidationSchemas];
    if (validationSchema) {
      schemaShape[itemKey] = validationSchema;
    } else {
      schemaShape[itemKey] = yup.string().required(`${itemKey} is required`);
    }
  });

  return yup.object().shape(schemaShape);
}
