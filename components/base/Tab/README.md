# Tab Component

A reusable tab navigation component built with Hero UI, following Figma design specifications.

## Features

- **Pure UI Component**: No business logic, fully controlled by parent components
- **Figma Design Compliant**: Implements exact visual specifications from Figma design
- **Hero UI Integration**: Built using Hero UI Button component
- **State Management**: Supports active/inactive states with proper styling
- **Count Display**: Optional count badges for tabs
- **Responsive**: Flexible layout that adapts to content

## Usage

```tsx
import Tab from '@/components/Tab';
import { TabItem } from '@/components/Tab/types';

const MyComponent = () => {
  const [activeTab, setActiveTab] = useState('displayed');

  const tabs: TabItem[] = [
    { key: 'displayed', label: 'Displayed' },
    { key: 'submission-queue', label: 'Submission Queue', count: 3 },
    { key: 'consensus-log', label: 'Consensus Log' },
  ];

  return (
    <Tab
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};
```

## Props

### Tab Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tabs` | `TabItem[]` | Yes | Array of tab items to display |
| `activeTab` | `string` | Yes | Key of the currently active tab |
| `onTabChange` | `(tabKey: string) => void` | Yes | Callback when tab is clicked |
| `className` | `string` | No | Additional CSS classes |

### TabItem Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | Yes | Unique identifier for the tab |
| `label` | `string` | Yes | Display text for the tab |
| `count` | `number` | No | Optional count badge |

## Design Specifications

- **Container**: `#EBEBEB` background with `10px` border radius and `5px` padding
- **Active Tab**: White background with `rgba(0,0,0,0.1)` border and `10px` border radius
- **Inactive Tab**: `rgba(0,0,0,0.05)` background with `5px` border radius
- **Typography**: `14px` font size, `600` font weight, Open Sans font family
- **Count Badge**: `30%` opacity for count numbers

## File Structure

```
components/Tab/
├── index.tsx          # Main Tab component
├── TabItem.tsx        # Individual tab item component
├── types.ts           # TypeScript type definitions
└── README.md          # This documentation
```

## Storybook

View the component in Storybook:
- Default: Shows all three tabs with count
- Without Count: Shows tabs without count badges
- Two Tabs: Shows minimal two-tab layout
- Long Labels: Tests with longer tab names

## Migration Notes

This component was extracted from `LeftContent.tsx` in the modal directory to create a reusable tab component. The original implementation has been updated to use this new component while maintaining all existing functionality.
