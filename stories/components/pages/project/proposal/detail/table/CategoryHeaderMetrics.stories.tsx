import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import CategoryHeader from '@/components/pages/project/proposal/detail/table/CategoryHeader';
import { IItemSubCategoryEnum } from '@/constants/itemConfig';

const meta: Meta<typeof CategoryHeader> = {
  title: 'Components/Pages/Project/Proposal/Detail/Table/CategoryHeaderMetrics',
  component: CategoryHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
CategoryHeader component with integrated Metrics button functionality.
The Metrics button has been migrated from ProjectDetailTable to CategoryHeader,
allowing users to show/hide Accountability and Legitimacy columns from the category header.

## Features
- Integrated Metrics button in category header
- Visual state changes (button style and text)
- Proper state management and propagation
- Consistent with existing header design
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CategoryHeader>;

export const WithMetricsButton: Story = {
  render: () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [metricsVisible, setMetricsVisible] = useState(false);

    return (
      <div className="w-full max-w-4xl">
        <CategoryHeader
          title="Basic Profile"
          description="Essential project information and basic details"
          category={IItemSubCategoryEnum.BasicProfile}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          metricsVisible={metricsVisible}
          onToggleMetrics={() => setMetricsVisible(!metricsVisible)}
        />

        <div className="mt-4 rounded border p-4 text-sm text-gray-600">
          <p>
            <strong>Current State:</strong>
          </p>
          <p>• Category Expanded: {isExpanded ? 'Yes' : 'No'}</p>
          <p>• Metrics Visible: {metricsVisible ? 'Yes' : 'No'}</p>
          <p>
            • Button Text: {metricsVisible ? 'Hide Metrics' : 'Show Metrics'}
          </p>
          <p>
            • Button Style:{' '}
            {metricsVisible ? 'Primary (Active)' : 'Secondary (Inactive)'}
          </p>
        </div>
      </div>
    );
  },
};

export const MetricsButtonStates: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Metrics Hidden State</h3>
          <CategoryHeader
            title="Development"
            description="Technical details and development status"
            category={IItemSubCategoryEnum.Development}
            isExpanded={true}
            onToggle={() => {}}
            metricsVisible={false}
            onToggleMetrics={() => {}}
          />
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Metrics Visible State</h3>
          <CategoryHeader
            title="Organization"
            description="Organizational structure and governance"
            category={IItemSubCategoryEnum.Organization}
            isExpanded={true}
            onToggle={() => {}}
            metricsVisible={true}
            onToggleMetrics={() => {}}
          />
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Collapsed Category with Metrics
          </h3>
          <CategoryHeader
            title="Team"
            description="Team information and structure"
            category={IItemSubCategoryEnum.Team}
            isExpanded={false}
            onToggle={() => {}}
            metricsVisible={true}
            onToggleMetrics={() => {}}
          />
        </div>
      </div>
    );
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [states, setStates] = useState({
      basicProfile: { expanded: true, metrics: false },
      development: { expanded: true, metrics: false },
      organization: { expanded: false, metrics: false },
      team: { expanded: true, metrics: true },
    });

    const updateState = (category: string, field: 'expanded' | 'metrics') => {
      setStates((prev) => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [field]: !prev[category as keyof typeof prev][field],
        },
      }));
    };

    return (
      <div className="w-full max-w-5xl space-y-4">
        <h3 className="text-lg font-semibold">Interactive Category Headers</h3>

        <CategoryHeader
          title="Basic Profile"
          description="Essential project information and basic details"
          category={IItemSubCategoryEnum.BasicProfile}
          isExpanded={states.basicProfile.expanded}
          onToggle={() => updateState('basicProfile', 'expanded')}
          metricsVisible={states.basicProfile.metrics}
          onToggleMetrics={() => updateState('basicProfile', 'metrics')}
        />

        <CategoryHeader
          title="Development"
          description="Technical details and development status"
          category={IItemSubCategoryEnum.Development}
          isExpanded={states.development.expanded}
          onToggle={() => updateState('development', 'expanded')}
          metricsVisible={states.development.metrics}
          onToggleMetrics={() => updateState('development', 'metrics')}
        />

        <CategoryHeader
          title="Organization"
          description="Organizational structure and governance"
          category={IItemSubCategoryEnum.Organization}
          isExpanded={states.organization.expanded}
          onToggle={() => updateState('organization', 'expanded')}
          metricsVisible={states.organization.metrics}
          onToggleMetrics={() => updateState('organization', 'metrics')}
        />

        <CategoryHeader
          title="Team"
          description="Team information and structure"
          category={IItemSubCategoryEnum.Team}
          isExpanded={states.team.expanded}
          onToggle={() => updateState('team', 'expanded')}
          metricsVisible={states.team.metrics}
          onToggleMetrics={() => updateState('team', 'metrics')}
        />

        <div className="mt-6 rounded border p-4 text-sm">
          <h4 className="mb-2 font-medium">Current States:</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(states).map(([category, state]) => (
              <div key={category} className="rounded bg-gray-50 p-2">
                <p className="font-medium capitalize">
                  {category.replace(/([A-Z])/g, ' $1')}
                </p>
                <p>Expanded: {state.expanded ? '✓' : '✗'}</p>
                <p>Metrics: {state.metrics ? '✓' : '✗'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const UsageExample: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Usage Example</h3>
          <div className="rounded border p-4">
            <pre className="text-sm">
              {`// Basic usage with metrics functionality
<CategoryHeader
  title="Basic Profile"
  description="Essential project information"
  category={IItemSubCategoryEnum.BasicProfile}
  isExpanded={expanded}
  onToggle={() => setExpanded(!expanded)}
  metricsVisible={metricsVisible}
  onToggleMetrics={() => setMetricsVisible(!metricsVisible)}
/>

// Without metrics functionality (backward compatible)
<CategoryHeader
  title="Basic Profile"
  description="Essential project information"
  category={IItemSubCategoryEnum.BasicProfile}
  isExpanded={expanded}
  onToggle={() => setExpanded(!expanded)}
/>`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Migration Benefits</h3>
          <div className="space-y-2 text-sm">
            <p>
              ✅ <strong>Better UX:</strong> Metrics control is now contextual
              to each category
            </p>
            <p>
              ✅ <strong>Cleaner Layout:</strong> No separate metrics button
              taking up space
            </p>
            <p>
              ✅ <strong>Consistent Design:</strong> Integrated with existing
              header controls
            </p>
            <p>
              ✅ <strong>Backward Compatible:</strong> Works without metrics
              props
            </p>
            <p>
              ✅ <strong>State Management:</strong> Proper state propagation
              through component tree
            </p>
          </div>
        </div>
      </div>
    );
  },
};
