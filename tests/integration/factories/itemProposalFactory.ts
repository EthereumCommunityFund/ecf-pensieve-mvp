import { POC_ITEMS } from '@/lib/pocItems';

export const createItemProposalData = (overrides?: any) => {
  const defaultData = {
    key: 'roadmap',
    value: 'Q1: Launch, Q2: Scale, Q3: Expand',
    ref: 'https://example.com/roadmap',
    reason: 'Comprehensive roadmap for project growth',
  };

  return { ...defaultData, ...overrides };
};

export const createValueByType = (key: string) => {
  const item = POC_ITEMS[key as keyof typeof POC_ITEMS];
  if (!item) return null;

  switch (item.fieldComponent) {
    case 'TagInput':
      return ['tag1', 'tag2', 'tag3'];
    case 'WebsiteInput':
      return [
        { title: 'Main Site', url: 'https://example.com' },
        { title: 'Docs', url: 'https://docs.example.com' },
      ];
    case 'FounderInput':
      return [
        { name: 'Alice Smith', title: 'CEO' },
        { name: 'Bob Johnson', title: 'CTO' },
      ];
    case 'DatePicker':
      return new Date().toISOString();
    case 'CheckboxField':
      return true;
    default:
      return `Sample ${key} value`;
  }
};

export const createTestProposals = async (
  callers: any[],
  projectId: number,
  key: string,
  values?: string[],
) => {
  const proposals = [];
  const defaultValues = [
    'Option 1 - Initial proposal',
    'Option 2 - Alternative proposal',
    'Option 3 - Another option',
  ];

  const valuesToUse = values || defaultValues;

  for (let i = 0; i < Math.min(callers.length, valuesToUse.length); i++) {
    const proposal = await callers[i].createItemProposal({
      projectId,
      key,
      value: valuesToUse[i],
    });
    proposals.push(proposal);
  }

  return proposals;
};
