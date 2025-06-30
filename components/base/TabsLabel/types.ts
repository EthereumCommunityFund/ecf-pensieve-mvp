export interface TabItemLabel {
  key: string;
  label: string;
  count?: number;
}

export interface TabsLabelProps {
  tabs: TabItemLabel[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
}

export interface TabItemLabelProps {
  tab: TabItemLabel;
  isActive: boolean;
  onClick: () => void;
  isLast?: boolean;
  className?: string;
}
