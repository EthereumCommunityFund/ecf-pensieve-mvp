export { DatabaseNotificationQueue } from './DatabaseQueue';
export type { QueueOptions, QueueStats } from './DatabaseQueue';

import { DatabaseNotificationQueue } from './DatabaseQueue';

export const notificationQueue = new DatabaseNotificationQueue();
