'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { trpc } from '@/lib/trpc/client';
import {
  IAffiliatedProject,
  IContributingTeam,
  IStackIntegration,
} from '@/types/item';
import { devLog } from '@/utils/devLog';

export function useReverseEcosystemData(projectId: number) {
  // Step 1: Get ecosystem relations for the project
  const { data: relations, isLoading: isLoadingRelations } =
    trpc.projectRelation.getEcosystemRelations.useQuery(
      { projectId },
      {
        enabled: !!projectId,
        select(data) {
          devLog('getEcosystemRelations for reverse', data);
          return data;
        },
      },
    );

  const utils = trpc.useUtils();

  // Extract source IDs for each ecosystem section
  const stackIntegrationsTargets = useMemo(() => {
    return relations?.stackIntegrations.asTarget ?? [];
  }, [relations?.stackIntegrations.asTarget]);

  const stackIntegrationsSourceIds = useMemo(() => {
    return Array.from(
      new Set(
        stackIntegrationsTargets
          .map((r) => r.sourceProjectId)
          .filter((id): id is number => !!id),
      ),
    );
  }, [stackIntegrationsTargets]);

  const contributingTeamsTargets = useMemo(() => {
    return relations?.contributingTeams.asTarget ?? [];
  }, [relations?.contributingTeams.asTarget]);

  const contributingTeamsSourceIds = useMemo(() => {
    return Array.from(
      new Set(
        contributingTeamsTargets
          .map((r) => r.sourceProjectId)
          .filter((id): id is number => !!id),
      ),
    );
  }, [contributingTeamsTargets]);

  const affiliatedProjectsTargets = useMemo(() => {
    return relations?.affiliatedProjects.asTarget ?? [];
  }, [relations?.affiliatedProjects.asTarget]);

  const affiliatedProjectsSourceIds = useMemo(() => {
    return Array.from(
      new Set(
        affiliatedProjectsTargets
          .map((r) => r.sourceProjectId)
          .filter((id): id is number => !!id),
      ),
    );
  }, [affiliatedProjectsTargets]);

  // Fetch proposals for stack integrations
  const {
    data: stackIntegrationsProposals,
    isLoading: isLoadingStackIntegrations,
  } = useQuery({
    queryKey: [
      'ecosystem-reverse',
      'stack_integrations',
      projectId,
      stackIntegrationsSourceIds,
    ],
    queryFn: async () => {
      if (stackIntegrationsSourceIds.length === 0) return [];

      const results = await Promise.all(
        stackIntegrationsSourceIds.map((sourceId) =>
          utils.client.projectLog.getProposalsByProjectIdAndKey.query({
            projectId: sourceId,
            key: 'stack_integrations',
          }),
        ),
      );
      return results;
    },
    enabled: stackIntegrationsSourceIds.length > 0,
  });

  // Fetch proposals for contributing teams
  const {
    data: contributingTeamsProposals,
    isLoading: isLoadingContributingTeams,
  } = useQuery({
    queryKey: [
      'ecosystem-reverse',
      'contributing_teams',
      projectId,
      contributingTeamsSourceIds,
    ],
    queryFn: async () => {
      if (contributingTeamsSourceIds.length === 0) return [];

      const results = await Promise.all(
        contributingTeamsSourceIds.map((sourceId) =>
          utils.client.projectLog.getProposalsByProjectIdAndKey.query({
            projectId: sourceId,
            key: 'contributing_teams',
          }),
        ),
      );
      return results;
    },
    enabled: contributingTeamsSourceIds.length > 0,
  });

  // Fetch proposals for affiliated projects
  const {
    data: affiliatedProjectsProposals,
    isLoading: isLoadingAffiliatedProjects,
  } = useQuery({
    queryKey: [
      'ecosystem-reverse',
      'affiliated_projects',
      projectId,
      affiliatedProjectsSourceIds,
    ],
    queryFn: async () => {
      if (affiliatedProjectsSourceIds.length === 0) return [];

      const results = await Promise.all(
        affiliatedProjectsSourceIds.map((sourceId) =>
          utils.client.projectLog.getProposalsByProjectIdAndKey.query({
            projectId: sourceId,
            key: 'affiliated_projects',
          }),
        ),
      );
      return results;
    },
    enabled: affiliatedProjectsSourceIds.length > 0,
  });

  // Process stack integrations rows
  const stackIntegrationsReverse = useMemo(() => {
    if (!stackIntegrationsProposals || !relations) return [];

    // Map source project IDs to their query data
    const proposalsByProjectId = new Map(
      stackIntegrationsSourceIds.map((id, idx) => [
        id,
        stackIntegrationsProposals[idx],
      ]),
    );

    const output: IStackIntegration[] = [];
    const seenKeys = new Set<string>();

    // Process each relation
    for (const rel of stackIntegrationsTargets) {
      const sourceId = rel.sourceProjectId;
      if (!sourceId) continue;

      const proposalsData = proposalsByProjectId.get(sourceId);
      if (!proposalsData) continue;

      // Find the specific item proposal that matches this relation
      const matchedProposal = proposalsData.allItemProposals?.find(
        (proposal: any) => proposal.id === rel.itemProposalId,
      );

      if (!matchedProposal) continue;

      // Extract the value array
      const itemsArray = Array.isArray(matchedProposal.value)
        ? matchedProposal.value
        : [];

      // Process each item in the array
      for (let idx = 0; idx < itemsArray.length; idx++) {
        const item = itemsArray[idx];
        if (!item) continue;

        // Check if this item references the current project
        const selectedProjects = Array.isArray(item.project)
          ? item.project
          : [item.project];
        const includesCurrentProject = selectedProjects.includes(
          String(projectId),
        );

        if (includesCurrentProject) {
          // Create unique key for deduplication
          const uniqueKey = `${sourceId}-${idx}`;

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            output.push({
              project: String(sourceId),
              type: item.type ?? '',
              description: item.description ?? '',
              reference: item.reference ?? '',
              repository: item.repository ?? '',
              sourceProjectId: sourceId,
              itemProposalId: rel.itemProposalId,
              targetProjectId: projectId,
            } as IStackIntegration);
          }
        }
      }
    }

    return output;
  }, [
    stackIntegrationsProposals,
    stackIntegrationsTargets,
    stackIntegrationsSourceIds,
    projectId,
    relations,
  ]);

  // Process contributing teams rows
  const contributingTeamsReverse = useMemo(() => {
    if (!contributingTeamsProposals || !relations) return [];

    // Map source project IDs to their query data
    const proposalsByProjectId = new Map(
      contributingTeamsSourceIds.map((id, idx) => [
        id,
        contributingTeamsProposals[idx],
      ]),
    );

    const output: IContributingTeam[] = [];
    const seenKeys = new Set<string>();

    // Process each relation
    for (const rel of contributingTeamsTargets) {
      const sourceId = rel.sourceProjectId;
      if (!sourceId) continue;

      const proposalsData = proposalsByProjectId.get(sourceId);
      if (!proposalsData) continue;

      // Find the specific item proposal that matches this relation
      const matchedProposal = proposalsData.allItemProposals?.find(
        (proposal: any) => proposal.id === rel.itemProposalId,
      );

      if (!matchedProposal) continue;

      // Extract the value array
      const itemsArray = Array.isArray(matchedProposal.value)
        ? matchedProposal.value
        : [];

      // Process each item in the array
      for (let idx = 0; idx < itemsArray.length; idx++) {
        const item = itemsArray[idx];
        if (!item) continue;

        // Check if this item references the current project
        const selectedProjects = Array.isArray(item.project)
          ? item.project
          : [item.project];
        const includesCurrentProject = selectedProjects.includes(
          String(projectId),
        );

        if (includesCurrentProject) {
          // Create unique key for deduplication
          const uniqueKey = `${sourceId}-${idx}`;

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            output.push({
              project: String(sourceId),
              type: item.type ?? '',
              description: item.description ?? '',
              reference: item.reference ?? '',
              sourceProjectId: sourceId,
              itemProposalId: rel.itemProposalId,
              targetProjectId: projectId,
            } as IContributingTeam);
          }
        }
      }
    }

    return output;
  }, [
    contributingTeamsProposals,
    contributingTeamsTargets,
    contributingTeamsSourceIds,
    projectId,
    relations,
  ]);

  // Process affiliated projects rows
  const affiliatedProjectsReverse = useMemo(() => {
    if (!affiliatedProjectsProposals || !relations) return [];

    // Map source project IDs to their query data
    const proposalsByProjectId = new Map(
      affiliatedProjectsSourceIds.map((id, idx) => [
        id,
        affiliatedProjectsProposals[idx],
      ]),
    );

    const output: IAffiliatedProject[] = [];
    const seenKeys = new Set<string>();

    // Process each relation
    for (const rel of affiliatedProjectsTargets) {
      const sourceId = rel.sourceProjectId;
      if (!sourceId) continue;

      const proposalsData = proposalsByProjectId.get(sourceId);
      if (!proposalsData) continue;

      // Find the specific item proposal that matches this relation
      const matchedProposal = proposalsData.allItemProposals?.find(
        (proposal: any) => proposal.id === rel.itemProposalId,
      );

      if (!matchedProposal) continue;

      // Extract the value array
      const itemsArray = Array.isArray(matchedProposal.value)
        ? matchedProposal.value
        : [];

      // Process each item in the array
      for (let idx = 0; idx < itemsArray.length; idx++) {
        const item = itemsArray[idx];
        if (!item) continue;

        // Check if this item references the current project
        const selectedProjects = Array.isArray(item.project)
          ? item.project
          : [item.project];
        const includesCurrentProject = selectedProjects.includes(
          String(projectId),
        );

        if (includesCurrentProject) {
          // Create unique key for deduplication
          const uniqueKey = `${sourceId}-${idx}`;

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            output.push({
              project: String(sourceId),
              affiliationType: item.affiliationType ?? '',
              description: item.description ?? '',
              reference: item.reference ?? '',
              sourceProjectId: sourceId,
              itemProposalId: rel.itemProposalId,
              targetProjectId: projectId,
            } as IAffiliatedProject);
          }
        }
      }
    }

    return output;
  }, [
    affiliatedProjectsProposals,
    affiliatedProjectsTargets,
    affiliatedProjectsSourceIds,
    projectId,
    relations,
  ]);

  return {
    stackIntegrationsReverse,
    contributingTeamsReverse,
    affiliatedProjectsReverse,
    isLoading:
      isLoadingRelations ||
      isLoadingStackIntegrations ||
      isLoadingContributingTeams ||
      isLoadingAffiliatedProjects,
  };
}
