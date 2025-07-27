export const createItemProposalData = (overrides?: any) => {
  const defaultData = {
    key: 'roadmap',
    value: 'Q1: Launch, Q2: Scale, Q3: Expand',
    ref: 'https://example.com/roadmap',
    reason: 'Comprehensive roadmap for project growth',
  };

  return { ...defaultData, ...overrides };
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
