export interface NotificationMetadata {
  /** Optional key for backward compatibility */
  key?: string;
  /** Related proposal identifier for legacy flows */
  proposalId?: number;
  /** Related item proposal identifier for legacy flows */
  itemProposalId?: number;
  /** Optional title displayed on the frontend */
  title?: string;
  /** Detailed body text for rich announcements */
  body?: string;
  /** Primary call-to-action label */
  ctaLabel?: string;
  /** Primary call-to-action URL */
  ctaUrl?: string;
  /** Default navigation target when the card is clicked */
  targetUrl?: string;
  /** Optional item identifier for deep linking */
  targetItemId?: number;
  /** Optional project identifier for deep linking */
  targetProjectId?: number;
  /** Operator wallet that triggered the notification */
  operatorWallet?: string;
  /** Operator user id that triggered the notification */
  operatorUserId?: string;
  /** Container for future extensibility */
  extra?: Record<string, unknown>;
}

export type BroadcastNotificationType = 'systemUpdate' | 'newItemsAvailable';
