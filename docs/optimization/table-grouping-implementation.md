# Table Grouping Implementation

## Overview

This document describes the implementation of table grouping functionality that allows organizing related table items into logical groups while maintaining the original item order and providing visual distinction.

## Key Features

1. **Order Preservation**: Groups maintain the original item order as defined in the configuration
2. **Visual Grouping**: Related items are visually grouped with headers and styling
3. **Flexible Configuration**: Groups can be defined for any category/subcategory
4. **Backward Compatibility**: Existing tables continue to work without groups

## Implementation Details

### 1. Type Definitions

#### New Group Enums
```typescript
export enum IItemGroupEnum {
  CodeAudits = 'Code Audits',
  ProjectLinks = 'Project Links',
  ProjectDates = 'Project Dates',
  TeamDetails = 'Team Details',
  FundingDetails = 'Funding Details',
  TokenDetails = 'Token Details',
}
```

#### Enhanced Table Row Types
```typescript
export interface IKeyItemDataForTable {
  // ... existing fields
  group?: string;
  groupTitle?: string;
}

export interface ITableProposalItem {
  // ... existing fields
  group?: string;
  groupTitle?: string;
}
```

### 2. Configuration Updates

#### Table Configuration Structure
```typescript
// Example configuration with groups
{
  key: IItemSubCategoryEnum.BasicProfile,
  title: 'Basic Profile',
  items: [
    'name', 'tagline', 'categories', 'mainDescription', 'logoUrl',
    'websiteUrl', 'appUrl', 'tags', 'whitePaper', 'dateFounded', 'dateLaunch'
  ],
  groups: [
    {
      key: IItemGroupEnum.ProjectLinks,
      title: 'Project Links',
      description: 'External links and resources',
      items: ['websiteUrl', 'appUrl', 'whitePaper'],
    },
    {
      key: IItemGroupEnum.ProjectDates,
      title: 'Project Dates',
      description: 'Important project timeline dates',
      items: ['dateFounded', 'dateLaunch'],
    },
  ],
}
```

### 3. Data Processing Logic

#### Group Information Mapping
The processing logic creates a mapping from items to their group information:

```typescript
// Create a map to find which group each item belongs to
const itemToGroupMap = new Map<string, { key: string; title: string }>();
groups.forEach((group) => {
  group.items.forEach((itemKey) => {
    itemToGroupMap.set(itemKey, { key: group.key, title: group.title });
  });
});
```

#### Row Data Enhancement
Each table row is enhanced with group information if it belongs to a group:

```typescript
const tableRowItem = {
  // ... existing fields
  ...(groupInfo && {
    group: groupInfo.key,
    groupTitle: groupInfo.title,
  }),
};
```

### 4. Visual Components

#### GroupHeader Component
```typescript
<GroupHeader
  title="Project Links"
  description="External links and resources"
  colSpan={4}
/>
```

#### Grouping Utility Function
```typescript
export function groupTableRows<T extends { group?: string; groupTitle?: string }>(
  rows: T[]
): (T | { isGroupHeader: true; group: string; groupTitle: string })[]
```

## Current Implementation Status

### ✅ Completed
- [x] Added new group enums for different categories
- [x] Updated table configuration with groups for all categories
- [x] Enhanced type definitions for table row data
- [x] Updated data processing logic in both project and proposal tables
- [x] Created GroupHeader component for visual grouping
- [x] Created groupTableRows utility function
- [x] Added Storybook documentation and examples

### ✅ ProjectDetailTable.tsx Integration
- [x] Added GroupHeader and groupTableRows imports
- [x] Enhanced data processing to include group information for both essential and non-essential items
- [x] Updated table rendering logic to use groupTableRows utility
- [x] Integrated GroupHeader component into table rendering
- [x] Maintained all existing functionality (expand/collapse, empty items, etc.)
- [x] Added proper TypeScript types and error handling
- [x] Implemented group expand/collapse functionality with state management
- [x] Added interactive GroupHeader with click handlers and visual feedback

### ✅ Group Expand/Collapse Functionality
- [x] Enhanced GroupHeader component with interactive expand/collapse
- [x] Added visual indicators (arrow icons) with smooth transitions
- [x] Implemented state management for group expanded/collapsed states
- [x] Updated groupTableRows utility to filter collapsed group items
- [x] Added click handlers and hover effects for better UX
- [x] Created interactive Storybook examples demonstrating functionality

### 🔄 Next Steps (For Future Implementation)
- [ ] Implement group-level actions (if needed)
- [ ] Add group-specific styling and animations
- [ ] Update other table components to use grouping (ProposalTable, etc.)
- [ ] Add keyboard navigation support for group headers
- [ ] Implement group persistence (remember expanded state across sessions)

## Usage Examples

