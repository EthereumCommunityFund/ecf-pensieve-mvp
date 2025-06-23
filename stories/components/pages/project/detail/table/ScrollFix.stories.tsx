import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@heroui/react';

const meta: Meta = {
  title: 'Components/Pages/Project/Detail/Table/ScrollFix',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Test story to verify the horizontal scroll fix for ProjectDetailTable.
This demonstrates that the horizontal scrollbar appears correctly when metrics columns are added.

## The Fix
1. Set explicit width (400px) for Input column instead of relying on default (150px)
2. Increased container max-width to accommodate metrics columns
3. Set table minWidth to sum of all column widths
4. Added allowInternalBorderRadius to prevent overflow-hidden from blocking scroll

## Expected Behavior
- Without metrics: Table width ~1090px, should fit in container
- With metrics: Table width ~1558px, should show horizontal scrollbar
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const ScrollFixDemo = () => {
  const [showMetrics, setShowMetrics] = useState(false);

  // Calculate table widths based on our fix
  const columnWidths = {
    property: 240,
    input: 400, // Fixed width instead of default 150px
    reference: 140,
    submitter: 150,
    accountability: 240,
    legitimacy: 228,
    actions: 160,
  };

  const baseWidth = columnWidths.property + columnWidths.input + columnWidths.reference + columnWidths.submitter + columnWidths.actions;
  const metricsWidth = columnWidths.accountability + columnWidths.legitimacy;
  const totalWidth = showMetrics ? baseWidth + metricsWidth : baseWidth;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Horizontal Scroll Fix Test</h2>
        
        <div className="mb-4 flex items-center gap-4">
          <Button 
            onPress={() => setShowMetrics(!showMetrics)}
            color={showMetrics ? "primary" : "default"}
            size="sm"
          >
            {showMetrics ? "Hide Metrics" : "Show Metrics"}
          </Button>
          
          <div className="text-sm text-gray-600">
            Table width: {totalWidth}px | Container max: 1400px
          </div>
        </div>
      </div>

      {/* Simulate the same container structure as ProjectDetailTable */}
      <div className="mx-auto w-full lg:max-w-[1600px] pc:max-w-[1400px]">
        <div className="w-full flex-1">
          {/* Table container with same settings as CategoryTable */}
          <div 
            className="mt-px rounded-b-[10px] border-x border-b border-black/10 bg-white"
            style={{
              overflowX: 'auto',
              position: 'relative',
              isolation: 'isolate',
            }}
          >
            <table 
              className="box-border w-full table-fixed border-separate border-spacing-0"
              style={{ 
                minWidth: `${totalWidth}px` 
              }}
            >
              <colgroup>
                <col style={{ width: `${columnWidths.property}px` }} />
                <col style={{ width: `${columnWidths.input}px` }} />
                <col style={{ width: `${columnWidths.reference}px` }} />
                <col style={{ width: `${columnWidths.submitter}px` }} />
                {showMetrics && <col style={{ width: `${columnWidths.accountability}px` }} />}
                {showMetrics && <col style={{ width: `${columnWidths.legitimacy}px` }} />}
                <col style={{ width: `${columnWidths.actions}px` }} />
              </colgroup>
              
              <thead>
                <tr className="bg-[#F5F5F5]">
                  <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Property</th>
                  <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Input</th>
                  <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Reference</th>
                  <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Submitter</th>
                  {showMetrics && <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Accountability</th>}
                  {showMetrics && <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Legitimacy</th>}
                  <th className="border-b border-t border-black/10 p-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border-b border-black/10 p-3 text-sm">Project Property {i + 1}</td>
                    <td className="border-b border-black/10 p-3 text-sm">This is a longer input value to demonstrate the fixed width behavior and ensure proper scrolling</td>
                    <td className="border-b border-black/10 p-3 text-sm">Reference</td>
                    <td className="border-b border-black/10 p-3 text-sm">User {i + 1}</td>
                    {showMetrics && <td className="border-b border-black/10 p-3 text-sm">Accountability Metric Value</td>}
                    {showMetrics && <td className="border-b border-black/10 p-3 text-sm">Legitimacy Metric Value</td>}
                    <td className="border-b border-black/10 p-3 text-sm">Actions</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Show Metrics" to add accountability and legitimacy columns</li>
          <li>Verify that a horizontal scrollbar appears at the bottom of the table</li>
          <li>Test that you can scroll horizontally to see all columns</li>
          <li>Click "Hide Metrics" to verify the scrollbar disappears when not needed</li>
          <li>Resize the browser window to test responsive behavior</li>
        </ol>
      </div>
    </div>
  );
};

export const HorizontalScrollFix: Story = {
  render: () => <ScrollFixDemo />,
};
