export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
}

export interface TabItemProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}
