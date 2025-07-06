'use client';

import React from 'react';

import { NotificationDropdown } from './NotificationDropdown';
import { NotificationItemProps } from './NotificationItem';
import { NotificationPanel } from './NotificationPanel';

// Sample notification data based on Figma designs
const sampleNotifications: NotificationItemProps[] = [
  {
    id: '1',
    type: 'itemProposalLostLeading',
    title: 'Your input has lost sufficient support',
    itemName: 'itemname',
    projectName: 'projectname',
    timeAgo: '1h ago',
    buttonText: 'View in Project',
    isRead: false,
  },
  {
    id: '2',
    type: 'itemProposalBecameLeading',
    title: 'Your input is now leading',
    itemName: 'itemname',
    projectName: 'projectname',
    timeAgo: '1h ago',
    buttonText: 'View Submissions',
    isRead: false,
  },
  {
    id: '3',
    type: 'systemUpdate',
    title: "We've made some updates to...",
    timeAgo: '1h ago',
    buttonText: 'View Full Release Notes',
    isRead: false,
  },
  {
    id: '4',
    type: 'newItemsAvailable',
    title: 'New items are available for proposals',
    timeAgo: '1h ago',
    buttonText: 'View Update',
    isRead: false,
  },
  {
    id: '5',
    type: 'itemProposalSupported',
    title: 'User supported your input',
    itemName: 'itemname',
    projectName: 'projectname',
    userName: 'username',
    timeAgo: '1h ago',
    buttonText: 'View Submission',
    isRead: false,
  },
  {
    id: '6',
    type: 'proposalPassed',
    title: 'Your proposal has passed!',
    projectName: 'projectname',
    timeAgo: '1h ago',
    buttonText: 'View Proposal',
    hasMultipleActions: true,
    secondaryButtonText: 'View Published Project',
    isRead: true,
  },
  {
    id: '7',
    type: 'projectPublished',
    title: 'Project has been published',
    projectName: 'projectname',
    timeAgo: '0h ago',
    buttonText: 'View Published Project',
    isRead: true,
  },
  {
    id: '8',
    type: 'contributionPoints',
    title: 'You have gained contribution points',
    itemName: '000',
    timeAgo: '0h ago',
    buttonText: 'View Contribution',
    isRead: true,
  },
];

export const NotificationExample: React.FC = () => {
  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  const handleSettings = () => {
    console.log('Open settings');
  };

  const handleArchiveAll = () => {
    console.log('Archive all notifications');
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-xl font-bold">Notification Dropdown</h2>
        <NotificationDropdown />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Notification Panel</h2>
        <NotificationPanel />
      </div>
    </div>
  );
};
