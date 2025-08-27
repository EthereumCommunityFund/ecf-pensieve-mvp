export interface IStackIntegration {
  project: string;
  relation: string;
  description: string;
  reference: string;
  repository: string;
  page?: string;
}

export interface IContributingTeam {
  project: string;
  contributionArea: string;
  description: string;
  reference: string;
  page?: string;
}

export interface IAffiliatedProject {
  project: string;
  affiliationType: string;
  description: string;
  reference: string;
  page?: string;
}

export type EcosystemSection =
  | 'stack_integrations'
  | 'contributing_teams'
  | 'affiliated_projects';
