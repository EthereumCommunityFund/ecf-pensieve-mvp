'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import { getOptionLabel } from '@/components/biz/table';
import { AFFILIATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/AffiliatedProjectsTableItem';
import { CONTRIBUTION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/ContributingTeamsTableItem';
import { STACK_INTEGRATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/StackIntegrationsTableItem';
import { ProjectFieldRenderer } from '@/components/biz/table/ProjectFieldRenderer';
import {
  IAffiliatedProject,
  IContributingTeam,
  IStackIntegration,
} from '@/types/item';

const TextCell = ({ value }: { value: string }) => (
  <span className="text-[14px] text-black">{value}</span>
);

const DescriptionCell = ({ value }: { value?: string }) => (
  <span className="text-[14px] text-black/80">{value || ''}</span>
);

const LinkCell = ({ value }: { value?: string }) => {
  if (!value) {
    return <span className="text-[14px] text-black/30">-</span>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[14px] text-black/60 underline transition-colors hover:text-black"
    >
      {value}
    </a>
  );
};

const PageCell = ({ projectId }: { projectId: string }) => (
  <Link
    href={`/project/${projectId}`}
    target="_blank"
    className="text-[14px] font-[500] text-black transition-colors hover:text-black/70 hover:underline"
  >
    View Linkage
  </Link>
);

export const useStackIntegrationsColumns = () => {
  const columnHelper = useMemo(
    () => createColumnHelper<IStackIntegration>(),
    [],
  );

  return useMemo(() => {
    return [
      columnHelper.display({
        id: 'project',
        header: () => 'Project',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: ({ row, table }) => {
          const item = row.original;
          // @ts-ignore - Access custom meta from table
          const { projectsMap, isLoadingProjects } = table.options.meta || {};

          return (
            <ProjectFieldRenderer
              projectValue={item.project}
              projectsMap={projectsMap}
              isLoadingProjects={isLoadingProjects || false}
              showProjectIconAndName={true}
            />
          );
        },
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: () => 'Relation',
        size: 160,
        minSize: 160,
        maxSize: 160,
        enableResizing: false,
        cell: (info) => (
          <TextCell
            value={getOptionLabel(
              info.getValue() as string,
              STACK_INTEGRATION_TYPE_OPTIONS,
            )}
          />
        ),
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
        cell: ({ row }) => {
          const projectValue = row.original.project;
          // Extract projectId from array format [id] or direct string
          const projectId = Array.isArray(projectValue)
            ? projectValue[0]
            : projectValue;

          if (!projectId) return null;

          return <PageCell projectId={projectId} />;
        },
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
      columnHelper.display({
        id: 'project',
        header: () => 'Project',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: ({ row, table }) => {
          const item = row.original;
          // @ts-ignore - Access custom meta from table
          const { projectsMap, isLoadingProjects } = table.options.meta || {};

          return (
            <ProjectFieldRenderer
              projectValue={item.project}
              projectsMap={projectsMap}
              isLoadingProjects={isLoadingProjects || false}
              showProjectIconAndName={true}
            />
          );
        },
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: () => 'Contribution Area',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => (
          <TextCell
            value={getOptionLabel(
              info.getValue() as string,
              CONTRIBUTION_TYPE_OPTIONS,
            )}
          />
        ),
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
        cell: ({ row }) => {
          const projectValue = row.original.project;
          // Extract projectId from array format [id] or direct string
          const projectId = Array.isArray(projectValue)
            ? projectValue[0]
            : projectValue;

          if (!projectId) return null;

          return <PageCell projectId={projectId} />;
        },
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
      columnHelper.display({
        id: 'project',
        header: () => 'Project',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: ({ row, table }) => {
          const item = row.original;
          // @ts-ignore - Access custom meta from table
          const { projectsMap, isLoadingProjects } = table.options.meta || {};

          return (
            <ProjectFieldRenderer
              projectValue={item.project}
              projectsMap={projectsMap}
              isLoadingProjects={isLoadingProjects || false}
              showProjectIconAndName={true}
            />
          );
        },
      }),
      columnHelper.accessor('affiliationType', {
        id: 'affiliationType',
        header: () => 'Affiliation Type',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => (
          <TextCell
            value={getOptionLabel(
              info.getValue() as string,
              AFFILIATION_TYPE_OPTIONS,
            )}
          />
        ),
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
        cell: ({ row }) => {
          const projectValue = row.original.project;
          // Extract projectId from array format [id] or direct string
          const projectId = Array.isArray(projectValue)
            ? projectValue[0]
            : projectValue;

          if (!projectId) return null;

          return <PageCell projectId={projectId} />;
        },
      }),
    ] as ColumnDef<IAffiliatedProject>[];
  }, [columnHelper]);
};
