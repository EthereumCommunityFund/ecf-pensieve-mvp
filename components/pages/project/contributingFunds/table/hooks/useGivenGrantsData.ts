'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { trpc } from '@/lib/trpc/client';
import { IFundingReceivedGrants } from '@/types/item';
import { devLog } from '@/utils/devLog';

export function useGivenGrantsData(projectId: number) {
  // Step 1: Get funding relations for the project
  const { data: relations, isLoading: isLoadingRelations } =
    trpc.projectRelation.getFundingRelations.useQuery(
      { projectId },
      {
        enabled: !!projectId,
        select(data) {
          devLog('getFundingRelations' + projectId, data);
          return data;
        },
      },
    );

  // Step 2: Extract unique source project IDs from fundedBy donators only
  const sourceProjectIds = useMemo(() => {
    if (!relations) return [];
    // Only use donators, not organizations
    const donatorRelations = relations.fundedBy.donators;
    return Array.from(
      new Set(donatorRelations.map((r) => r.sourceProjectId)),
    ).filter((id): id is number => id !== null);
  }, [relations]);

  // Step 3: Use a single query to fetch all source projects' proposals
  const utils = trpc.useUtils();

  const { data: allProposalsData, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['given-grants', projectId, sourceProjectIds],
    queryFn: async () => {
      if (sourceProjectIds.length === 0) return [];

      const results = await Promise.all(
        sourceProjectIds.map((sourceId) =>
          utils.client.projectLog.getProposalsByProjectIdAndKey.query({
            projectId: sourceId,
            key: 'funding_received_grants',
          }),
        ),
      );
      return results;
    },
    enabled: sourceProjectIds.length > 0,
  });

  // Step 4: Check if loading
  const isLoading = isLoadingRelations || isLoadingProposals;

  // Step 5: Process the data to extract Given grants
  const givenGrantsData = useMemo(() => {
    if (isLoading || !relations || !allProposalsData) return [];

    // Only process donator relations (not organizations)
    const allRelations = [...relations.fundedBy.donators];

    // Map source project IDs to their query data
    const proposalsByProjectId = new Map(
      sourceProjectIds.map((id, idx) => [id, allProposalsData[idx]]),
    );

    const grantsRows: IFundingReceivedGrants[] = [];
    const seenKeys = new Set<string>();

    // Process each relation
    for (const relation of allRelations) {
      const sourceId = relation.sourceProjectId;
      if (!sourceId) continue;

      const proposalsData = proposalsByProjectId.get(sourceId);
      if (!proposalsData) continue;

      // Find the specific item proposal that matches this relation
      const matchedProposal = proposalsData.allItemProposals?.find(
        (proposal: any) => proposal.id === relation.itemProposalId,
      );

      if (!matchedProposal) continue;

      // Extract the value array (funding grants entries)
      const grantsArray = Array.isArray(matchedProposal.value)
        ? matchedProposal.value
        : [];

      // Process each grant entry
      for (let idx = 0; idx < grantsArray.length; idx++) {
        const grantItem = grantsArray[idx];
        if (!grantItem) continue;

        // Check if this grant references the current project
        // Only check projectDonator field since we're only processing donator relations
        const donators = Array.isArray(grantItem.projectDonator)
          ? grantItem.projectDonator
          : [];
        const includesCurrentProject = donators.includes(String(projectId));

        // If this grant references the current project, add it to results
        if (includesCurrentProject) {
          // Create unique key for deduplication (only using donator type now)
          const uniqueKey = `${sourceId}-${idx}-donator`;

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            grantsRows.push({
              date: grantItem.date ?? null,
              organization: grantItem.organization ?? '',
              projectDonator: grantItem.projectDonator ?? [],
              amount: grantItem.amount ?? '',
              reference: grantItem.reference,
              expenseSheetUrl: grantItem.expenseSheetUrl,
              _id: grantItem._id || `${sourceId}-${idx}`,
            });
          }
        }
      }
    }

    // Sort by date (newest first)
    return grantsRows.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [relations, allProposalsData, isLoading, projectId, sourceProjectIds]);

  return {
    data: givenGrantsData,
    isLoading,
    error: null,
  };
}
