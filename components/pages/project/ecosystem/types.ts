export type EcosystemSection =
  | 'stack_integrations'
  | 'contributing_teams'
  | 'affiliated_projects';

// Re-export interfaces from types/item.ts with added backend relation fields
export interface IStackIntegrationWithRelation {
  project: string | string[];
  type: string;
  description?: string;
  reference?: string;
  repository?: string;
  _id?: string;
  // Backend relation fields (for reverse data)
  sourceProjectId?: number | null;
  itemProposalId?: number;
  targetProjectId?: number;
}

export interface IContributingTeamWithRelation {
  project: string | string[];
  type: string;
  description?: string;
  reference?: string;
  _id?: string;
  // Backend relation fields (for reverse data)
  sourceProjectId?: number | null;
  itemProposalId?: number;
  targetProjectId?: number;
}

export interface IAffiliatedProjectWithRelation {
  project: string | string[];
  affiliationType: string;
  description?: string;
  reference?: string;
  _id?: string;
  // Backend relation fields (for reverse data)
  sourceProjectId?: number | null;
  itemProposalId?: number;
  targetProjectId?: number;
}
