import { IFormDisplayType } from '@/types/item';

import AdvisorsTableItem from './item/AdvisorsTableItem';
import AffiliatedProjectsTableItem from './item/AffiliatedProjectsTableItem';
import AuditReportTableItem from './item/AuditReportTableItem';
import ContributingTeamsTableItem from './item/ContributingTeamsTableItem';
import ContributorsOrganizationTableItem from './item/ContributorsOrganizationTableItem';
import ContributorsTableItem from './item/ContributorsTableItem';
import DecentralizedGovernanceTableItem from './item/DecentralizedGovernanceTableItem';
import EndorsersTableItem from './item/EndorsersTableItem';
import FundingReceivedGrantsTableItem from './item/FundingReceivedGrantsTableItem';
import PreviousFundingRoundsTableItem from './item/PreviousFundingRoundsTableItem';
import PrivateFundingRoundsTableItem from './item/PrivateFundingRoundsTableItem';
import RoadmapTimelineTableItem from './item/RoadmapTimelineTableItem';
import StackIntegrationsTableItem from './item/StackIntegrationsTableItem';

export interface DynamicFieldColumn {
  key: string;
  label: string;
  width: number;
  tooltip?: string;
}

export interface DynamicFieldConfig {
  displayType: IFormDisplayType;
  columns: DynamicFieldColumn[];
  addButtonText?: string;
  tableComponent: string; // Component name to use for rendering, important!
}

