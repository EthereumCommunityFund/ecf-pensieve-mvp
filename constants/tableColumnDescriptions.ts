/**
 * Table column descriptions configuration
 * Extracted from InputContentRenderer for reuse in table headers with tooltips
 */

export interface IColumnDescription {
  key: string;
  label: string;
  tooltip: string;
}

// Funding Received Grants columns
export const FUNDING_GRANTS_COLUMNS: Record<string, IColumnDescription> = {
  date: {
    key: 'date',
    label: 'Date',
    tooltip: 'The Date of when this grant was given to this project',
  },
  organization: {
    key: 'organization',
    label: 'Organization/Program',
    tooltip:
      'This refers to the organization or program this project has received their grants from',
  },
  projectDonator: {
    key: 'projectDonator',
    label: 'Project Donator',
    tooltip:
      'Projects that have donated to this funding round or acted as sponsors',
  },
  amount: {
    key: 'amount',
    label: 'Amount (USD)',
    tooltip: 'This is the amount received at the time of this grant was given',
  },
  expenseSheetUrl: {
    key: 'expenseSheetUrl',
    label: 'Expense Sheet',
    tooltip:
      'Link to detailed expense breakdown showing how the grant funds were utilized',
  },
  reference: {
    key: 'reference',
    label: 'Reference',
    tooltip: 'This is the reference link that acts as evidence for this entry',
  },
  page: {
    key: 'page',
    label: 'Page',
    tooltip: 'View the linkage page for more details',
  },
};

// Affiliated Projects columns
export const AFFILIATED_PROJECTS_COLUMNS: Record<string, IColumnDescription> = {
  project: {
    key: 'project',
    label: 'Project',
    tooltip: 'The project that has an affiliation with this project',
  },
  affiliationType: {
    key: 'affiliationType',
    label: 'Affiliation Type',
    tooltip: 'The type of relationship between the projects',
  },
  description: {
    key: 'description',
    label: 'Description',
    tooltip: 'Description of the affiliation relationship',
  },
  reference: {
    key: 'reference',
    label: 'Reference',
    tooltip: 'Reference link for more information about this affiliation',
  },
  page: {
    key: 'page',
    label: 'Page',
    tooltip: 'View the linkage page for more details',
  },
};

// Contributing Teams columns
export const CONTRIBUTING_TEAMS_COLUMNS: Record<string, IColumnDescription> = {
  project: {
    key: 'project',
    label: 'Project',
    tooltip: 'The team or organization that contributed to this project',
  },
  type: {
    key: 'type',
    label: 'Contribution Area',
    tooltip: 'The type of contribution provided',
  },
  description: {
    key: 'description',
    label: 'Description',
    tooltip: 'Description of the contribution',
  },
  reference: {
    key: 'reference',
    label: 'Reference',
    tooltip: 'Reference link for more information about this contribution',
  },
  page: {
    key: 'page',
    label: 'Page',
    tooltip: 'View the linkage page for more details',
  },
};

// Stack Integrations columns
export const STACK_INTEGRATIONS_COLUMNS: Record<string, IColumnDescription> = {
  project: {
    key: 'project',
    label: 'Project',
    tooltip: 'The project or technology integrated with this project',
  },
  type: {
    key: 'type',
    label: 'Relation',
    tooltip: 'The type of integration or dependency',
  },
  description: {
    key: 'description',
    label: 'Description',
    tooltip: 'Description of the integration',
  },
  reference: {
    key: 'reference',
    label: 'Reference',
    tooltip: 'Reference link for more information',
  },
  repository: {
    key: 'repository',
    label: 'Repository',
    tooltip: 'Repository link for the integration',
  },
  page: {
    key: 'page',
    label: 'Page',
    tooltip: 'View the linkage page for more details',
  },
};

// Helper function to get column description
export function getColumnDescription(
  columnKey: string,
  columnMap: Record<string, IColumnDescription>,
): IColumnDescription | undefined {
  return columnMap[columnKey];
}