### Basic Configuration
```typescript
// Items are displayed in original order: 1, [2, 3], 4
items: ['item1', 'item2', 'item3', 'item4'],
groups: [
  {
    key: IItemGroupEnum.SomeGroup,
    title: 'Some Group',
    items: ['item2', 'item3'], // These will be visually grouped
  }
]
```

### Multiple Groups
```typescript
items: ['a', 'b', 'c', 'd', 'e', 'f'],
groups: [
  {
    key: IItemGroupEnum.Group1,
    title: 'First Group',
    items: ['b', 'c'],
  },
  {
    key: IItemGroupEnum.Group2,
    title: 'Second Group',
    items: ['e', 'f'],
  }
]
// Result: a, [b, c], d, [e, f]
```

## Benefits

1. **Improved UX**: Related items are visually grouped for better organization
2. **Maintained Order**: Original item sequence is preserved
3. **Flexible**: Groups can be configured per category/subcategory
4. **Scalable**: Easy to add new groups or modify existing ones
5. **Type Safe**: Full TypeScript support with proper type definitions

## Files Modified

### Core Configuration
- `types/item.ts` - Added group enums and enhanced interfaces
- `constants/tableConfig.ts` - Added group configurations

### Data Processing
- `components/pages/project/detail/table/utils.ts` - Enhanced data preparation
- `components/pages/project/proposal/detail/table/utils.ts` - Enhanced proposal data preparation

### Type Definitions
- `components/pages/project/detail/table/ProjectDetailTableColumn.tsx` - Enhanced IKeyItemDataForTable
- `components/pages/project/proposal/detail/ProposalDetails.tsx` - Enhanced ITableProposalItem

### New Components
- `components/biz/table/GroupHeader.tsx` - Group header component
- `components/biz/table/utils.ts` - Grouping utility functions

### Updated Components
- `components/pages/project/detail/table/ProjectDetailTable.tsx` - Integrated grouping functionality

### Documentation
- `components/biz/table/GroupHeader.stories.tsx` - Component documentation
- `stories/components/biz/table/GroupingUtils.stories.tsx` - Utility documentation
- `stories/components/pages/project/detail/table/ProjectDetailTable.stories.tsx` - Integration demo

## ProjectDetailTable.tsx Changes

### 1. Imports Added
```typescript
import {
  GroupHeader,
  groupTableRows,
  // ... existing imports
} from '@/components/biz/table';
```

### 2. Data Processing Enhancement
```typescript
// Create a map to find which group each item belongs to
const itemToGroupMap = new Map<string, { key: string; title: string }>();
groups.forEach((group) => {
  group.items.forEach((itemKey) => {
    itemToGroupMap.set(itemKey, { key: group.key, title: group.title });
  });
});

// Add group information to items
const enhancedItem = groupInfo ? {
  ...item,
  group: groupInfo.key,
  groupTitle: groupInfo.title,
} : item;
```

### 3. Table Rendering Integration
```typescript
// Apply grouping to non-empty rows
const groupedNonEmptyRows = groupTableRows(
  nonEmptyRows.map((row: any) => ({
    ...row,
    group: row.original.group,
    groupTitle: row.original.groupTitle,
  }))
);

// Render grouped rows with headers
{groupedNonEmptyRows.map((item: any, itemIndex: number) => {
  if ('isGroupHeader' in item) {
    return (
      <GroupHeader
        key={`group-${item.group}-${itemIndex}`}
        title={item.groupTitle}
        colSpan={table.getAllColumns().length}
      />
    );
  }
  // ... render regular row
})}
```

### 4. Group Expand/Collapse Implementation
```typescript
// State management for group expansion
const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>({});

// Toggle function
const toggleGroupExpanded = useCallback((groupKey: string) => {
  setGroupExpanded((prev) => ({
    ...prev,
    [groupKey]: prev[groupKey] === false ? true : false, // Default expanded
  }));
}, []);

// Enhanced GroupHeader with interaction
<GroupHeader
  title={item.groupTitle}
  colSpan={table.getAllColumns().length}
  isExpanded={item.isExpanded}
  onToggle={() => toggleGroupExpanded(item.group)}
  isClickable={true}
/>
```

### 5. Enhanced GroupHeader Component
```typescript
export interface GroupHeaderProps {
  // ... existing props
  isExpanded?: boolean;
  onToggle?: () => void;
  isClickable?: boolean;
}

// Visual indicators with smooth transitions
{isClickable && (
  <div className="flex items-center justify-center w-[16px] h-[16px]">
    <svg className={cn(
      'transition-transform duration-200',
      isExpanded ? 'rotate-90' : 'rotate-0'
    )}>
      {/* Arrow icon */}
    </svg>
  </div>
)}
```

### 6. Maintained Functionality
- ✅ All existing expand/collapse behavior preserved
- ✅ Empty items handling unchanged
- ✅ Row styling and interactions maintained
- ✅ TypeScript type safety ensured
- ✅ Performance optimizations retained
- ✅ Group expand/collapse works independently of row expand/collapse