export const DYNAMIC_FIELDS_CONFIG: Record<string, DynamicFieldConfig> = {
  fundingReceivedGrants: {
    displayType: 'fundingReceivedGrants',
    columns: [
      {
        key: 'date',
        label: 'Date',
        width: 158,
        tooltip: 'The Date of when this grant was given to this project',
      },
      {
        key: 'organization',
        label: 'Organization/Program',
        width: 300,
        tooltip:
          'This refers to the organization or program this project has received their grants from',
      },
      {
        key: 'projectDonator',
        label: 'Project Donator',
        width: 300,
        tooltip:
          'Projects that have donated to this funding round or acted as sponsors',
      },
      {
        key: 'amount',
        label: 'Amount (USD)',
        width: 138,
        tooltip:
          'This is the amount received at the time of this grant was given',
      },
      {
        key: 'expenseSheetUrl',
        label: 'Expense Sheet',
        width: 200,
        tooltip:
          'Link to detailed expense breakdown showing how the grant funds were utilized',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: 200,
        tooltip:
          'This is the reference link that acts as evidence for this entry',
      },
    ],
    addButtonText: 'Add an Entity',
    tableComponent: 'FundingReceivedGrantsTableItem',
  },
  affiliated_projects: {
    displayType: 'affiliated_projects',
    columns: [
      {
        key: 'project',
        label: 'Project',
        width: 300,
        tooltip: 'The project that has an affiliation with this project',
      },
      {
        key: 'affiliationType',
        label: 'Affiliation Type',
        width: 180,
        tooltip: 'The type of relationship between the projects',
      },
      {
        key: 'description',
        label: 'Description',
        width: 250,
        tooltip: 'Description of the affiliation relationship',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: 200,
        tooltip: 'Reference link for more information about this affiliation',
      },
    ],
    addButtonText: 'Add an Entry',
    tableComponent: 'AffiliatedProjectsTableItem',
  },
  contributing_teams: {
    displayType: 'contributing_teams',
    columns: [
      {
        key: 'project',
        label: 'Project',
        width: 300,
        tooltip: 'The team or organization that contributed to this project',
      },
      {
        key: 'type',
        label: 'Area of Contribution',
        width: 200,
        tooltip: 'The type of contribution provided',
      },
      {
        key: 'description',
        label: 'Description',
        width: 250,
        tooltip: 'Description of the contribution',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: 200,
        tooltip: 'Reference link for more information about this contribution',
      },
    ],
    addButtonText: 'Add an Entry',
    tableComponent: 'ContributingTeamsTableItem',
  },
  contributors: {
    displayType: 'contributors',
    addButtonText: 'Add an Entry',
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: 240,
        tooltip: 'Contributor name or identifier',
      },
      {
        key: 'role',
        label: 'Role',
        width: 240,
        tooltip:
          'Role or capacity in which this contributor supports the project',
      },
      {
        key: 'address',
        label: 'Address / Social ID',
        width: 360,
        tooltip:
          'Provide a verifiable on-chain address or social identifier for this contributor',
      },
    ],
    tableComponent: 'ContributorsTableItem',
  },
  contributors_organization: {
    displayType: 'contributors_organization',
    addButtonText: 'Add an Entry',
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: 240,
        tooltip:
          'Full name or identifier for the contributor supporting this project',
      },
      {
        key: 'role',
        label: 'Role',
        width: 240,
        tooltip: 'Primary role or responsibility the contributor fulfills',
      },
      {
        key: 'address',
        label: 'Address / Social ID',
        width: 320,
        tooltip:
          'Enter a verifiable on-chain address or social identifier for the contributor',
      },
    ],
    tableComponent: 'ContributorsOrganizationTableItem',
  },
  endorsers: {
    displayType: 'endorsers',
    addButtonText: 'Add an Entry',
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: 240,
        tooltip: 'Name of the endorser (individual or organization)',
      },
      {
        key: 'socialIdentifier',
        label: 'Social Identifier',
        width: 240,
        tooltip:
          'Provide a verifiable handle or identifier (e.g. X, Farcaster, ENS) for this endorser',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: 260,
        tooltip:
          'Link or citation pointing to the endorsement statement or proof',
      },
    ],
    tableComponent: 'EndorsersTableItem',
  },
  stack_integrations: {
    displayType: 'stack_integrations',
    columns: [
      {
        key: 'project',
        label: 'Project',
        width: 240,
        tooltip: 'The project or technology integrated with this project',
      },
      {
        key: 'type',
        label: 'Type',
        width: 180,
        tooltip: 'The type of integration or dependency',
      },
      {
        key: 'description',
        label: 'Description',
        width: 200,
        tooltip: 'Description of the integration',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: 180,
        tooltip: 'Reference link for more information',
      },
      {
        key: 'repository',
        label: 'Repository',
        width: 180,
        tooltip: 'Repository link for the integration',
      },
    ],
    addButtonText: 'Add an Entry',
    tableComponent: 'StackIntegrationsTableItem',
  },
  advisors: {
    displayType: 'advisors',
    addButtonText: 'Add an Entry',
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: 180,
        tooltip:
          'Full name or primary identifier of the advisor collaborating on this project',
      },
      {
        key: 'title',
        label: 'Title',
        width: 240,
        tooltip:
          'Professional title or role the advisor fulfills for this project',
      },
      {
        key: 'address',
        label: 'Address',
        width: 240,
        tooltip: 'Public Address No || Social Identifier',
      },
      {
        key: 'active',
        label: 'Active',
        width: 120,
        tooltip:
          'Indicates whether the advisor is currently active in supporting the project',
      },
    ],
    tableComponent: 'AdvisorsTableItem',
  },
  private_funding_rounds: {
    displayType: 'private_funding_rounds',
    addButtonText: 'Add a Round',
    columns: [
      { key: 'date', label: 'Date', width: 158, tooltip: 'Funding round date' },
      {
        key: 'amount',
        label: 'Amount (USD)',
        width: 138,
        tooltip: 'Total amount raised in this round',
      },
      {
        key: 'textName',
        label: 'Name',
        width: 300,
        tooltip: 'Textual name/participant for this round',
      },
      {
        key: 'amountShares',
        label: 'amountShares',
        width: 180,
        tooltip: 'amountShares',
      },
    ],
    tableComponent: 'PrivateFundingRoundsTableItem',
  },
  previous_funding_rounds: {
    displayType: 'previous_funding_rounds',
    addButtonText: 'Add a Round',
    columns: [
      {
        key: 'date',
        label: 'Date',
        width: 200,
        tooltip: 'Date when this funding round was announced or closed',
      },
      {
        key: 'amount',
        label: 'Amount (USD)',
        width: 240,
        tooltip: 'Total amount raised in the round',
      },
      {
        key: 'reference',
        label: 'If Applicable Link',
        width: 240,
        tooltip:
          'Optional link to a press release, announcement, or documentation verifying the round',
      },
    ],
    tableComponent: 'PreviousFundingRoundsTableItem',
  },
  roadmap_timeline: {
    displayType: 'roadmap_timeline',
    addButtonText: 'Add Milestone',
    columns: [
      {
        key: 'milestone',
        label: 'Milestone',
        width: 220,
        tooltip: 'Name of the roadmap milestone or deliverable',
      },
      {
        key: 'description',
        label: 'Description',
        width: 260,
        tooltip: 'Short summary of what the milestone delivers',
      },
      {
        key: 'date',
        label: 'Date',
        width: 160,
        tooltip: 'Planned completion date for this milestone',
      },
      {
        key: 'status',
        label: 'Status',
        width: 160,
        tooltip: 'Current progress status of the milestone',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: 240,
        tooltip: 'Public URL or document that validates the milestone',
      },
    ],
    tableComponent: 'RoadmapTimelineTableItem',
  },
  decentralized_governance: {
    displayType: 'decentralized_governance',
    addButtonText: 'Add an Address',
    columns: [
      {
        key: 'address',
        label: 'Governance Address',
        width: 600,
        tooltip:
          'Ethereum address (multisig signer, council member, or executor) authorized to enact governance decisions',
      },
    ],
    tableComponent: 'DecentralizedGovernanceTableItem',
  },
  audit_report: {
    displayType: 'audit_report',
    addButtonText: 'Add an Entity',
    columns: [
      {
        key: 'reportLink',
        label: 'Report Link',
        width: 300,
        tooltip: 'Public URL to the published audit report',
      },
      {
        key: 'auditorName',
        label: 'Auditor Name',
        width: 260,
        tooltip: 'Auditing firm or individual responsible for the report',
      },
    ],
    tableComponent: 'AuditReportTableItem',
  },
};

// Map component names to actual FormAndTable
export const TABLE_ITEM_COMPONENTS: Record<string, React.ComponentType<any>> = {
  FundingReceivedGrantsTableItem: FundingReceivedGrantsTableItem,
  AffiliatedProjectsTableItem: AffiliatedProjectsTableItem,
  ContributingTeamsTableItem: ContributingTeamsTableItem,
  ContributorsTableItem: ContributorsTableItem,
  ContributorsOrganizationTableItem: ContributorsOrganizationTableItem,
  EndorsersTableItem: EndorsersTableItem,
  StackIntegrationsTableItem: StackIntegrationsTableItem,
  AdvisorsTableItem: AdvisorsTableItem,
  PrivateFundingRoundsTableItem: PrivateFundingRoundsTableItem,
  DecentralizedGovernanceTableItem: DecentralizedGovernanceTableItem,
  PreviousFundingRoundsTableItem: PreviousFundingRoundsTableItem,
  AuditReportTableItem: AuditReportTableItem,
  RoadmapTimelineTableItem: RoadmapTimelineTableItem,
};
