import { IFormDisplayType } from '@/types/item';

export interface DynamicFieldColumn {
  key: string;
  label: string;
  width: string;
  tooltip?: string;
}

export interface DynamicFieldConfig {
  displayType: IFormDisplayType;
  columns: DynamicFieldColumn[];
  addButtonText?: string;
  tableComponent: string; // Component name to use for rendering
}

export const DYNAMIC_FIELDS_CONFIG: Record<string, DynamicFieldConfig> = {
  fundingReceivedGrants: {
    displayType: 'fundingReceivedGrants',
    columns: [
      {
        key: 'date',
        label: 'Date',
        width: '158px',
        tooltip: 'The Date of when this grant was given to this project',
      },
      {
        key: 'organization',
        label: 'Organization/Program',
        width: '300px',
        tooltip:
          'This refers to the organization or program this project has received their grants from',
      },
      {
        key: 'projectDonator',
        label: 'Project Donator',
        width: '300px',
        tooltip:
          'Projects that have donated to this funding round or acted as sponsors',
      },
      {
        key: 'amount',
        label: 'Amount (USD)',
        width: '138px',
        tooltip:
          'This is the amount received at the time of this grant was given',
      },
      {
        key: 'expenseSheetUrl',
        label: 'Expense Sheet',
        width: '200px',
        tooltip:
          'Link to detailed expense breakdown showing how the grant funds were utilized',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: '200px',
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
        width: '300px',
        tooltip: 'The project that has an affiliation with this project',
      },
      {
        key: 'affiliationType',
        label: 'Affiliation Type',
        width: '180px',
        tooltip: 'The type of relationship between the projects',
      },
      {
        key: 'description',
        label: 'Description',
        width: '250px',
        tooltip: 'Description of the affiliation relationship',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: '200px',
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
        width: '300px',
        tooltip: 'The team or organization that contributed to this project',
      },
      {
        key: 'contributionArea',
        label: 'Area of Contribution',
        width: '200px',
        tooltip: 'The type of contribution provided',
      },
      {
        key: 'description',
        label: 'Description',
        width: '250px',
        tooltip: 'Description of the contribution',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: '200px',
        tooltip: 'Reference link for more information about this contribution',
      },
    ],
    addButtonText: 'Add an Entry',
    tableComponent: 'ContributingTeamsTableItem',
  },
  stack_integrations: {
    displayType: 'stack_integrations',
    columns: [
      {
        key: 'project',
        label: 'Project',
        width: '240px',
        tooltip: 'The project or technology integrated with this project',
      },
      {
        key: 'type',
        label: 'Type',
        width: '180px',
        tooltip: 'The type of integration or dependency',
      },
      {
        key: 'description',
        label: 'Description',
        width: '200px',
        tooltip: 'Description of the integration',
      },
      {
        key: 'reference',
        label: 'Reference',
        width: '180px',
        tooltip: 'Reference link for more information',
      },
      {
        key: 'repository',
        label: 'Repository',
        width: '180px',
        tooltip: 'Repository link for the integration',
      },
    ],
    addButtonText: 'Add an Entry',
    tableComponent: 'StackIntegrationsTableItem',
  },
};
