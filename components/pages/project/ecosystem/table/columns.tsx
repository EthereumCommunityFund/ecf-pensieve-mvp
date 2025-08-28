'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import {
  IAffiliatedProject,
  IContributingTeam,
  IStackIntegration,
} from '@/types/item';

const ProjectCell = ({ value }: { value: string | string[] }) => {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex items-center gap-[8px]">
      <div className="flex size-[24px] items-center justify-center rounded-full bg-[#1E40AF]">
        <span className="text-[10px] font-bold text-white">E</span>
      </div>
      <span className="text-[14px] text-black">{displayValue}</span>
    </div>
  );
};

const TextCell = ({ value }: { value: string }) => (
  <span className="text-[14px] text-black">{value}</span>
);

const DescriptionCell = ({ value }: { value?: string }) => (
  <span className="text-[14px] text-black/80">{value || ''}</span>
);

const LinkCell = ({ value }: { value?: string }) => {
  return value ? (
    <button className="text-[14px] text-black/60 transition-colors hover:text-black">
      {value}
    </button>
  ) : (
    <span className="text-[14px] text-black/30">empty</span>
  );
};

const PageCell = () => (
  <button className="text-[14px] font-[500] text-black transition-colors hover:text-[#1E40AF]">
    View Linkage
  </button>
);

export const useStackIntegrationsColumns = () => {
  const columnHelper = useMemo(
    () => createColumnHelper<IStackIntegration>(),
    [],
  );

  return useMemo(() => {
    return [
      columnHelper.accessor('project', {
        id: 'project',
        header: () => 'Project',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => (
          <ProjectCell value={info.getValue() as string | string[]} />
        ),
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: () => 'Relation',
        size: 160,
        minSize: 160,
        maxSize: 160,
        enableResizing: false,
        cell: (info) => <TextCell value={info.getValue() as string} />,
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: () => 'Description',
        size: 280,
        minSize: 280,
        maxSize: 280,
        enableResizing: false,
        cell: (info) => (
          <DescriptionCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.accessor('reference', {
        id: 'reference',
        header: () => 'Reference',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => (
          <LinkCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.accessor('repository', {
        id: 'repository',
        header: () => 'Repository',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => (
          <LinkCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.display({
        id: 'page',
        header: () => 'Page',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: () => <PageCell />,
      }),
    ] as ColumnDef<IStackIntegration>[];
  }, [columnHelper]);
};

export const useContributingTeamsColumns = () => {
  const columnHelper = useMemo(
    () => createColumnHelper<IContributingTeam>(),
    [],
  );

  return useMemo(() => {
    return [
      columnHelper.accessor('project', {
        id: 'project',
        header: () => 'Project',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => (
          <ProjectCell value={info.getValue() as string | string[]} />
        ),
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: () => 'Contribution Area',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => <TextCell value={info.getValue() as string} />,
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: () => 'Description',
        size: 380,
        minSize: 380,
        maxSize: 380,
        enableResizing: false,
        cell: (info) => (
          <DescriptionCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.accessor('reference', {
        id: 'reference',
        header: () => 'Reference',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => (
          <LinkCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.display({
        id: 'page',
        header: () => 'Page',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: () => <PageCell />,
      }),
    ] as ColumnDef<IContributingTeam>[];
  }, [columnHelper]);
};

export const useAffiliatedProjectsColumns = () => {
  const columnHelper = useMemo(
    () => createColumnHelper<IAffiliatedProject>(),
    [],
  );

  return useMemo(() => {
    return [
      columnHelper.accessor('project', {
        id: 'project',
        header: () => 'Project',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => (
          <ProjectCell value={info.getValue() as string | string[]} />
        ),
      }),
      columnHelper.accessor('affiliationType', {
        id: 'affiliationType',
        header: () => 'Affiliation Type',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => <TextCell value={info.getValue() as string} />,
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: () => 'Description',
        size: 380,
        minSize: 380,
        maxSize: 380,
        enableResizing: false,
        cell: (info) => (
          <DescriptionCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.accessor('reference', {
        id: 'reference',
        header: () => 'Reference',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => (
          <LinkCell value={info.getValue() as string | undefined} />
        ),
      }),
      columnHelper.display({
        id: 'page',
        header: () => 'Page',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: () => <PageCell />,
      }),
    ] as ColumnDef<IAffiliatedProject>[];
  }, [columnHelper]);
};
