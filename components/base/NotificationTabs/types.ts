export interface NotificationTabItem {
  key: string;
  label: string;
  count?: number;
}

export interface NotificationTabsProps {
  tabs: NotificationTabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
}

export interface NotificationTabItemProps {
  tab: NotificationTabItem;
  isActive: boolean;
  onClick: (event: React.MouseEvent) => void;
  className?: string;
}
