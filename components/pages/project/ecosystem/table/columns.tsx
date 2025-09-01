'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import { getOptionLabel } from '@/components/biz/table';
import ColumnHeaderWithTooltip from '@/components/biz/table/ColumnHeaderWithTooltip';
import { AFFILIATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/AffiliatedProjectsTableItem';
import { CONTRIBUTION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/ContributingTeamsTableItem';
import { STACK_INTEGRATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/StackIntegrationsTableItem';
import { ProjectFieldRenderer } from '@/components/biz/table/ProjectFieldRenderer';
import {
  AFFILIATED_PROJECTS_COLUMNS,
  CONTRIBUTING_TEAMS_COLUMNS,
  STACK_INTEGRATIONS_COLUMNS,
} from '@/constants/tableColumnDescriptions';
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={STACK_INTEGRATIONS_COLUMNS.project.label}
            tooltip={STACK_INTEGRATIONS_COLUMNS.project.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={STACK_INTEGRATIONS_COLUMNS.type.label}
            tooltip={STACK_INTEGRATIONS_COLUMNS.type.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={STACK_INTEGRATIONS_COLUMNS.description.label}
            tooltip={STACK_INTEGRATIONS_COLUMNS.description.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={STACK_INTEGRATIONS_COLUMNS.reference.label}
            tooltip={STACK_INTEGRATIONS_COLUMNS.reference.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={STACK_INTEGRATIONS_COLUMNS.repository.label}
            tooltip={STACK_INTEGRATIONS_COLUMNS.repository.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={STACK_INTEGRATIONS_COLUMNS.page.label}
            tooltip={STACK_INTEGRATIONS_COLUMNS.page.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={CONTRIBUTING_TEAMS_COLUMNS.project.label}
            tooltip={CONTRIBUTING_TEAMS_COLUMNS.project.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={CONTRIBUTING_TEAMS_COLUMNS.description.label}
            tooltip={CONTRIBUTING_TEAMS_COLUMNS.description.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={CONTRIBUTING_TEAMS_COLUMNS.reference.label}
            tooltip={CONTRIBUTING_TEAMS_COLUMNS.reference.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={CONTRIBUTING_TEAMS_COLUMNS.page.label}
            tooltip={CONTRIBUTING_TEAMS_COLUMNS.page.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={AFFILIATED_PROJECTS_COLUMNS.project.label}
            tooltip={AFFILIATED_PROJECTS_COLUMNS.project.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={AFFILIATED_PROJECTS_COLUMNS.affiliationType.label}
            tooltip={AFFILIATED_PROJECTS_COLUMNS.affiliationType.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={AFFILIATED_PROJECTS_COLUMNS.description.label}
            tooltip={AFFILIATED_PROJECTS_COLUMNS.description.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={AFFILIATED_PROJECTS_COLUMNS.reference.label}
            tooltip={AFFILIATED_PROJECTS_COLUMNS.reference.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={AFFILIATED_PROJECTS_COLUMNS.page.label}
            tooltip={AFFILIATED_PROJECTS_COLUMNS.page.tooltip}
          />
        ),
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
