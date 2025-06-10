import type { Meta, StoryObj } from '@storybook/react';

import {
  AccountabilityCol,
  LegitimacyCol,
  PropertyCol,
} from '@/components/biz/table';

const meta: Meta = {
  title: 'Components/Biz/Table/MetricsColumns',
  component: AccountabilityCol.Header,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Combined demonstration of AccountabilityCol and LegitimacyCol components working together.
This shows how both metrics columns can be used in the same table to display comprehensive project metrics.

## Features
- Side-by-side accountability and legitimacy metrics
- Consistent visual styling across both column types
- Real-world data examples from project configurations
- Responsive layout handling multiple metrics
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountabilityCol.Header>;

// Combined Table Examples
export const CombinedMetricsTable: Story = {
  render: () => (
    <div className="w-full max-w-6xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <PropertyCol.Header width={200} />
            <AccountabilityCol.Header width={250} />
            <LegitimacyCol.Header width={250} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <PropertyCol.Cell width={200} itemKey="name">
              Project Name
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
            />
            <LegitimacyCol.Cell width={250} legitimacy={[]} isLast />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="categories">
              Categories
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
            />
            <LegitimacyCol.Cell
              width={250}
              legitimacy={['Community Participation']}
              isLast
            />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="whitePaper">
              White Paper
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
            />
            <LegitimacyCol.Cell
              width={250}
              legitimacy={['Legitimacy by Process']}
              isLast
            />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="adoption_plan">
              Adoption Plan
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Participation', 'Performance Eval']}
            />
            <LegitimacyCol.Cell
              width={250}
              legitimacy={['Community Acceptance']}
              isLast
            />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="launch_plan">
              Launch Plan
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency', 'Performance Eval']}
            />
            <LegitimacyCol.Cell
              width={250}
              legitimacy={['Community Acceptance']}
              isLast
            />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="audit_status">
              Audit Status
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
            />
            <LegitimacyCol.Cell
              width={250}
              legitimacy={['Legitimacy by Process']}
              isLast
            />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="dapp_category" isLastRow>
              Dapp Category
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
              isLastRow
            />
            <LegitimacyCol.Cell
              width={250}
              legitimacy={['Legitimacy by Performance']}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

export const EmptyStatesComparison: Story = {
  render: () => (
    <div className="w-full max-w-6xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <PropertyCol.Header width={200} />
            <AccountabilityCol.Header width={250} />
            <LegitimacyCol.Header width={250} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <PropertyCol.Cell width={200} itemKey="logoUrl">
              Project Logo
            </PropertyCol.Cell>
            <AccountabilityCol.Cell width={250} accountability={[]} />
            <LegitimacyCol.Cell width={250} legitimacy={[]} isLast />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="websites">
              Website URL
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
            />
            <LegitimacyCol.Cell width={250} legitimacy={[]} isLast />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="tags" isLastRow>
              Tags
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={250}
              accountability={['Transparency']}
              isLastRow
            />
            <LegitimacyCol.Cell width={250} legitimacy={[]} isLast isLastRow />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

export const ComplexMetricsExample: Story = {
  render: () => (
    <div className="w-full max-w-6xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <PropertyCol.Header width={200} />
            <AccountabilityCol.Header width={280} />
            <LegitimacyCol.Header width={280} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <PropertyCol.Cell width={200} itemKey="protocol_built_on">
              Protocol Built On
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={280}
              accountability={[
                'Transparency',
                'Performance Eval',
                'Participation',
              ]}
            />
            <LegitimacyCol.Cell
              width={280}
              legitimacy={['Legitimacy by Process']}
              isLast
            />
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="core_team">
              Core Team
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={280}
              accountability={['Transparency', 'Participation']}
            />
            <LegitimacyCol.Cell width={280} legitimacy={[]} isLast />
          </tr>
          <tr>
            <PropertyCol.Cell
              width={200}
              itemKey="ownership_of_project"
              isLastRow
            >
              Ownership of Project
            </PropertyCol.Cell>
            <AccountabilityCol.Cell
              width={280}
              accountability={['Transparency', 'Participation']}
              isLastRow
            />
            <LegitimacyCol.Cell width={280} legitimacy={[]} isLast isLastRow />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

export const MetricsVariationsShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Accountability Metrics Variations
        </h3>
        <div className="space-y-2">
          <AccountabilityCol.Cell
            accountability={['Transparency']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={['Performance Eval']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={['Participation']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={['Transparency', 'Performance Eval']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={['Transparency', 'Participation']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={[
              'Transparency',
              'Performance Eval',
              'Participation',
            ]}
            width={350}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Legitimacy Metrics Variations
        </h3>
        <div className="space-y-2">
          <LegitimacyCol.Cell
            legitimacy={['Community Participation']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Legitimacy by Process']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Community Acceptance']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Legitimacy by Performance']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Legitimacy by Process', 'Community Acceptance']}
            width={350}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Side-by-Side Comparison</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <h4 className="mb-2 text-sm font-medium">Accountability</h4>
            <AccountabilityCol.Cell
              accountability={['Transparency', 'Performance Eval']}
              width={250}
            />
          </div>
          <div className="flex-1">
            <h4 className="mb-2 text-sm font-medium">Legitimacy</h4>
            <LegitimacyCol.Cell
              legitimacy={['Community Acceptance', 'Legitimacy by Process']}
              width={250}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
