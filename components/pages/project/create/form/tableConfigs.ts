import { IColumnConfig } from '@/components/biz/table/GenericFormItemTable';
import { IPhysicalEntity } from '@/types/item';

import { IFounder, IWebsite } from '../types';

export const founderColumns: IColumnConfig<IFounder>[] = [
  {
    header: 'Full Name',
    accessor: 'name',
    placeholder: 'Type a name',
    width: 'w-[214px]',
  },
  {
    header: 'Title/Role',
    accessor: 'title',
    placeholder: 'Type a title',
  },
];

export const websiteColumns: IColumnConfig<IWebsite>[] = [
  {
    header: 'Website Title',
    accessor: 'title',
    placeholder: 'Type a title',
    width: 'w-[214px]',
  },
  {
    header: 'URL',
    accessor: 'url',
    placeholder: 'https://example.com',
  },
];

export const physicalEntityColumns: IColumnConfig<IPhysicalEntity>[] = [
  {
    header: 'Legal Name',
    accessor: 'legalName',
    placeholder: 'Type a legal name',
    width: 'w-[214px]',
  },
  {
    header: 'Country',
    accessor: 'country',
    placeholder: 'Type a country',
  },
];
